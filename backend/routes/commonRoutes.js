const express = require("express");
const Shop = require("../models/Shop");
const Product = require('../models/Product');

const router = express.Router();

router.get("/get-groceries-shop", async (req, res) => {
  try {
    const shops = await Shop.find();
    res.send({success: true, shops});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/get-restaurants", async (req, res) => {
    try {
      const shops = await Shop.find({category: "Restaurant"});
      res.send({success: true, shops});
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/get-products", async (req, res) => {
  try {
    const products = await Product.find({shopType: "Restaurant"});
    res.send({success: true, products});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    // Split query into words for better matching
    const queryWords = query.split(" ").map((word) => new RegExp(word, "i"));

    const products = await Product.find({
      $or: [
        { name: { $in: queryWords } }, // Match words in name
        { categories: { $in: queryWords } } // Match words in categories
      ]
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("shop");

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
