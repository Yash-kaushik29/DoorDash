const express = require('express');
const { createOrder, verifyPayments } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/createOrder', createOrder);
router.post('/verify-payment', verifyPayments);

module.exports = router