import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer', { auto_compaction: true });

export default db;
