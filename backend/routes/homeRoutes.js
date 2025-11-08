const express = require('express');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

const router = express.Router();

router.get('/get-popular-shops', async(req, res) => {
    try {
        const shops = await Shop.find();
        res.json({success: true, shops});
    } catch(error) {
        console.log(error)
        res.json({success: false, message: "Error Loading the data!"});
    }
});

router.get('/get-popular-products', async(req, res) => {
    try {
        const products = await Product.find().limit(6);
        res.json({success: true, products});
    } catch(error) {
        console.log(error)
        res.json({success: false, message: "Error Loading the data!"});
    }
});

module.exports = router;