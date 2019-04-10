import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer');

// Create Document indexes for type & name
db.createIndex({
  index: { fields: ['type', 'name'] },
});

export default db;
