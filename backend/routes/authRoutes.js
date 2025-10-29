const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Otp = require("../models/Otp");
const Coupon = require("../models/Coupons");
const bcrypt = require("bcrypt");
const axios = require("axios");
const authenticateSeller = require("../middleware/sellerAuthMiddleware");
const authenticateUser = require("../middleware/authMiddleware");

const router = express();

const assignRandomCoupons = async () => {
  const allCoupons = await Coupon.find({
    name: { $in: ["WELCOME5", "FLAT20", "BIG5", "GROCERY20", "CARNIVAL30"] },
  });

  if (allCoupons.length === 0) return [];

  const shuffled = allCoupons.sort(() => 0.5 - Math.random());

  const selectedCoupons = shuffled.slice(0, 3);

  return selectedCoupons.map((c) => ({
    coupon: c._id,
    count: 1,
  }));
};

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body.formData;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone is already in use",
      });
    }

    await Otp.deleteOne({ phone, otpFor: "signup" });

    // Call MessageCentral API
    const sendOtpUrl = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&flowType=SMS&mobileNumber=${phone}`;

    const response = await axios.post(
      sendOtpUrl,
      {},
      {
        headers: { authToken: process.env.MESSAGECENTRAL_AUTH_TOKEN },
      }
    );

    const result = response.data;

    if (result.message !== "SUCCESS") {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to send OTP",
      });
    }

    // Save OTP verificationId in DB
    const otp = new Otp({
      phone,
      otpFor: "signup",
      verificationId: result.data.verificationId,
    });
    await otp.save();

    res.json({
      success: true,
      message: "OTP sent successfully",
      requestId: result.requestId,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
});

// VERIFY OTP AND SIGNUP
router.post("/user-signup", async (req, res) => {
  const { username, phone } = req.body.formData;
  const { otp } = req.body;

  if (!username || !phone || !otp) {
    return res.status(400).json({
      success: false,
      message: "Username, phone, and OTP are required",
    });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone is already in use",
      });
    }

    const existingOtp = await Otp.findOne({ phone, otpFor: "signup" });

    if (!existingOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    // Verify OTP via MessageCentral
    const verifyOtpUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phone}&verificationId=${existingOtp.verificationId}&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&code=${otp}`;

    const response = await axios.get(verifyOtpUrl, {
      headers: { authToken: process.env.MESSAGECENTRAL_AUTH_TOKEN },
    });

    const result = response.data;

    if (result.message !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "OTP does not match",
      });
    }

    const activeCoupons = await assignRandomCoupons();

    // Create new user
    const newUser = new User({ username, phone, activeCoupons });
    await newUser.save();

    const token = jwt.sign(
      {
        userID: newUser._id,
        username: newUser.username,
        phone: newUser.phone || "",
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    // Delete OTP after successful signup
    await Otp.deleteOne({ _id: existingOtp._id });

    const maxAge = 15 * 24 * 60 * 60 * 1000;

    const isProduction = process.env.NODE_ENV === "production";
    const domainName = isProduction ? "gullyfoods.app" : "localhost";

    const cookieOptions = {
      expires: new Date(Date.now() + maxAge),
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      domain: domainName,
    };

    res.cookie("authToken", token, cookieOptions);

    res.json({
      success: true,
      message: "Registered successfully!",
      token,
      user: {
        username: newUser.username,
        _id: newUser._id,
        foodCart: newUser.foodCart,
        groceryCart: newUser.groceryCart,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
});

router.post("/send-login-otp", async (req, res) => {
  const { phone } = req.body.formData;

  if (!phone) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number is required" });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    // Remove any previous login OTPs
    await Otp.deleteOne({ phone, otpFor: "login" });

    const sendOtpUrl = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&flowType=SMS&mobileNumber=${phone}`;

    const response = await axios.post(
      sendOtpUrl,
      {},
      {
        headers: { authToken: process.env.MESSAGECENTRAL_AUTH_TOKEN },
      }
    );

    const result = response.data;

    if (result.message !== "SUCCESS") {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to send OTP",
      });
    }

    const otp = new Otp({
      phone,
      otpFor: "login",
      verificationId: result.data.verificationId,
    });
    await otp.save();

    res.json({
      success: true,
      message: "OTP sent successfully",
      requestId: result.requestId,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
      error: error.message,
    });
  }
});

router.post("/user-login", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Phone and OTP are required" });
  }

  try {
    const existingUser = await User.findOne({ phone });

    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist!" });
    }

    const existingOtp = await Otp.findOne({ phone, otpFor: "login" });
    if (!existingOtp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or not found" });
    }

    const verifyOtpUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phone}&verificationId=${existingOtp.verificationId}&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&code=${otp}`;

    const response = await axios.get(verifyOtpUrl, {
      headers: { authToken: process.env.MESSAGECENTRAL_AUTH_TOKEN },
    });

    const result = response.data;

    if (result.message !== "SUCCESS") {
      return res
        .status(400)
        .json({ success: false, message: "OTP does not match" });
    }

    // Successful login, delete OTP
    await Otp.deleteOne({ _id: existingOtp._id });

    // Generate JWT
    const token = jwt.sign(
      {
        userID: existingUser._id,
        username: existingUser.username,
        phone: existingUser.phone,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    const maxAge = 15 * 24 * 60 * 60 * 1000;

    const isProduction = process.env.NODE_ENV === "production";
    const domainName = isProduction ? "gullyfoods.app" : "localhost";

    const cookieOptions = {
      expires: new Date(Date.now() + maxAge),
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      domain: domainName,
    };

    res.cookie("authToken", token, cookieOptions);

    res.json({
      success: true,
      message: "Logged In Successfully!",
      token,
      user: {
        username: existingUser.username,
        _id: existingUser._id,
        foodCart: existingUser.foodCart,
        groceryCart: existingUser.groceryCart,
        phone: existingUser.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while logging in",
      error: error.message,
    });
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

      const token = jwt.sign(
        {
          sellerID: newSeller._id,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15d" }
      );
      const maxAge = 15 * 24 * 60 * 60 * 1000;

      const isProduction = process.env.NODE_ENV === "production";
      const domainName = isProduction ? "gullyfoods.app" : "localhost";

      const cookieOptions = {
        expires: new Date(Date.now() + maxAge),
        httpOnly: true,
        secure: isProduction,
        sameSite: "Lax",
        path: "/",
        domain: domainName,
      };

      res.cookie("gullyfoods_seller_session", token, cookieOptions);

      res.send({ success: true, message: "Registered succesfully!" });
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
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15d" }
        );
        const maxAge = 15 * 24 * 60 * 60 * 1000;

        const isProduction = process.env.NODE_ENV === "production";
        const domainName = isProduction ? "gullyfoods.app" : "localhost";

        const cookieOptions = {
          expires: new Date(Date.now() + maxAge),
          httpOnly: true,
          secure: isProduction,
          sameSite: "Lax",
          path: "/",
          domain: domainName,
        };

        res.cookie("gullyfoods_seller_session", token, cookieOptions);

        res.send({
          success: true,
          message: "Logged In Successfully!",
          sellerId: existingSeller._id,
        });
      } else {
        res.send({ success: false, message: "Invalid credentails!" });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/getUser", authenticateUser, (req, res) => {
  const { _id, username, foodCart, groceryCart, phone } = req.user;

  res.json({
    success: true,
    user: { _id, username, foodCart, groceryCart, phone },
  });
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/getSellerDetails", authenticateSeller, async (req, res) => {
  try {
    const existingSeller = req.seller;

    const sellerDetails = await Seller.findById(existingSeller._id)
      .select("username email shop salesHistory products")
      .populate({
        path: "orders",
        match: { deliveryStatus: { $nin: ["Cancelled", "Delivered"] } },
        select: "_id",
      })
      .lean();

    if (!sellerDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // calculate today's sales
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

    const responseData = {
      _id: sellerDetails._id,
      username: sellerDetails.username,
      email: sellerDetails.email,
      shop: sellerDetails.shop,
      sales: sellerDetails.sales,
      productsCount: sellerDetails.products.length,
      pendingOrdersCount: sellerDetails.orders?.length || 0,
      todaySalesTotal,
    };

    res.status(200).json({ success: true, sellerDetails: responseData });
  } catch (error) {
    console.error("Error in fetching seller details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/getSeller", authenticateSeller, (req, res) => {
  const sellerId = req.seller._id;

  res.json({
    success: true,
    sellerId
  });
});

module.exports = router;
