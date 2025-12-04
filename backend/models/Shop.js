const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  addressLine: { type: String },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
});

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    productCategories: {
      type: [String],
    },
    address: {
      type: addressSchema,
    },
    lat: { type: String },
    long: { type: String },
    isOpen: {
      type: Boolean,
      default: false,
    },
    isManuallyClosed: {
      type: Boolean,
      default: false,
    },
    openingTime: {
      type: String,
      default: "10:00",
    },
    closingTime: {
      type: String,
      default: "22:00",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    images: {
      type: [String],
    },
    shopDiscount: {
      type: Number,
      default: 0, 
      min: 0,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", ShopSchema);

module.exports = Shop;
