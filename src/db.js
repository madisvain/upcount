import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { assignIn } from 'lodash';

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
              filter: doc => {
                return doc.organization === organization._id || doc._id === organization._id;
              },
            })
              .on('change', function(change) {
                console.log('Change:', change);
                // Update syncedAt timestamps
                const syncedAt = JSON.parse(localStorage.getItem('syncedAt')) || {};
                localStorage.setItem(
                  'syncedAt',
                  JSON.stringify(assignIn(syncedAt, { [organization._id]: new Date() }))
                );
              })
              .on('paused', function(info) {
                console.log('Sync paused:', info);
              })
              .on('active', function(info) {
                console.log('Sync active:', info);
              })
              .on('error', function(err) {
                console.log('Sync error:', err);
              });
          }, 2000);
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
