const express = require("express");
const User = require("../models/User");
const Seller = require("../models/Seller");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/authMiddleware");
const authenticateSeller = require('../middleware/sellerAuthMiddleware');

const router = express.Router();

router.get("/unread-order-notifications", authenticateSeller, async (req, res) => {
  try {
    const existingSeller = req.seller; 

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

router.get("/getSellerNotifications", authenticateSeller, async (req, res) => {
  try {
    const existingSeller = req.seller; 

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

router.put("/read/:id", authenticateSeller, async (req, res) => {
  try {
    const existingSeller = req.seller; 
    const notifId = req.params.id;

    const notificationIndex = existingSeller.notifications.findIndex(
      (notif) => notif._id.toString() === notifId
    );

    if (notificationIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Mark as read
    existingSeller.notifications[notificationIndex].read = true;

    await existingSeller.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
