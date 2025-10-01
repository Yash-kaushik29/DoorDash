const express = require("express");
const User = require("../models/User");
const Seller = require("../models/Seller");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/unread-order-notifications", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
    const existingSeller = await Seller.findById(
      decoded.sellerID,
      "notifications"
    );

    if (!existingSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const unread = existingSeller.notifications.filter(
      (notif) => notif.read === false && notif.order
    );

    res.json({ success: true, count: unread.length });
  } catch (err) {
    console.error("Error fetching unread notifications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/getNotifications", authenticateUser, async (req, res) => {
  try {
    const currUser = req.user; // from middleware

    if (!currUser) 
      return res.status(404).json({ message: "User not found" });

    // Sort notifications from latest to oldest
    const sortedNotifications = (currUser.notifications || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, notifications: sortedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/readNotification", authenticateUser, async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res
        .status(400)
        .json({ message: "Notification ID is required" });
    }

    const currUser = req.user; 

    const notification = currUser.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;

    await currUser.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/getSellerNotifications", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
    const existingSeller = await Seller.findById(
      decoded.sellerID,
      "notifications"
    );

    if (!existingSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const sortedNotifications = existingSeller.notifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      notifications: sortedNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/read/:id", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Invalid token" });
      }

      try {
        const existingSeller = await Seller.findById(seller.sellerID);
        if (!existingSeller) {
          return res
            .status(404)
            .json({ success: false, message: "Seller not found" });
        }

        // Find the notification by ID
        const notificationIndex = existingSeller.notifications.findIndex(
          (notif) => notif._id.toString() === req.params.id
        );

        if (notificationIndex === -1) {
          return res
            .status(404)
            .json({ success: false, message: "Notification not found" });
        }

        // Mark the notification as read
        existingSeller.notifications[notificationIndex].read = true;

        // Save the updated seller document
        await existingSeller.save();

        res.status(200).json({
          success: true,
          message: "Notification marked as read",
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

module.exports = router;
