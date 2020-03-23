import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer', { auto_compaction: true });

const toHex = str => {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};

// CouchDB replication
if (localStorage.getItem('email') && localStorage.getItem('token')) {
  const couchDB = new PouchDB(
    `https://couchdb.upcount.app/userdb-${toHex(localStorage.getItem('email'))}`,
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
