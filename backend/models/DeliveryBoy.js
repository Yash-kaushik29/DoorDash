const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: { type: String, required: true },
  commissionHistory: [
    {
      commission: { type: Number, required: true },
      time: { type: Date, default: Date.now },
    },
  ],
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);
