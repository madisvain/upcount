import { assign, has } from 'lodash';

import app from '../app';

export async function list(sort) {
  try {
    return await app.db.find({
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
    return await app.db.get(id);
  } catch (error) {
    console.log(error);
  }
}

export async function getLogo(data) {
  const { id } = data;
  return await await app.db.getAttachment(id, 'logo');
}

export async function setLogo(data) {
  const { _id, _rev, file } = data;
  try {
    const response = await app.db.putAttachment(_id, 'logo', _rev, file, file.type);
    return await app.db.getAttachment(response.id, 'logo');
  } catch (error) {
    console.log(error);
  }
}

export async function save(data) {
  try {
    if (has(data, '_id')) {
      const response = await app.db.put(
        assign(data, {
          updatedAt: new Date(),
        })
      );
      return await app.db.get(response.id);
    } else {
      const response = await app.db.post(
        assign(data, {
          type: 'organization',
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
