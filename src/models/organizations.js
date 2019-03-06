import { routerRedux } from 'dva/router';
import { initialize, stopSubmit } from 'redux-form';
import { message } from 'antd';

import * as organizationsService from '../services/organizations';

export default {
  namespace: 'settings',

  state: {},

  effects: {
    *details({ payload }, { put, call }) {
      try {
        const response = yield call(organizationsService.details);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error('Error loading organization details!', 5);
      }
    },

    *initialize({ payload }, { put, call }) {
      try {
        const response = yield call(organizationsService.details);
        yield put(initialize('settings', response, false));
      } catch (e) {
        message.error('Error initializing organization!', 5);
      }
    },

    *save({ data }, { put, call }) {
      try {
        const response = yield call(organizationsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Settings saved!', 5);
        yield put(stopSubmit('settings'));
        yield put(routerRedux.push('/settings/'));
      } catch (e) {
        message.error('Error saving organization!', 5);
      }
    },
  },

  reducers: {
    detailsSuccess(state, payload) {
      const { data } = payload;
      return data;
    },
  },
};
