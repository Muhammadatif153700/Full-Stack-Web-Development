const { randomUUID } = require('node:crypto');
const { updateStore } = require('./storeService');

async function createOrder() {
  const order = await updateStore(store => {
    if (store.cart.length === 0) {
      throw Object.assign(new Error('Your cart is empty.'), { statusCode: 400 });
    }

    const items = store.cart.map(item => {
      const product = store.products.find(entry => entry.id === item.productId);
      if (!product) {
        throw Object.assign(new Error('A product in the cart no longer exists.'), { statusCode: 409 });
      }
      return { ...product, qty: item.qty };
    });

    const createdOrder = {
      id: randomUUID(),
      items,
      total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      createdAt: new Date().toISOString()
    };

    store.orders.push(createdOrder);
    store.cart = [];
    return createdOrder;
  });

  return order;
}

module.exports = { createOrder };
