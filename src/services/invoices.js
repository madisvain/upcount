import { assign, has } from 'lodash';

import db from '../db';

export async function list() {
  try {
    return await db.find({
      selector: {
        type: 'invoice',
        organization: localStorage.getItem('organization'),
      },
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
      const original = await db.get(data._id);
      const response = await db.put(
        assign(original, data, {
          updatedAt: new Date(),
        })
      );
      return await db.get(response.id);
    } else {
      const response = await db.post(
        assign(data, {
          type: 'invoice',
          state: 'draft',
          organization: localStorage.getItem('organization'),
          createdAt: new Date(),
        })
      );
      return await db.get(response.id);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function remove(id) {}
