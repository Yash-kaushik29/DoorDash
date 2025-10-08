const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otpFor: {
    type: String,
    require: true,
  },
  verificationId: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120,
  },
});

module.exports = mongoose.model("Otp", otpSchema);
