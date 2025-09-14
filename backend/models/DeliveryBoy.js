const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: { type: String, required: true },
  // Track how much COD cash is pending to settle
  outstandingAmount: { type: Number, default: 0 },

  // Track individual COD orders
  outstandingPayments: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
      amount: { type: Number, required: true },
      status: { type: String, enum: ["unsettled", "settled"], default: "unsettled" },
      collectedAt: { type: Date, default: Date.now },
      settledAt: { type: Date },
    },
  ],
  commissionHistory: [
    {
      commission: { type: Number, required: true },
      time: { type: Date, default: Date.now },
    },
  ],
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);
