const { readStore, updateStore } = require('./storeService');

function formatCart(store) {
  return store.cart.map(item => {
    const product = store.products.find(entry => entry.id === item.productId);
    if (!product) {
      throw Object.assign(new Error('A product in the cart no longer exists.'), { statusCode: 409 });
    }
    return { ...product, qty: item.qty };
  });
}

async function getCart() {
  return formatCart(await readStore());
}

async function addToCart(productId) {
  if (typeof productId !== 'string' || !productId.trim()) {
    throw Object.assign(new Error('A product ID is required.'), { statusCode: 400 });
  }

  return updateStore(store => {
    const product = store.products.find(entry => entry.id === productId);
    if (!product) throw Object.assign(new Error('Product not found.'), { statusCode: 404 });

    const existing = store.cart.find(item => item.productId === productId);
    if (existing) existing.qty += 1;
    else store.cart.push({ productId, qty: 1 });

    return formatCart(store);
  });
}

async function removeFromCart(productId) {
  if (typeof productId !== 'string' || !productId.trim()) {
    throw Object.assign(new Error('A product ID is required.'), { statusCode: 400 });
  }

  return updateStore(store => {
    const itemIndex = store.cart.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      throw Object.assign(new Error('Product is not in the cart.'), { statusCode: 404 });
    }

    store.cart.splice(itemIndex, 1);
    return formatCart(store);
  });
}

async function clearCart() {
  return updateStore(store => {
    store.cart = [];
    return [];
  });
}

module.exports = { getCart, addToCart, removeFromCart, clearCart };
