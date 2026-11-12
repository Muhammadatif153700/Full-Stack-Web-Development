const path = require('node:path');
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const projectDirectory = path.join(__dirname, '..');

app.use(express.json({ limit: '100kb' }));
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (request, response) => response.sendFile(path.join(projectDirectory, 'index.html')));
app.get('/index.html', (request, response) => response.sendFile(path.join(projectDirectory, 'index.html')));
app.get('/login.html', (request, response) => response.sendFile(path.join(projectDirectory, 'login.html')));
app.use('/api', (request, response) => response.status(404).json({ error: 'API route not found.' }));
app.use((request, response) => response.status(404).send('Page not found.'));
app.use(errorHandler);

module.exports = app;
