const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine: { type: String, },
  pincode: { type: String, },
  city: { type: String, },
  state: { type: String, },
});

const ShopSchema = new mongoose.Schema({
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
    isOpen: {
      type: Boolean,
      default: false, 
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
  }, { timestamps: true });

const Shop = mongoose.model('Shop', ShopSchema);

module.exports = Shop;