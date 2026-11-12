const cartService = require('../services/cartService');

async function getCart(request, response) {
  response.json(await cartService.getCart());
}

async function addToCart(request, response) {
  response.status(200).json(await cartService.addToCart(request.body && request.body.productId));
}

async function removeFromCart(request, response) {
  response.json(await cartService.removeFromCart(request.params.productId));
}

async function clearCart(request, response) {
  response.json(await cartService.clearCart());
}

module.exports = { getCart, addToCart, removeFromCart, clearCart };
