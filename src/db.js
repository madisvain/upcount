import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer', { auto_compaction: true });

// CouchDB replication
if (localStorage.getItem('email') && localStorage.getItem('token')) {
  const couchDB = new PouchDB(
    'https://couchdb.upcount.app/userdb-6d616469737661696e40676d61696c2e636f6d',
    {
      auth: {
        username: localStorage.getItem('email'),
        password: localStorage.getItem('token'),
      },
    }
  );

  db.sync(couchDB, {
    live: true,
    retry: true,
  })
    .on('change', function(change) {
      console.log(change);
    })
    .on('paused', function(info) {
      console.log(info);
    })
    .on('active', function(info) {
      console.log(info);
    })
    .on('error', function(err) {
      console.log(err);
    });
}

export default db;
