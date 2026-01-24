const express = require("express");
const Shop = require("../models/Shop");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

router.get("/get-popular-shops", async (req, res) => {
  try {
    const shops = await Shop.find({ category: { $ne: "Grocery" } }).sort({priority: -1});
    res.json({ success: true, shops });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error Loading the data!" });
  }
});

router.get("/get-popular-products", async (req, res) => {
  try {
    const products = await Product.find({
      shopName: "TONIQ - Dry Bar & Kitchen",
      inStock: true,
    }).populate("shop", "shopDiscount").limit(20);

    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: "Error Loading the data!" });
  }
});

const FIXED_ORDER_IDS = [
  "WR3QR8",
  "8HMSZ2",
  "WSB9U1",
  "30VWKV",
  "UG6ONP",
  "BQLXRW",
  "NC1ACC",
];

router.get("/reviews/latest", async (req, res) => {
  try {
    const reviews = await Order.find({
      id: { $in: FIXED_ORDER_IDS },
      overallRatings: { $gt: 0 },
    })
      .select("id review appRatings deliveryRatings overallRatings user")
      .populate("user", "username");

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Latest Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
