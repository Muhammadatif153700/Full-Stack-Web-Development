const app = require('./app');
const initialStore = require('./data/initialStore');
const { initializeStore } = require('./services/storeService');

const port = Number(process.env.PORT) || 3000;

initializeStore(initialStore)
  .then(() => {
    app.listen(port, () => {
      console.log(`NEXUS Storefront is running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Unable to initialize the storefront data store.', error);
    process.exitCode = 1;
  });
