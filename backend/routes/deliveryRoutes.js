const express = require("express");
const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { username, phone, password, secretKey } = req.body;

  if (secretKey !== process.env.DELIVERY_SECRET_KEY) {
    return res.status(403).json({ message: "Invalid secret key" });
  }

  try {
    const existingUser = await DeliveryBoy.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new DeliveryBoy({
      name: username,
      phone,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await DeliveryBoy.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    var token = jwt.sign(
      {
        id: user._id,
        phone: user.phone || "",
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );
    res
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders for the delivery boy
router.get("/orders/:deliveryBoyId", async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    const orders = await Order.find({ deliveryBoy: deliveryBoyId })
      .select("deliveryStatus")
      .lean();

    // Default response if no orders
    if (!orders.length) {
      return res.json({
        pendingOrders: 0,
        commission: 0, // nothing earned
      });
    }

    const pendingOrders = orders.filter(
      (order) => !["Delivered", "Cancelled"].includes(order.deliveryStatus)
    ).length;

    // ---- Calculate today's commission ----
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysCommissions = deliveryBoy.commissionHistory.filter(
      (entry) => entry.time >= startOfDay && entry.time <= endOfDay
    );

    const todayCommission = todaysCommissions.reduce(
      (sum, entry) => sum + (entry.commission || 0),
      0
    );

    res.json({
      outstandingAmount: deliveryBoy.outstandingAmount,
      pendingOrders,
      commission: todayCommission,
    });
  } catch (error) {
    console.error("Error fetching delivery boy orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/outstandingAmounts/:deliveryBoyId", async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).populate({
      path: "outstandingPayments.orderId",
      select: "id", 
    });

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    res.json({
      success: true,
      outstandingPayments: deliveryBoy.outstandingPayments,
    });
  } catch (error) {
    console.error("Error fetching outstanding amounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/orders", async (req, res) => {
  const { page = 1, limit = 10, status, deliveryBoyId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = {};

  if (deliveryBoyId) filter.deliveryBoy = deliveryBoyId; // Add index-based query optimization
  if (status) {
    if (status.toLowerCase() === "delivered") {
      filter.deliveryStatus = "Delivered";
    } else if (status.toLowerCase() === "pending") {
      filter.deliveryStatus = { $nin: ["Delivered", "Cancelled"] }; // Fix condition
    }
  }

  try {
    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .select("id totalAmount paymentStatus deliveryStatus createdAt items")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), 
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-available-orders", async (req, res) => {
  try {
    const availableOrders = await Order.find({
      deliveryBoyAssigned: false,
    })
      .populate("user", "username phone")
      .populate("items.product", "name shopName")
      .populate("items.seller", "username shop");

    res.json({
      success: true,
      orders: availableOrders,
    });
  } catch (error) {
    console.error("Error fetching available orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/orders/:orderId/accept", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryBoyId } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.deliveryBoyAssigned || order.deliveryBoy) {
      return res
        .status(400)
        .json({ success: false, message: "Order already assigned" });
    }

    await Order.updateOne(
      { _id: orderId },
      { deliveryBoy: deliveryBoyId, deliveryBoyAssigned: true }
    );
    await order.save();

    res.json({ success: true, message: "Order accepted", order });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .select(
        "items user deliveryStatus createdAt shippingAddress id totalAmount paymentStatus"
      )
      .populate("items.product", "name shopName")
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/order/confirm-pickup", async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items = order.items.map((item) => ({
      ...item,
      status: "Out For Delivery",
    }));

    order.deliveryStatus = "Out For Delivery";

    await order.save();

    res.json({
      success: true,
      message: "Order marked as Out For Delivery!",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.put("/order/confirm-delivery/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("deliveryBoy");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // 1. Update order status
    order.deliveryStatus = "Delivered";
    order.paymentStatus = "Paid";
    order.items = order.items.map((item) => ({
      ...item,
      status: item.status !== "Cancelled" ? "Delivered" : item.status,
    }));

    // 2. Track seller earnings
    const sellerSalesMap = {};
    for (const item of order.items) {
      if (item.status !== "Cancelled" && item.product.seller) {
        const sellerId = item.product.seller.toString();
        const unitPrice = order.orderType === 'Food' ? item.product.basePrice : item.product.price;
        const amount = item.quantity * parseFloat(unitPrice);

        if (!sellerSalesMap[sellerId]) {
          sellerSalesMap[sellerId] = 0;
        }
        sellerSalesMap[sellerId] += amount;
      }
    }

    // 3. Update sellers’ sales history
    for (const sellerId in sellerSalesMap) {
      const seller = await Seller.findById(sellerId);

      if (!seller) continue;

      const totalAmount = sellerSalesMap[sellerId];
      const commissionRate = seller.commissionRate || 0; 
      const sellerEarnings = totalAmount * (1 - commissionRate);

      await Seller.findByIdAndUpdate(sellerId, {
        $push: {
          salesHistory: {
            order,
            amount: sellerEarnings,
            date: new Date(),
          },
        },
      });
    }

    // 4. Update delivery boy’s commission
    if (order.deliveryBoy && order.deliveryCharge) {
      const deliveryBoy = await DeliveryBoy.findById(order.deliveryBoy._id);

      if (!deliveryBoy) return res.status(404).json({ message: "Delivery boy not found" });

      
      deliveryBoy.commissionHistory.push({
        commission: (order.deliveryCharge || 0) + (order.convenienceFees || 0),
      });

      if (order.paymentMethod === "COD") {
        const totalCOD = order.amount + order.deliveryCharge + order.convenienceFees + order.taxes + order.serviceCharge - order.discount; 
        deliveryBoy.outstandingPayments.push({
          orderId,
          amount: totalCOD,
          collectedAt: new Date(),
        });
        deliveryBoy.outstandingAmount += totalCOD;
      }

      await deliveryBoy.save();
    }

    await order.save();

    res.json({
      success: true,
      message:
        "Order confirmed as delivered, seller earnings updated, and delivery boy commission added",
    });
  } catch (error) {
    console.error("Error confirming order delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:deliveryBoyId/commissionHistory", async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).select(
      "commissionHistory"
    );

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    const sortedHistory = deliveryBoy.commissionHistory.sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );

    res.json({ commissionHistory: sortedHistory });
  } catch (error) {
    console.error("Error fetching commission history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
