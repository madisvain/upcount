import { initialize } from 'redux-form';
import { message } from 'antd';
import { keyBy } from 'lodash';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { push } from 'connected-react-router';

import * as invoicesService from '../services/invoices';

export default {
  namespace: 'invoices',

  state: {
    items: {},
  },

  effects: {
    *list({ payload: { sort = [{ number: 'desc' }] } = {} }, { put, call }) {
      try {
        const response = yield call(invoicesService.list, sort);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error(i18n._(t`Error loading invoices list!`), 5);
      }
    },

    *details({ payload: { id } }, { put, call }) {
      try {
        const response = yield call(invoicesService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error(i18n._(t`Error loading invoice details!`), 5);
      }
    },

    *initialize({ payload: { id } }, { put, call }) {
      try {
        const response = yield call(invoicesService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
        yield put(initialize('invoice', response, false));
      } catch (e) {
        message.error(i18n._(t`Error initializing invoice form!`), 5);
      }
    },

    *state({ payload: { _id, _rev, state } }, { put, call }) {
      try {
        const response = yield call(invoicesService.save, { _id, _rev, state });
        yield put({ type: 'detailsSuccess', data: response });
        message.success(i18n._(t`Invoice state changed!`), 5);
      } catch (e) {
        message.error(i18n._(t`Error changing invoice state!`), 5);
      }
    },

    *save({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(invoicesService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success(i18n._(t`Invoice saved!`), 5);
        return response;
      } catch (e) {
        message.error(i18n._(t`Error saving invoice!`), 5);
      }
    },

    *remove({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(invoicesService.remove, data);
        yield put({ type: 'removeSuccess', data: response });
        message.success(i18n._(t`Invoice deleted!`), 5);
        yield put(push('/invoices'));
      } catch (e) {
        message.error(i18n._(t`Error deleting invoice!`), 5);
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

    removeSuccess(state, payload) {
      const { data } = payload;

      let items = { ...state.items };
      delete items[data._id];

      return {
        ...state,
        items: items,
      };
    },
  },
};
