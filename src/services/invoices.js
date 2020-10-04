import { assign, has } from 'lodash';
import moment from 'moment';

import db from '../db';

export async function list(sort) {
  try {
    // Check indexes
    await db.createIndex({
      index: { fields: ['type'] },
    });
    await db.createIndex({
      index: { fields: ['number'] },
    });

    return await db.find({
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
    return await db.get(id);
  } catch (error) {
    console.log(error);
  }
}

export async function save(data) {
  // Convert the moment objects to date strings
  if (has(data, 'date') && moment.isMoment(data['date'])) {
    data['date'] = data['date'].format('YYYY-MM-DD');
  }
  if (has(data, 'due_date') && moment.isMoment(data['due_date'])) {
    data['due_date'] = data['due_date'].format('YYYY-MM-DD');
  }

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

export async function remove(data) {
  try {
    return db.remove(data._id, data._rev);
  } catch (error) {
    console.log(error);
  }
}
