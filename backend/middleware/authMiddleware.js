const jwt = require("jsonwebtoken");
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first! (Token missing from cookie)",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        res.clearCookie("authToken");
        return res.status(401).json({
          success: false,
          message: "Invalid or expired session! Please log in again.",
        });
      }

      const currUser = await User.findById(decoded.userID);
      if (!currUser) {
        res.clearCookie("authToken");
        return res.status(401).json({
          success: false,
          message: "User not found! Please login again.",
        });
      }

      req.user = currUser; 
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};


module.exports = authenticateUser;
