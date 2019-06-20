import { initialize } from 'redux-form';
import { message } from 'antd';
import { keyBy } from 'lodash';

import * as invoicesService from '../services/invoices';

export default {
  namespace: 'invoices',

  state: {
    items: {},
  },

  effects: {
    *list({ payload: { sort = ['number'] } = {} }, { put, call }) {
      try {
        const response = yield call(invoicesService.list, sort);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error('Error loading invoices list!', 5);
      }
    },

    *details(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(invoicesService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error('Error loading invoice details!', 5);
      }
    },

    *initialize(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(invoicesService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
        yield put(initialize('invoice', response, false));
      } catch (e) {
        message.error('Error initializing invoice form!', 5);
      }
    },

    *state(
      {
        payload: { _id, _rev, state },
      },
      { put, call }
    ) {
      try {
        const response = yield call(invoicesService.save, { _id, _rev, state });
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Invoice state changed!', 5);
      } catch (e) {
        message.error('Error changing invoice state!', 5);
      }
    },

    *save({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(invoicesService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Invoice saved!', 5);
        return response;
      } catch (e) {
        message.error('Error saving invoice!', 5);
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
    },
  },
};
