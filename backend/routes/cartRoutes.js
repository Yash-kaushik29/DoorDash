const express = require("express");
const router = express.Router();
const Product = require('../models/Product')
const authenticateUser = require("../middleware/authMiddleware");
const User = require("../models/User");

// Add to Cart
router.post("/addToCart", authenticateUser, async (req, res) => {
  const { productId, cartKey } = req.body;
  const currUser = req.user;

  try {
    if (!["foodCart", "groceryCart"].includes(cartKey)) {
      return res.status(400).send({ success: false, message: "Invalid cart key." });
    }

    const product = await Product.findById(productId).populate("shop");
    if (!product) {
      return res.status(404).send({ success: false, message: "Product not found." });
    }

    const shop = product.shop;

    if (!shop.isOpen) {
      return res.status(400).send({
        success: false,
        message: "This shop is currently closed.",
      });
    }

    if (!product.inStock) {
      return res.status(400).send({
        success: false,
        message: "This item is out of stock.",
      });
    }

    if (cartKey === "foodCart" && currUser.foodCart.length > 0) {
      const firstItem = await Product.findById(currUser.foodCart[0].productId).populate("shop");
      if (firstItem && firstItem.shop._id.toString() !== shop._id.toString()) {
        return res.status(400).send({
          success: false,
          message: `Your cart already contains items from another shop.`,
          shopName: firstItem.shopName,
          type: "DIFFERENT_SHOP", 
        });
      }
    }

    const existingCartItem = currUser[cartKey].find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity++;
    } else {
      currUser[cartKey].push({ productId, quantity: 1 });
    }

    await currUser.save();

    return res.status(200).send({
      success: true,
      message: "Product added to cart!",
      cart: currUser[cartKey],
    });
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Error adding product to cart." });
  }
});

// Increment Quantity
router.post("/incrementQty", authenticateUser, async (req, res) => {
  const { productId, cartKey } = req.body;
  const currUser = req.user;

  try {
    if (!["foodCart", "groceryCart"].includes(cartKey)) {
      return res.status(400).send({ success: false, message: "Invalid cart key." });
    }

    const existingCartItem = currUser[cartKey].find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity++;
      await currUser.save();
      return res.status(200).send({ success: true, cart: currUser[cartKey] });
    } else {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart.",
      });
    }
  } catch (error) {
    console.error("Error incrementing quantity:", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Error incrementing quantity." });
  }
});

// Decrement Quantity
router.post("/decrementQty", authenticateUser, async (req, res) => {
  const { productId, cartKey } = req.body;
  const currUser = req.user;

  try {
    if (!["foodCart", "groceryCart"].includes(cartKey)) {
      return res.status(400).send({ success: false, message: "Invalid cart key." });
    }

    const existingCartItem = currUser[cartKey].find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity--;
      if (existingCartItem.quantity < 1) {
        currUser[cartKey] = currUser[cartKey].filter(
          (item) => item.productId !== productId
        );
      }
      await currUser.save();
      return res.status(200).send({ success: true, cart: currUser[cartKey] });
    } else {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart.",
      });
    }
  } catch (error) {
    console.error("Error decrementing quantity:", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Error decrementing quantity." });
  }
});

// Remove from Cart
router.post("/removeFromCart", authenticateUser, async (req, res) => {
  const { productId, cartKey } = req.body;
  const currUser = req.user;

  try {
    if (!["foodCart", "groceryCart"].includes(cartKey)) {
      return res.status(400).send({ success: false, message: "Invalid cart key." });
    }

    const existingCartItem = currUser[cartKey].find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      currUser[cartKey] = currUser[cartKey].filter(
        (item) => item.productId !== productId
      );
      await currUser.save();
      return res.status(200).send({ success: true, cart: currUser[cartKey] });
    } else {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart.",
      });
    }
  } catch (error) {
    console.error("Error removing product from cart:", error.message);
    return res.status(500).send({
      success: false,
      message: "Error removing product from cart.",
    });
  }
});

router.get("/getCart", authenticateUser, async (req, res) => {
  const currUser = req.user;

  try {
    const foodProductIds = currUser.foodCart.map((item) => item.productId);

    const foodProducts = await Product.find({ _id: { $in: foodProductIds } }).populate("shop", "isOpen");

    const foodCart = currUser.foodCart.map((cartItem) => {
      const product = foodProducts.find(
        (p) => p._id.toString() === cartItem.productId
      );
      return {
        product,
        quantity: cartItem.quantity,
      };
    });

    const groceryProductIds = currUser.groceryCart.map((item) => item.productId);

    const groceryProducts = await Product.find({ _id: { $in: groceryProductIds } }).populate("shop", "isOpen");

    const groceryCart = currUser.groceryCart.map((cartItem) => {
      const product = groceryProducts.find(
        (p) => p._id.toString() === cartItem.productId
      );
      return {
        product,
        quantity: cartItem.quantity,
      };
    });

    return res.status(200).send({
      success: true,
      foodCart,
      groceryCart,
      message: "Cart fetched successfully!",
    });
  } catch (error) {
    console.error("Failed to fetch cart.", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Failed to fetch cart." });
  }
});

router.post("/replaceCart", authenticateUser, async (req, res) => {
  const { productId, cartKey } = req.body; 
  const userId = req.user._id;

  try {
    const product = await Product.findById(productId).populate("shop", "shopName isOpen");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!product.shop?.isOpen) {
      return res.status(400).json({ success: false, message: "Shop is currently closed." });
    }

    // Clear existing cart and add this product
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          [cartKey]: [{ productId: product._id, quantity: 1 }],
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Cart Updated!`,
      cart: updatedUser[cartKey],
    });
  } catch (err) {
    console.error("Error replacing cart:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while replacing the cart.",
    });
  }
});

module.exports = router;
