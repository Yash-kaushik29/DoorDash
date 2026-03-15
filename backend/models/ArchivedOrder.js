const mongoose = require("mongoose");

const ArchivedOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
  },
  { timestamps: true },
);

const ArchivedOrder = mongoose.model("ArchivedOrder", ArchivedOrderSchema);

module.exports = ArchivedOrder;
