const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', asyncHandler(productController.listProducts));
router.post('/', asyncHandler(productController.createProduct));

module.exports = router;
