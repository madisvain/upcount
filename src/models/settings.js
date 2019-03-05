import { routerRedux } from 'dva/router';
import { initialize, stopSubmit } from 'redux-form';
import { message } from 'antd';

import * as settingsService from '../services/settings';

export default {
  namespace: 'settings',

  state: {
  },

  effects: {
    *details({ payload }, { put, call }) {
      try {
        const response = yield call(settingsService.details);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error('Error loading settings details!', 5);
      }
    },

    *initialize({ payload }, { put, call }) {
      try {
        const response = yield call(settingsService.details);
        yield put(initialize('settings', response, false));
      } catch (e) {
        message.error('Error initializing settings!', 5);
      }
    },

    *save({ data }, { put, call }) {
      try {
        const response = yield call(settingsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success('Settings saved!', 5);
        yield put(stopSubmit('settings'));
        yield put(routerRedux.push('/settings/'));
      } catch (e) {
        message.error('Error saving settings!', 5);
      }
    },
  },

  reducers: {
    detailsSuccess(state, payload) {
      const { data } = payload;
      return data;
    }
  }
};
