import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer');

// Create Document Type index
db.createIndex({
  index: { fields: ['type'] },
});

export default db;
