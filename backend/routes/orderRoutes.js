const express = require("express");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/create-order", async (req, res) => {
  const { userId, cartItems, address, paymentStatus, deliveryCharge } =
    req.body;

  try {
    let totalAmount = deliveryCharge;
    let sellersNotified = [];

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product).populate("seller");
        if (!product) {
          throw new Error("Product not found");
        }

        const sellerId = product.seller._id.toString();
        if (!sellersNotified.includes(sellerId)) {
          sellersNotified.push(sellerId);
        }

        totalAmount += product.price * item.quantity;

        return {
          product: item.product,
          seller: sellerId,
          quantity: item.quantity,
        };
      })
    );

    // Create a single order for the user
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: address,
      amount: totalAmount,
      deliveryStatus: "Processing",
      deliveryCharge,
      paymentStatus,
      sellersNotified,
    });

    await newOrder.save();

    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          message: `Your order with order ID: #${newOrder.id} is processed.`,
          url: `/order/${newOrder._id}`,
        },
      },
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        orders: newOrder,
      },
    });

    // Notify sellers about new orders
    await Promise.all(
      sellersNotified.map((sellerId) =>
        Seller.findByIdAndUpdate(sellerId, {
          $push: {
            notifications: {
              order: newOrder._id,
              message: `New order received. You need to prepare ${
                orderItems.filter((item) => item.seller === sellerId).length
              } items.`,
            },
            orders: newOrder._id,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getOrderDetails/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id })
      .populate({
        path: "items.product",
        select: "name price shopName", // ✅ Fetch product details
      })
      .populate("user", "name email phone") // ✅ Fetch user details in a cleaner way
      .lean(); // ✅ Converts Mongoose document to plain object for better performance

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order!" });
  }
});

router.get("/getOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      try {
        const existingSeller = await Seller.findById(seller.sellerID);

        if (!existingSeller) {
          return res
            .status(404)
            .json({ success: false, message: "Seller not found" });
        }

        const order = await Order.findById(orderId)
          .populate("items.product", "name price images")
          .lean(); // ✅ Using lean() for performance

        if (!order) {
          return res
            .status(404)
            .json({ success: false, message: "Order not found" });
        }

        const sellerProducts = order.items
          .filter(
            (item) => item.seller.toString() === existingSeller._id.toString()
          )
          .map((item) => ({
            _id: item.product._id,
            productName: item.product.name,
            price: item.product.price,
            image: item.product.images[0],
            quantity: item.quantity,
            status: item.status,
          }));

        await Seller.updateOne(
          {
            _id: seller.sellerID,
            "notifications.order": orderId,
          },
          {
            $set: { "notifications.$.read": true },
          }
        );

        res.status(200).json({
          success: true,
          orderId: order.id,
          products: sellerProducts,
        });
      } catch (error) {
        console.error("Error fetching order:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

router.put("/confirm-order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { selectedProducts } = req.body;
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      try {
        const existingSeller = await Seller.findById(seller.sellerID);
        if (!existingSeller) {
          return res
            .status(404)
            .json({ success: false, message: "Seller not found" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return res
            .status(404)
            .json({ success: false, message: "Order not found" });
        }

        let isUpdated = false;
        order.items.forEach((item) => {
          if (item.seller.toString() === seller.sellerID.toString()) {
            if (selectedProducts.includes(item.product.toString())) {
              item.status = "Preparing";
            } else {
              item.status = "Cancelled";
            }
            isUpdated = true;
          }
        });

        if (isUpdated) {
          await order.save();
        }

        res
          .status(200)
          .json({ success: true, message: "Order updated successfully" });
      } catch (error) {
        console.error("Error confirming order:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

router.get("/getAllOrders", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      try {
        const existingSeller = await Seller.findById(seller.sellerID)
          .populate({
            path: "orders",
            populate: {
              path: "items.product",
              select: "id name price",
            },
            select: "id items amount deliveryStatus createdAt",
            options: { sort: { createdAt: -1 } },
          })
          .lean(); // ✅ Better performance

        if (!existingSeller) {
          return res
            .status(404)
            .json({ success: false, message: "Seller not found" });
        }

        res.status(200).json({ success: true, orders: existingSeller.orders });
      } catch (error) {
        console.error("Error fetching orders:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

router.get("/getUserOrders", async (req, res) => {
  const { token } = req.cookies;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    try {
      const existingUser = await User.findById(user.userID);

      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Pagination logic
      const totalOrders = await Order.countDocuments({
        user: existingUser._id,
      });
      const totalPages = Math.ceil(totalOrders / limit);

      const orders = await Order.find({ user: existingUser._id })
        .populate({
          path: "items.product",
          select: "id name price",
        })
        .select("id items amount deliveryStatus createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        orders,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  });
});

module.exports = router;
