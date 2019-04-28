import { routerRedux } from 'dva/router';
import { initialize } from 'redux-form';
import { message } from 'antd';
import { keyBy } from 'lodash';

import * as taxRatesService from '../services/tax-rates';

export default {
  namespace: 'taxRates',

  state: {
    items: {},
  },

  effects: {
    *list({ payload: { sort = ['name'] } = {} }, { put, call }) {
      try {
        const response = yield call(taxRatesService.list, sort);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error('Error loading tax rates list!', 5);
      }
    },

    *details(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(taxRatesService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error('Error loading tax rate details!', 5);
      }
    },

    *initialize(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(taxRatesService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
        yield put(initialize('taxRate', response, false));
      } catch (e) {
        message.error('Error initializing tax rate form!', 5);
      }
    },

    *save({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(taxRatesService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Tax rate saved!', 5);
        yield put(routerRedux.push('/settings/'));
        return response;
      } catch (e) {
        message.error('Error saving tax rate!', 5);
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
