const productService = require('../services/productService');

async function listProducts(request, response) {
  response.json(await productService.getProducts());
}

async function createProduct(request, response) {
  const product = await productService.addProduct(request.body);
  response.status(201).json(product);
}

module.exports = { listProducts, createProduct };
