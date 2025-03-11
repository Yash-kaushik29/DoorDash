const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true },
  phone: {type: String, unique: true, required: true},
  password: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
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
      date: { type: Date, default: Date.now },
      amount: { type: Number, default: 0 },
    },
  ],
}, { timestamps: true });

const Seller = mongoose.model("Seller", SellerSchema);
module.exports = Seller;
