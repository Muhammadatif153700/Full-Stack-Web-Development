const orderService = require('../services/orderService');

async function createOrder(request, response) {
  response.status(201).json(await orderService.createOrder());
}

module.exports = { createOrder };
