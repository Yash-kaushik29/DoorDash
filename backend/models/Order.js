const mongoose = require("mongoose");

// Function to generate a 6-character alphanumeric ID
const generateId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    id: { type: String, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
        quantity: { type: Number, required: true },
        status: { type: String, default: "Processing" },
      },
    ],
    shippingAddress: {
      lat: { type: String, required: true },
      long: { type: String, required: true },
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      area: { type: String, required: true },
      landMark: { type: String },
    },
    amount: { type: Number, required: true },
    deliveryStatus: { type: String, default: "Processing" },
    deliveryCharge: {type: Number, required: true},
    paymentStatus: { type: String, default: "Unpaid" },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    deliveryBoyAssigned: {type: Boolean, default: false},
    sellersNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seller" }],
  },
  { timestamps: true }
);

OrderSchema.pre("save", function (next) {
  if (!this.id) {
    this.id = generateId();
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
