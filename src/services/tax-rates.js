import { assign, has } from 'lodash';

import db from '../db';

export async function list(sort) {
  try {
    return await db.find({
      selector: {
        type: 'taxRate',
        name: { $gte: null },
      },
      sort: sort,
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
      const response = await db.put(
        assign(data, {
          updatedAt: new Date(),
        })
      );
      return await db.get(response.id);
    } else {
      const response = await db.post(
        assign(data, {
          type: 'taxRate',
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
