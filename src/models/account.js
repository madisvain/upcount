import { initialize } from 'redux-form';
import { message } from 'antd';
import { t } from '@lingui/macro';
import { keyBy } from 'lodash';

import { i18n } from '../layouts/base';
import * as accountsService from '../services/accounts';

export default {
  namespace: 'accounts',

  state: {
    items: {},
  },

  effects: {
    *list({ payload: { sort = ['name'] } = {} }, { put, call }) {
      try {
        const response = yield call(accountsService.list, sort);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error(i18n._(t`Error loading accounts list!`), 5);
      }
    },

    *details({ payload: { id } }, { put, call }) {
      try {
        const response = yield call(accountsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error(i18n._(t`Error loading account details!`), 5);
      }
    },

    *initialize({ payload: { id } }, { put, call }) {
      try {
        const response = yield call(accountsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
        yield put(initialize('client', response, false));
      } catch (e) {
        message.error(i18n._(t`Error initializing account form!`), 5);
      }
    },

    *save({ data }, { put, call }) {
      try {
        const response = yield call(accountsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Client saved!', 5);
        return response;
      } catch (e) {
        message.error(i18n._(t`Error saving account!`), 5);
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
