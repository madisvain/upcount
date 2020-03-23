import { SubmissionError, stopSubmit } from 'redux-form';
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

    *login({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(accountsService.login, data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', data.email);

        message.success('Login successful!', 5);

        yield call(resolve);
        yield put(stopSubmit('login'));
      } catch (e) {
        message.error(i18n._(t`Error logging in!`), 5);
        yield call(reject, new SubmissionError(e.response.data));
      }
    },

    *register({ data }, { put, call }) {
      try {
        const response = yield call(accountsService.signup, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Registration successful!', 5);
        return response;
      } catch (e) {
        message.error(i18n._(t`Error registering!`), 5);
      }
    },

    *logout({}, { put, call }) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        yield put({ type: 'logoutSuccess' });
        message.success('Logout successful!', 5);
      } catch (e) {
        message.error(i18n._(t`Error logging out!`), 5);
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
