const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/', asyncHandler(orderController.createOrder));

module.exports = router;
