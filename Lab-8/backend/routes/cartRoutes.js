const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', asyncHandler(cartController.addToCart));
router.delete('/items/:productId', asyncHandler(cartController.removeFromCart));
router.delete('/', asyncHandler(cartController.clearCart));

module.exports = router;
