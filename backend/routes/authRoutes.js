const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Otp = require("../models/Otp");
const bcrypt = require("bcrypt");
const axios = require("axios");
const router = express();

const generateNumericOtp = (length = 4) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

router.post("/send-otp", async (req, res) => {
  const { phone, username } = req.body.formData;

  if (!phone) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number required" });
  }

  try {
    // Check existing user
    const existingPhone = await User.findOne({ phone });
    const existingUsername = await User.findOne({ username });

    if (existingPhone) {
      return res
        .status(409)
        .json({ success: false, message: "Account already exists!" });
    }

    if (existingUsername) {
      return res
        .status(409)
        .json({ success: false, message: "Username is already taken!" });
    }

    // Check OTP cooldown
    const existingOtp = await Otp.findOne({ phone, otpFor: "signup" });
    if (existingOtp) {
      return res.status(429).json({
        success: false,
        message: "OTP already sent. Please try again after 2 minutes.",
      });
    }

    // Send OTP via MessageCentral Verification API
    const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&flowType=SMS&mobileNumber=${phone}`;

    const response = await axios.post(url, null, {
      headers: {
        authToken:
          process.env.authToken,
      },
    });

    console.log(url, response.data);

    // Check response
    if (response.data.status !== "SUCCESS") {
      return res.status(500).json({
        success: false,
        message:
          response.data.message ||
          "Failed to send OTP via MessageCentral verification API",
      });
    }

    // Save a record in DB for cooldown purposes (optional)
    const otpEntry = new Otp({ phone, otpFor: "signup" });
    await otpEntry.save();

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(
      "MessageCentral error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to send OTP via MessageCentral",
      });
  }
});

router.post("/send-login-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res
      .status(400)
      .json({ success: false, message: "Phone number required" });

  const existingPhone = await User.findOne({ phone });

  if (!existingPhone) {
    return res
      .status(409)
      .send({ success: false, message: "Account do not exist!" });
  }

  const existingOtp = await Otp.findOne({ phone, otpFor: "login" });

  if (existingOtp) {
    return res.status(429).json({
      success: false,
      message: "OTP already sent. Please try again after 2 minutes.",
    });
  }

  const otp = generateNumericOtp();

  console.log(otp);

  try {
    // const response = await axios.get(
    //   `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/+91${phone}/${otp}`
    // );

    // if (response.data.Status !== "Success") {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Failed to send OTP via SMS provider",
    //   });
    // }

    // const otpEntry = new Otp({ phone, otp, otpFor: "login" });
    // await otpEntry.save();

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/user-signup", async (req, res) => {
  const { username, phone } = req.body.formData;
  const { otp } = req.body;

  try {
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      res.send({ success: false, message: "Phone is already in use!" });
    } else {
      const existingOtp = await Otp.findOne({ phone, otpFor: "signup" });

      if (existingOtp && otp === existingOtp) {
        const newUser = new User({ username, phone });
        await newUser.save();

        var token = jwt.sign(
          {
            userID: newUser._id,
            username: newUser.username,
            phone: newUser.phone || "",
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15d" }
        );

        await Otp.deleteOne({ _id: existingOtp._id });

        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })
          .send({
            success: true,
            message: "Registered Successfully!",
            user: {
              username: newUser.username,
              _id: newUser._id,
              foodCart: newUser.foodCart,
              groceryCart: newUser.groceryCart,
              phone: newUser.phone,
            },
          });
      } else {
        res.send({ success: false, message: "OTP does not match!" });
      }
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
  const { phone, otp } = req.body;
  console.log(phone, otp);

  try {
    const existingUser = await User.findOne({ phone: phone });

    if (!existingUser) {
      res.send({ success: false, message: "User does not exist!" });
    } else {
      // const existingOtp = await Otp.findOne({ phone, otpFor: "login" });

      if ("1111" === otp) {
        var token = jwt.sign(
          {
            userID: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone || "",
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15d" }
        );

        // await Otp.deleteOne({ _id: existingOtp._id });

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
            token: token,
            user: {
              username: existingUser.username,
              _id: existingUser._id,
              foodCart: existingUser.foodCart,
              groceryCart: existingUser.groceryCart,
              phone: existingUser.phone,
            },
          });
      } else {
        res.send({ success: false, message: "OTP does not match!" });
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

        console.log(token);

        res
          .cookie("sellerToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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

router.get("/getUser", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Please login first!" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token!" });
      }

      const currUser = await User.findById(decoded.userID);
      if (!currUser) {
        return res.status(401).json({ success: false, message: "User not found! Please login again." });
      }

      res.json({
        success: true,
        user: {
          _id: currUser._id,
          username: currUser.username,
          foodCart: currUser.foodCart,
          groceryCart: currUser.groceryCart,
          phone: currUser.phone,
        },
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

router.get("/getSellerDetails", async (req, res) => {
  try {
    const { sellerToken } = req.cookies;

    if (!sellerToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    jwt.verify(sellerToken, process.env.JWT_SECRET_KEY, async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      const sellerDetails = await Seller.findOne({ _id: seller.sellerID })
        .select("username email shop salesHistory products")
        .populate({
          path: "orders",
          match: { deliveryStatus: { $nin: ["Cancelled", "Delivered"] } },
          select: "_id",
        })
        .lean();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySales =
        sellerDetails.salesHistory?.filter((entry) => {
          const saleDate = new Date(entry.date);
          return saleDate >= today;
        }) || [];

      const todaySalesTotal = todaySales.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );

      if (!sellerDetails) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      const responseData = {
        _id: sellerDetails._id,
        username: sellerDetails.username,
        email: sellerDetails.email,
        shop: sellerDetails.shop,
        sales: sellerDetails.sales,
        productsCount: sellerDetails.products.length,
        pendingOrdersCount: sellerDetails.orders?.length || 0,
        todaySalesTotal: todaySalesTotal,
      };

      res.status(200).json({ success: true, sellerDetails: responseData });
    });
  } catch (error) {
    console.error("Error in fetching seller details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
