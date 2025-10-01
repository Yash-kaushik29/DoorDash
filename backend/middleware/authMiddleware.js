const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({ success: false, message: "Please login first!" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).send({
          success: false,
          message: "Invalid or expired token!",
        });
      }

      const currUser = await User.findById(decoded.userID);
      if (!currUser) {
        return res
          .status(404)
          .send({ success: false, message: "User not found!" });
      }

      req.user = currUser; 
      next();
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error!" });
  }
};


module.exports = authenticateUser;
