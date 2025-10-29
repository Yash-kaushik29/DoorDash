const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const authenticateSeller = require("../middleware/sellerAuthMiddleware");
const QRCode = require('qrcode');

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

router.post("/add-shop", authenticateSeller, async (req, res) => {
  try {
    const existingSeller = req.seller;

    if (existingSeller.shop) {
      return res.json({ success: false, message: "Shop already exists!" });
    }

    const { shop, images } = req.body;

    const newShop = new Shop({
      ...shop,
      owner: existingSeller._id,
      images,
    });

    await newShop.save();

    existingSeller.shop = newShop._id;
    await existingSeller.save();

    res.status(201).json({
      success: true,
      message: "Shop added successfully",
      shop: newShop,
    });
  } catch (error) {
    console.error("Error adding shop:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/add-product", authenticateSeller, async (req, res) => {
  try {
    const existingSeller = req.seller; // comes from middleware
    const { product, images } = req.body;

    if (!product.name || !product.price || !product.dietType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required product fields" });
    }

    const shop = await Shop.findById(existingSeller.shop);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    const newProduct = new Product({
      ...product,
      images,
      shop: shop._id,
      shopName: shop.name,
      shopType: shop.category,
      seller: existingSeller._id,
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

// Only for bulk addition by adminK
router.post("/add-products", async (req, res) => {
  const authHeader = req.headers["authorization"];
  let sellerToken = req.cookies?.sellerToken || authHeader;

  if (sellerToken && sellerToken.startsWith("Bearer ")) {
    sellerToken = sellerToken.slice(7).trim();
  }

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
    const existingSeller = await Seller.findById(decoded.sellerID);

    if (!existingSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products provided" });
    }

    const shop = await Shop.findById(existingSeller.shop);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    const preparedProducts = products.map((p) => {
      return {
        ...p,
        shop: shop._id,
        shopName: shop.name,
        shopType: shop.category,
        seller: existingSeller._id,
      };
    });

    const newProducts = await Product.insertMany(preparedProducts);

    // Update seller & shop in one go
    const productIds = newProducts.map((p) => p._id);
    existingSeller.products.push(...productIds);
    await existingSeller.save();

    shop.products.push(...productIds);
    await shop.save();

    res.status(201).json({
      success: true,
      message: `${newProducts.length} products added successfully`,
      shop,
    });
  } catch (error) {
    console.error("Error adding products:", error);
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

router.get("/get-products", authenticateSeller, async (req, res) => {
  try {
    const seller = req.seller;

    if (!seller.shop) {
      return res
        .status(400)
        .json({ success: false, message: "Seller does not have a shop yet" });
    }

    const products = await Product.find({ shop: seller.shop }).lean();

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/update-stock", async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "Product ID is required" });
  }

  try {
    // Check Product Existence
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
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

router.get("/seller-profile", authenticateSeller, async (req, res) => {
  try {
    const seller = req.seller;

    const existingSeller = await Seller.findById(seller._id)
      .select("username email phone salesHistory shop qrCode")
      .populate({
        path: "shop",
        select:
          "name category productCategories address isOpen isManuallyClosed images",
      });

    if (!existingSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = existingSeller.salesHistory
      .filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, sale) => sum + sale.amount, 0);

    const activeOrders = await Order.countDocuments({
      seller: seller._id,
      status: { $nin: ["Delivered", "Cancelled"] },
    });

    res.status(200).json({
      success: true,
      seller: {
        ...existingSeller.toObject(),
        monthlySales,
        activeOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/update-status", authenticateSeller, async (req, res) => {
  try {
    const { isOpen } = req.body;

    const seller = req.seller;
    const existingSeller = await Seller.findById(seller._id).populate("shop");

    if (!existingSeller || !existingSeller.shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    existingSeller.shop.isOpen = isOpen;
    existingSeller.shop.isManuallyClosed = !isOpen;
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

router.put("/update-profile", authenticateSeller, async (req, res) => {
  try {
    const { username, email } = req.body;
    const existingSeller = req.seller;

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
    const restaurants = await Shop.find({ category: { $ne: "Grocery" } });

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

router.get("/sales-history", authenticateSeller, async (req, res) => {
  try {
    const currSeller = req.seller;

    const seller = await Seller.findById(currSeller._id)
      .populate({
        path: "salesHistory.order",
        select: "_id id",
      })
      .lean();

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({ success: true, salesHistory: seller.salesHistory });
  } catch (error) {
    console.error("Error fetching sales history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/generate-qr", authenticateSeller, async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const seller = await Seller.findById(sellerId).populate({
      path: "shop",
      select: "category",
    });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (seller.qrCode) {
      return res.json({
        success: true,
        message: "QR code already exists",
        qrCode: seller.qrCode,
      });
    }

    let shopUrl = "";

    if(seller.shop.category === 'Grocery') {
      shopUrl = `https://gullyfoods.app/products/groceries`;
    }
    else {
      shopUrl = `https://gullyfoods.app/shop/${seller.shop._id}`;
    }

    const qrCodeDataUrl = await QRCode.toDataURL(shopUrl);

    // Save QR code in DB
    seller.qrCode = qrCodeDataUrl;
    await seller.save();

    res.json({
      success: true,
      message: "QR code generated successfully",
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating QR code",
      error: error.message,
    });
  }
});

module.exports = router;
