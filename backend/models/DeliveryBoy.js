const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
    name: String,
    phone: String,
    password: {type: String, required: true},
    commission: {type: Number},
    isAvailable: { type: Boolean, default: true },
  });
  
  module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
  