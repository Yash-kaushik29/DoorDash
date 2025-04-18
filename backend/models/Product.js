const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String,
    required: true,
  },
  dietType: {
    type: String, required: true
  },
  categories: {
    type: [String],
  },
  images: {
    type: [String]
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  shopType: {
    type: String,
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
