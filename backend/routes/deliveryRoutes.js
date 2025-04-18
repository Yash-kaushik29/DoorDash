const express = require("express");
const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Seller = require('../models/Seller')
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
      .cookie("token", token)
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

    const orders = await Order.find({ deliveryBoy: deliveryBoyId })
      .select("deliveryStatus")
      .lean(); // Optimize performance

    if (!orders.length) {
      return res.json({ assignedOrders: 0, deliveredOrders: 0, pendingOrders: 0 });
    }

    const assignedOrders = orders.length;
    const deliveredOrders = orders.filter(order => order.deliveryStatus === "Delivered").length;
    const pendingOrders = orders.filter(order => !["Delivered", "Cancelled"].includes(order.deliveryStatus)).length; // Fix condition

    res.json({ assignedOrders, deliveredOrders, pendingOrders });
  } catch (error) {
    console.error("Error fetching delivery boy orders:", error);
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
        .select("id amount paymentStatus deliveryStatus createdAt items")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Optimize performance
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

// routes/orderRoutes.js
router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .select("items user deliveryStatus createdAt shippingAddress id amount paymentStatus")
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
  const { orderId, productId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    let updated = false;
    let count = 0;

    order.items = order.items.map((item) => {
      if (item.product.toString() === productId) {
        item.status = "Out For Delivery";
        updated = true;
      }
      if (item.status === "Out For Delivery") count++;
      return item;
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found in order" });
    }

    if (count === order.items.length) order.deliveryStatus = "Out For Delivery";
    await order.save();

    res.json({ success: true, message: "Marked as Out for Delivery!" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/order/confirm-delivery/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update order delivery and payment status
    order.deliveryStatus = "Delivered";
    order.paymentStatus = "Paid";
    order.items = order.items.map(item => ({
      ...item,
      status: item.status !== "Cancelled" ? "Delivered" : item.status,
    }));

    // Calculate sales per seller
    const sellerSalesMap = {};

    for (const item of order.items) {
      if (item.status !== "Cancelled" && item.product.seller) {
        const sellerId = item.product.seller.toString();
        const amount = item.quantity * parseFloat(item.product.price);

        if (!sellerSalesMap[sellerId]) {
          sellerSalesMap[sellerId] = 0;
        }
        sellerSalesMap[sellerId] += amount;
      }
    }

    // Update each seller's salesHistory
    for (const sellerId in sellerSalesMap) {
      await Seller.findByIdAndUpdate(sellerId, {
        $push: { salesHistory: { orderId, amount: sellerSalesMap[sellerId], date: new Date() } }
      });
    }

    await order.save();
    res.json({ success: true, message: "Order confirmed as delivered, and sales updated" });

  } catch (error) {
    console.error("Error confirming order delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
