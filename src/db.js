import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer');

// Create indexes
db.createIndex({
  index: { fields: ['type'] },
});
db.createIndex({
  index: { fields: ['name'] },
});
db.createIndex({
  index: { fields: ['number'] },
});

export default db;
