import { assign, has } from 'lodash';

import app from '../app';

export async function list(sort) {
  try {
    return await app.db.find({
      selector: {
        type: 'invoice',
        organization: localStorage.getItem('organization'),
        number: { $gte: null },
      },
      sort: sort,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function details(id) {
  try {
    return await app.db.get(id);
  } catch (error) {
    console.log(error);
  }
}

export async function save(data) {
  try {
    if (has(data, '_id')) {
      const original = await app.db.get(data._id);
      const response = await app.db.put(
        assign(original, data, {
          updatedAt: new Date(),
        })
      );
      return await app.db.get(response.id);
    } else {
      const response = await app.db.post(
        assign(data, {
          type: 'invoice',
          state: 'draft',
          organization: localStorage.getItem('organization'),
          createdAt: new Date(),
        })
      );
      return await app.db.get(response.id);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function remove(id) {}
