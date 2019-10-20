import { reducer as formReducer } from 'redux-form';
import { message } from 'antd';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer', { auto_compaction: true });

// Database
/*
async function initializeDB() {
  const pouch = new PouchDB('invoicer', { auto_compaction: true });

  await pouch.createIndex({
    index: { fields: ['type'] },
  });
  await pouch.createIndex({
    index: { fields: ['name'] },
  });
  await pouch.createIndex({
    index: { fields: ['number'] },
  });

  return pouch;
}
*/

// DVA
const dva = {
  config: {
    extraReducers: {
      form: formReducer,
    },
    onError(err) {
      err.preventDefault();
      console.error(err.message);
      message.error(err.message);
    },
  },
};

export default { db, dva };
