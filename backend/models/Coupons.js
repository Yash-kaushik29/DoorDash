const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  discountType: { type: String, enum: ["PERCENT", "FLAT"], required: true },
  desc: { type: String, required: true },
  minOrder: { type: Number, default: 0 },
  applicableTo: { type: String, enum: ["food", "grocery", "both"], required: true }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;