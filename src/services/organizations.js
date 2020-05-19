import { assign, has } from 'lodash';
import db from '../db';

export async function list(sort) {
  try {
    // Check indexes
    await db.createIndex({
      index: { fields: ['type'] },
    });
    await db.createIndex({
      index: { fields: ['name'] },
    });

    return await db.find({
      selector: {
        type: 'organization',
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

export async function getLogo(data) {
  const { id } = data;
  return await db.getAttachment(id, 'logo');
}

export async function setLogo(data) {
  const { _id, _rev, file } = data;
  try {
    const response = await db.putAttachment(_id, 'logo', _rev, file, file.type);
    return await db.getAttachment(response.id, 'logo');
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
          type: 'organization',
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
