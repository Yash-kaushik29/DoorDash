const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: "Please login first!" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).send({
        success: false,
        message: "Invalid or expired token!",
      });
    }

    req.user = await User.findById(user.userID);
    if (!req.user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found!" });
    }
    next();
  });
};

module.exports = authenticateUser;
