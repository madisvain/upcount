import { routerRedux } from 'dva/router';
import { initialize, stopSubmit } from 'redux-form';
import { message } from 'antd';
import { keyBy } from 'lodash';

import * as clientsService from '../services/clients';

export default {
  namespace: 'clients',

  state: {
    items: {}
  },

  effects: {
    *list(action, { put, call }) {
      try {
        const response = yield call(clientsService.list);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error('Error loading clients list!', 5);
      }
    },

    *details(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(clientsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error('Error loading client details!', 5);
      }
    },

    *initialize(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(clientsService.details, id);
        yield put(initialize('client', response, false));
      } catch (e) {
        message.error('Error initializing client form!', 5);
      }
    },

    *save({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(clientsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Client saved!', 5);
        yield put(stopSubmit('client'));
        yield put(routerRedux.push('/clients/'));
      } catch (e) {
        message.error('Error saving client!', 5);
      }
    },
  },

  reducers: {
    listSuccess(state, payload) {
      const { data } = payload;

      return {
        ...state,
        items: keyBy(data, '_id'),
      };
    },

    detailsSuccess(state, payload) {
      const { data } = payload;

      return {
        ...state,
        items: {
          ...state.items,
          [data._id]: data,
        },
      };
    }
  }
};
