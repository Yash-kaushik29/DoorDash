const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category) {
      query.categories = { $in: [category] };
    }

    const products = await Product.find(query);

    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;