const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: {type: String, required: true},
  addressLine: { type: String, required: true },
  area: {type: String, required: true},
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    addresses: [addressSchema],
    wishlist: { type: [String] },
    cart: [
      {
        productId: { type: String },
        quantity: { type: Number, default: 1 },
      },
    ],
    notifications: [
      {
        message: { type: String },
        read: { type: Boolean, default: false },
        url: {type: String},
        createdAt: { type: Date, default: Date.now },
      },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
