const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");
const Seller = require("../models/Seller");
const Product = require("../models/Product");

router.put("/edit-shop", async (req, res) => {
  const { shop, shopId, images } = req.body;

  try {
    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      { ...shop, images },
      { new: true, runValidators: true }
    );

    if (!updatedShop) {
      return res.json({ success: false, message: "Shop not found!" });
    }

    res.json({ success: true, message: "Shop updated successfully!" });
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/add-shop", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  jwt.verify(sellerToken, process.env.JWT_SECRET_KEY, async (err, seller) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    try {
      const existingSeller = await Seller.findById(seller.sellerID);

      if (!existingSeller) {
        return res.status(404).json({ success: false, message: "Seller not found" });
      }

      if (existingSeller.shop) {
        return res.json({ success: false, message: "Shop already exists!" });
      }

      const { shop, images } = req.body;
      const newShop = new Shop({ ...shop, owner: existingSeller._id, images });

      await newShop.save();
      existingSeller.shop = newShop._id;
      await existingSeller.save();

      res.status(201).json({ success: true, message: "Shop added successfully", shop: newShop });
    } catch (error) {
      console.error("Error adding shop:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
});

router.post("/add-product", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
    const existingSeller = await Seller.findById(decoded.sellerID);

    if (!existingSeller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const { product, images } = req.body;
    if (!product.name || !product.price || !product.dietType) {
      return res.status(400).json({ success: false, message: "Missing required product fields" });
    }

    const shop = await Shop.findById(existingSeller.shop);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const newProduct = new Product({
      ...product,
      images,
      shop: shop._id,
      shopName: shop.name,
      shopType: shop.category,
      seller: existingSeller,
    });

    await newProduct.save();

    existingSeller.products.push(newProduct._id);
    await existingSeller.save();

    shop.products.push(newProduct._id);
    await shop.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      shop,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/edit-product", async (req, res) => {
  const { product, productId, images } = req.body;

  if (!productId || !product || !images) {
    return res.status(400).json({
      success: false,
      message: "Bad Request: Missing required fields",
    });
  }

  try {
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...product, images },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // Handle any other errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/get-products", async (req, res) => {
  try {
    const { sellerToken } = req.cookies;
    
    if (!sellerToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    // Verify Token
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
    if (!decoded?.sellerID) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    // Find Seller
    const existingSeller = await Seller.findById(decoded.sellerID).lean();
    if (!existingSeller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Fetch Products
    const products = await Product.find({ shop: existingSeller.shop }).lean();

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/update-stock", async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: "Product ID is required" });
  }

  try {
    // Check Product Existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Toggle Stock
    product.inStock = !product.inStock;
    await product.save();

    res.status(200).json({ success: true, message: "Stock Info Updated!" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getProduct/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (product) {
      res.json({ success: true, product, message: "Product details fetched!" });
    } else {
      res.json({ success: false, message: "Failed to get product details!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getShop/:shopId", async (req, res) => {
  const { shopId } = req.params;

  try {
    const shop = await Shop.findById(shopId);

    if (shop) {
      res.json({ success: true, shop, message: "Shop details fetched!" });
    } else {
      res.json({ success: false, message: "Failed to get shop details!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getShopAndProducts/:shopId", async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    const products = await Product.find({ shop: req.params.shopId });

    res.status(200).json({ shop, products });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/seller-profile", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);

    const existingSeller = await Seller.findById(decoded.sellerID)
      .select("username email sales shop")
      .populate({
        path: "shop",
        select: "name category productCategories address isOpen images",
      });

    if (!existingSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.status(200).json({ success: true, seller: existingSeller });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/update-status", async (req, res) => {
  const { sellerToken } = req.cookies;
  const { isOpen } = req.body;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);

    const existingSeller = await Seller.findById(decoded.sellerID).populate(
      "shop"
    );

    if (!existingSeller || !existingSeller.shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    existingSeller.shop.isOpen = isOpen;
    await existingSeller.shop.save();

    res.status(200).json({
      success: true,
      message: "Shop status updated successfully!",
    });
  } catch (error) {
    console.error("Error updating shop status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/update-profile", async (req, res) => {
  const { sellerToken } = req.cookies;
  const { username, email } = req.body;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);

    // Find seller and populate shop
    const existingSeller = await Seller.findById(decoded.sellerID).populate(
      "shop"
    );

    if (!existingSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // Update Seller Details
    if (username) existingSeller.username = username;
    if (email) existingSeller.email = email;

    await existingSeller.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/get-restaurants", async (req, res) => {
  try {
    const restaurants = await Shop.find({ category: { $ne: "Groceries" } });

    if (!restaurants || restaurants.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No restaurants found" });
    }

    res.status(200).json({ success: true, restaurants });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
