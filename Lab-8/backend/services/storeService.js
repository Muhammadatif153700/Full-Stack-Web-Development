const fs = require('node:fs/promises');
const path = require('node:path');

const dataDirectory = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDirectory, 'store.json');
let updateQueue = Promise.resolve();

async function initializeStore(initialStore) {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.writeFile(dataFile, JSON.stringify(initialStore, null, 2), { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function readStore() {
  const contents = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(contents);
}

function updateStore(update) {
  const operation = updateQueue.then(async () => {
    const store = await readStore();
    const result = await update(store);
    const temporaryFile = `${dataFile}.tmp`;

    await fs.writeFile(temporaryFile, JSON.stringify(store, null, 2));
    await fs.rename(temporaryFile, dataFile);
    return result;
  });

  updateQueue = operation.catch(() => {});
  return operation;
}

module.exports = { initializeStore, readStore, updateStore };
