const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");
const Order = require("../models/Order");
const Product = require("../models/Product");
const DeliveryBoy = require("../models/DeliveryBoy");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  try {
    // Check if the email is already in use
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res.json({ success: false, message: "Email already in use!" });
    }

    // Verify the secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.json({
        success: false,
        message: "Secret key does not match!",
      });
    }

    // Hash the password and create a new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    // Success response
    res
      .status(201)
      .json({ success: true, message: "Admin account created successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, secretKey } = req.body;

  try {
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: email });
    if (!existingAdmin) {
      return res.json({ success: false, message: "Admin not found!" });
    }

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.json({
        success: false,
        message: "Secret key does not match!",
      });
    }

    // Compare the entered password with the hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid password!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: existingAdmin._id, email: existingAdmin.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    // Send token as an HTTP-only cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Logged in successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.get("/dashboard-overview", async (req, res) => {
  try {
    const { adminToken } = req.cookies;

    if (!adminToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    jwt.verify(
      adminToken,
      process.env.JWT_SECRET_KEY,
      {},
      async (err, admin) => {
        if (err) {
          return res
            .status(403)
            .json({ success: false, message: "Invalid token" });
        }

        try {
          const existingAdmin = await Admin.findById(admin.adminId);
          if (!existingAdmin) {
            return res
              .status(404)
              .json({ success: false, message: "Admin not found" });
          }

          const [orders, activeDeliveryBoys, availableDeliveryBoys] =
            await Promise.all([
              Order.find(
                {},
                "amount deliveryCharge taxes convenienceFees createdAt deliveryStatus"
              ),
              DeliveryBoy.countDocuments({}),
              DeliveryBoy.countDocuments({ isAvailable: true }),
            ]);

          // Orders Overview
          const totalOrders = orders.length;
          const pendingOrders = orders.filter(
            (order) => order.deliveryStatus === "Processing"
          ).length;
          const deliveredOrders = orders.filter(
            (order) => order.deliveryStatus === "Delivered"
          ).length;

          // Sales Calculation
          const totalSales = orders.reduce(
            (sum, order) =>
              sum +
              order.amount +
              order.taxes +
              order.deliveryCharge +
              order.convenienceFees,
            0
          );
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todaySales = orders
            .filter((order) => new Date(order.createdAt) >= today)
            .reduce(
              (sum, order) =>
                sum +
                order.amount +
                order.taxes +
                order.deliveryCharge +
                order.convenienceFees,
              0
            );

          const result = await DeliveryBoy.aggregate([
            {
              $group: {
                _id: null,
                totalOutstanding: { $sum: "$outstandingAmount" },
              },
            },
          ]);

          const totalOutstanding =
            result.length > 0 ? result[0].totalOutstanding : 0;

          res.json({
            success: true,
            data: {
              orders: {
                total: totalOrders,
                pending: pendingOrders,
                delivered: deliveredOrders,
              },
              sales: { total: totalSales, today: todaySales },
              deliveryBoys: {
                active: activeDeliveryBoys,
                available: availableDeliveryBoys,
              },
              outstandingAmount: totalOutstanding,
            },
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }
      }
    );
  } catch (error) {
    console.error("Unexpected server error:", error);
    res
      .status(500)
      .json({ success: false, message: "Unexpected error occurred" });
  }
});

router.get("/getOrdersByMonth", async (req, res) => {
  const { adminToken } = req.cookies;
  let { page = 1, limit = 10, filter } = req.query;

  if (!adminToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(adminToken, process.env.JWT_SECRET_KEY, async (err, admin) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    try {
      page = parseInt(page);
      limit = parseInt(limit);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const filterQuery =
        filter && filter !== "All" ? { deliveryStatus: filter } : {};

      const orders = await Order.find({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        ...filterQuery,
      })
        .select("id items amount deliveryStatus paymentStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const totalOrders = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        ...filterQuery,
      });

      res.json({
        success: true,
        orders,
        totalOrders,
        hasMore: page * limit < totalOrders,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });
});

// Get order details by orderId
router.get("/getOrderById/:orderId", async (req, res) => {
  const { adminToken } = req.cookies;
  const { orderId } = req.params;

  if (!adminToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(adminToken, process.env.JWT_SECRET_KEY, {}, async (err, admin) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    try {
      // Fetching the order and populating necessary fields
      const order = await Order.findOne({ id: orderId })
        .populate("items.product", "name price shopName") // Product details
        .populate("deliveryBoy", "name email phone"); // Delivery boy details

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      res.json({ success: true, order });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });
});

// Get all delivery boys
router.get("/getAllDeliveryBoys", async (req, res) => {
  const { adminToken } = req.cookies;

  if (!adminToken) {
    return res.json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(adminToken, process.env.JWT_SECRET_KEY, {}, async (err, admin) => {
    if (err) {
      return res.json({ success: false, message: "Invalid token" });
    }

    try {
      const deliveryBoys = await DeliveryBoy.find({ isAvailable: true }).select(
        "name phone"
      );
      res.json({ success: true, deliveryBoys });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });
});

router.put("/updateDeliveryStatus", async (req, res) => {
  const { adminToken } = req.cookies;
  const { orderId } = req.body;

  if (!adminToken) {
    return res.json({ success: false, message: "Unauthorized access" });
  }

  if (!orderId) {
    return res.json({ success: false, message: "Order ID is required" });
  }

  jwt.verify(adminToken, process.env.JWT_SECRET_KEY, {}, async (err, admin) => {
    if (err) {
      return res.json({ success: false, message: "Invalid token" });
    }

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }

      if (order.deliveryStatus !== "Processing") {
        return res.json({
          success: false,
          message:
            "Order cannot be updated. Allowed only when status is 'Processing'.",
        });
      }

      order.deliveryStatus = "Preparing";

      order.items = order.items.map((item) => ({
        ...item.toObject(),
        status: "Preparing"
      }));

      await order.save();

      return res.json({
        success: true,
        message: "Order and items updated to Preparing",
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });
});

// Assign/Change Delivery Boy
router.post("/assignDeliveryBoy", async (req, res) => {
  const { adminToken } = req.cookies;
  const { orderId, deliveryBoyId } = req.body;

  if (!adminToken) {
    return res.json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(adminToken, process.env.JWT_SECRET_KEY, {}, async (err, admin) => {
    if (err) {
      return res.json({ success: false, message: "Invalid token" });
    }

    try {
      await Order.updateOne(
        { _id: orderId },
        { deliveryBoy: deliveryBoyId, deliveryBoyAssigned: true }
      );
      res.json({
        success: true,
        message: "Delivery boy assigned successfully",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });
});

// Get all sellers with shop details populated
router.get("/sellers", async (req, res) => {
  try {
    const sellers = await Seller.find({})
      .populate("shop", "name category")
      .lean();

    res.json(sellers);
  } catch (err) {
    console.error("Error fetching sellers:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get seller and shop details by seller ID
router.get("/seller/:id", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate("shop").lean();

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(seller);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get products sold by the seller
router.get("/seller/:id/products", async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.id }).lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/seller/:sellerId/sales", async (req, res) => {
  try {
    const { sellerId } = req.params;
    let { date } = req.query;

    // If date not provided, use today's date
    if (!date) {
      date = new Date().toISOString().split("T")[0];
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // Filter sales for that date
    const filteredSales = seller.salesHistory.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    // Map to return only date & amount
    const salesData = filteredSales.map((sale) => ({
      date: sale.date,
      amount: sale.amount || 0,
    }));

    res.json({
      success: true,
      date,
      totalEarnings: salesData,
    });
  } catch (error) {
    console.error("Error fetching seller sales:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 15 } = req.query;

    // Ensure pagination params are integers
    const currentPage = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 15;

    if (currentPage < 1 || pageSize < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pagination values" });
    }

    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("seller", "username email")
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean(); // Optimize query performance

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get user details by ID
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("username email createdAt orders")
      .populate({
        path: "orders",
        select: "id amount paymentStatus deliveryStatus createdAt items",
        populate: {
          path: "items.product",
          model: "Product",
          select: "name price image",
        },
      })
      .lean(); // Improves performance

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.put("/cancelOrder", async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.deliveryStatus === "Delivered") {
      return res.json({
        success: false,
        message: "Delivered orders cannot be cancelled",
      });
    }

    order.deliveryStatus = "Cancelled";
    order.paymentStatus = "--"; // Adjust as needed

    // Update item statuses
    order.items = order.items.map((item) => ({
      ...item,
      status: item.status !== "Delivered" ? "Cancelled" : item.status,
    }));

    await order.save();

    res.json({
      success: true,
      message: "Order has been cancelled successfully",
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/outstanding/list", async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find(
      {},
      "_id name phone outstandingAmount"
    );

    res.json({
      success: true,
      deliveryBoys,
    });
  } catch (error) {
    console.error("Error fetching outstanding amounts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/deliveryBoy/:deliveryBoyId", async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId)
      .populate("outstandingPayments.orderId")
      .lean();

    console.log(deliveryBoy);

    if (deliveryBoy?.outstandingPayments) {
      deliveryBoy.outstandingPayments.sort(
        (a, b) => new Date(b.collectedAt) - new Date(a.collectedAt)
      );
    }

    if (!deliveryBoy)
      return res
        .status(404)
        .json({ success: false, message: "Delivery boy not found" });

    res.json({ success: true, deliveryBoy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/deliveryBoy/clearOutstanding/:deliveryBoyId", async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    // Mark all unsettled payments as settled
    deliveryBoy.outstandingPayments = deliveryBoy.outstandingPayments.map((p) =>
      p.status === "unsettled"
        ? { ...p.toObject(), status: "settled", settledAt: Date.now() }
        : p
    );

    // Reset outstanding amount
    deliveryBoy.outstandingAmount = 0;

    await deliveryBoy.save();

    res.json({
      message: "Outstanding payments cleared successfully",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Error clearing outstanding payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
