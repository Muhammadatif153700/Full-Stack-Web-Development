const { randomUUID } = require('node:crypto');
const { readStore, updateStore } = require('./storeService');

const categories = new Set(['audio', 'wearables', 'accessories']);

async function getProducts() {
  const store = await readStore();
  return store.products;
}

async function addProduct(input) {
  input = input || {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const price = Number(input.price);
  const category = input.category;
  const image = typeof input.image === 'string' ? input.image.trim() : '';
  const desc = typeof input.desc === 'string' ? input.desc.trim() : '';
  let imageUrl;

  try {
    imageUrl = new URL(image);
  } catch {
    throw Object.assign(new Error('Image must be a valid HTTP or HTTPS URL.'), { statusCode: 400 });
  }

  if (!name) throw Object.assign(new Error('Product name is required.'), { statusCode: 400 });
  if (input.price === undefined || input.price === null || input.price === '' || !Number.isFinite(price) || price < 0) {
    throw Object.assign(new Error('Price must be a non-negative number.'), { statusCode: 400 });
  }
  if (!categories.has(category)) {
    throw Object.assign(new Error('Choose a valid product category.'), { statusCode: 400 });
  }
  if (!['http:', 'https:'].includes(imageUrl.protocol)) {
    throw Object.assign(new Error('Image must use HTTP or HTTPS.'), { statusCode: 400 });
  }

  const product = {
    id: randomUUID(),
    name,
    price,
    category,
    image,
    desc,
    rating: 5,
    reviews: 0
  };

  await updateStore(store => {
    store.products.push(product);
    return product;
  });

  return product;
}

module.exports = { getProducts, addProduct };
