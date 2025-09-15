const express = require("express");
const Shop = require("../models/Shop");
const Product = require('../models/Product');

const router = express.Router();

router.get("/groceries", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query = { shopType: "Groceries" }; 
    const options = {
      skip: (pageNumber - 1) * limitNumber,
      limit: limitNumber,
      sort: { createdAt: -1 }, 
    };

    const products = await Product.find(query, null, options);
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      total,
      hasMore: pageNumber * limitNumber < total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
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

    const products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } } // get relevance score
    )
      .sort({ score: { $meta: "textScore" } }) // sort by relevance
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
