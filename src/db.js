import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

import api from './api';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer', { auto_compaction: true });

// CouchDB replication
if (
  localStorage.getItem('email') &&
  localStorage.getItem('token') &&
  localStorage.getItem('organization')
) {
  db.get(localStorage.getItem('organization'))
    .then(organization => {
      api()
        .post('organizations/', { id: organization._id })
        .then(function(response) {
          setTimeout(() => {
            const couchDB = new PouchDB(
              `https://couchdb.upcount.app/organization-${response.data.id}`,
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
          }, 5000);
        })
        .catch(function(error) {
          console.log(error);
        });
    })
    .catch(function(error) {
      console.log(error);
    });
}

export default db;
