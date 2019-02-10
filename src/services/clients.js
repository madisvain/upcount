import { assign, has } from 'lodash';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB('invoicer');

// Create Document Type index
db.createIndex({
  index: { fields: ['type'] }
});


export async function list() {
  try {
    return await db.find({
      selector: {
        type: 'client'
      }
    });
  } catch (error) {
    console.log(error);
  }
}

export async function details(id) {
  try {
    return await db.get(id);
  } catch (error) {
    console.log(error);
  }
}

export async function save(data) {
  try {
    if (has(data, '_id')) {
      const response = await db.put(assign(data, {
        type: 'client',
        updatedAt: new Date()
      }));
      return await db.get(response.id);
    } else {
      const response = await db.post(assign(data, {
        type: 'client',
        createdAt: new Date()
      }));
      return await db.get(response.id);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function remove(id) {

}