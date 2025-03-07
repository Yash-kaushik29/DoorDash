const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const router = express();

router.post("/user-signup", async (req, res) => {
  const { username, email, password } = req.body.formData;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res.send({ success: false, message: "Email is already in use!" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      res.send({ success: true, message: "Registered succesfully!" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/seller-signup", async (req, res) => {
  const { username, phone, password } = req.body.formData;

  try {
    const existingSeller = await Seller.findOne({ phone });
    if (existingSeller) {
      res.send({ success: false, message: "Phone is already in use!" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newSeller = new Seller({
        username,
        phone,
        email: username + "@gmail.com",
        password: hashedPassword,
      });
      await newSeller.save();

      res.send({ success: true, message: "Registered succesfully!" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/user-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      res.send({ success: false, message: "User does not exist!" });
    } else {
      const match = await bcrypt.compare(password, existingUser.password);

      if (match) {
        var token = jwt.sign(
          {
            userID: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            phone: existingUser.phone || "",
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15d" }
        );

        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })
          .send({
            success: true,
            message: "Logged In Successfully!",
            user: {
              username: existingUser.username,
              _id: existingUser._id,
              cart: existingUser.cart,
              phone: existingUser.phone,
            },
          });
      } else {
        res.send({ success: false, message: "Invalid credentails!" });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/seller-login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const existingSeller = await Seller.findOne({ phone });

    if (!existingSeller) {
      res.send({ success: false, message: "User does not exist!" });
    } else {
      const match = await bcrypt.compare(password, existingSeller.password);

      if (match) {
        var token = jwt.sign(
          {
            sellerID: existingSeller._id,
            email: existingSeller.email,
            username: existingSeller.username,
            phone: existingSeller.phone || "",
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15d" }
        );

        res
          .cookie("sellerToken", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 24 * 60 * 60 * 1000,
          })
          .send({
            success: true,
            message: "Logged In Successfully!",
            token,
          });
      } else {
        res.send({ success: false, message: "Invalid credentails!" });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/getUser", (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async (err, user) => {
      if (err) {
        res.json({ success: false, message: "Please login first!" });
      } else {
        const currUser = await User.findOne({
          _id: user.userID,
        });

        if (!currUser) {
          return res.json({ success: false, message: "Please login again!" });
        }
        res.json({
          user: {
            _id: currUser._id,
            name: currUser.username,
            cart: currUser.cart,
            phone: currUser.phone,
          },
        });
      }
    });
  } else {
    res.json({ success: false, message: "Internal server error!" });
  }
});

router.get("/getSellerDetails", async (req, res) => {
  try {
    const { sellerToken } = req.cookies;

    // Check if token exists
    if (!sellerToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify token
    jwt.verify(sellerToken, process.env.JWT_SECRET_KEY, async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      // Fetch Seller Details
      const sellerDetails = await Seller.findOne({ _id: seller.sellerID })
        .select("username email shop sales products")
        .populate({
          path: "orders",
          match: { status: { $nin: ["Cancelled", "Delivered"] } },
          select: "_id",
        })
        .lean(); // Performance boost

      // If no seller is found
      if (!sellerDetails) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      // Preparing response data
      const responseData = {
        _id: sellerDetails._id,
        username: sellerDetails.username,
        email: sellerDetails.email,
        shop: sellerDetails.shop,
        sales: sellerDetails.sales,
        productsCount: sellerDetails.products.length,
        pendingOrdersCount: sellerDetails.orders.length,
      };

      res.status(200).json({ success: true, sellerDetails: responseData });
    });
  } catch (error) {
    console.error("Error in fetching seller details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
