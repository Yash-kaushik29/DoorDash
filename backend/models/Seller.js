const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {type: String},
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    model: {
      type: String,
      enum: ["commission", "margin"],
      required: true,
      default: "commission",
    },
    commissionRate: {
      type: Number,
      default: 0.1,
    },
    notifications: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        message: { type: String },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    salesHistory: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        amount: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
      },
    ],
    qrCode: { type: String },
  },
  { timestamps: true }
);

const Seller = mongoose.model("Seller", SellerSchema);
module.exports = Seller;
