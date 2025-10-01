const express = require("express");
const router = express.Router();
const Product = require('../models/Product')
const authenticateUser = require("../middleware/authMiddleware");

// Add to Cart
router.post("/addToCart", authenticateUser, async (req, res) => {
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

module.exports = router;
