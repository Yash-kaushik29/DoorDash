const express = require("express");
const router = express.Router();
const Product = require('../models/Product')
const authenticateUser = require("../middleware/authMiddleware");

// Add to Cart
router.post("/addToCart", authenticateUser, async (req, res) => {
  const { productId } = req.body;
  const currUser = req.user;

  try {
    const existingCartItem = currUser.cart.find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity++;
    } else {
      currUser.cart.push({ productId, quantity: 1 });
    }

    await currUser.save();
    return res.status(200).send({
      success: true,
      message: "Product added to cart!",
      cart: currUser.cart,
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
  const { productId } = req.body;
  const currUser = req.user;

  try {
    const existingCartItem = currUser.cart.find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity++;
      await currUser.save();
      return res.status(200).send({ success: true, cart: currUser.cart });
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
  const { productId } = req.body;
  const currUser = req.user;

  try {
    const existingCartItem = currUser.cart.find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity--;
      if (existingCartItem.quantity < 1) {
        currUser.cart = currUser.cart.filter(
          (item) => item.productId !== productId
        );
      }
      await currUser.save();
      return res.status(200).send({ success: true, cart: currUser.cart });
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
  const { productId } = req.body;
  const currUser = req.user;

  try {
    const existingCartItem = currUser.cart.find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      currUser.cart = currUser.cart.filter(
        (item) => item.productId !== productId
      );
      await currUser.save();
      return res.status(200).send({ success: true, cart: currUser.cart });
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
    // Get all product IDs from the user's cart
    const productIds = currUser.cart.map((item) => item.productId);

    // Fetch all products in one go using $in operator
    const products = await Product.find({ _id: { $in: productIds } }).populate("shop", "isOpen");

    // Map products to cart items with corresponding quantities
    const cart = currUser.cart.map((cartItem) => {
      const product = products.find(
        (p) => p._id.toString() === cartItem.productId
      );
      return {
        product,
        quantity: cartItem.quantity,
      };
    });

    return res.status(200).send({
      success: true,
      cart,
      message: "Cart fetched successfully!",
    });
  } catch (error) {
    console.error("Failed to fetch cart.", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Failed to fetch cart." });
  }
});

module.exports = router;
