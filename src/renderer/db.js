import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer');

// Create Document index for name
db.createIndex({
  index: { fields: ['name'] },
});

export default db;
