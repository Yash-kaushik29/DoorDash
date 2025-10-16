const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");

const authenticateSeller = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.gullyfoods_seller_session; 
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Please login first!" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).send({
          success: false,
          message: "Invalid or expired token!",
        });
      }

      // Fetch seller from database
      const currSeller = await Seller.findById(decoded.sellerID);
      if (!currSeller) {
        return res
          .status(404)
          .send({ success: false, message: "Seller not found!" });
      }

      req.seller = currSeller;
      next();
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error!" });
  }
};

module.exports = authenticateSeller;
