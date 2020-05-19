import { initialize, stopSubmit } from 'redux-form';
import { message } from 'antd';
import { t } from '@lingui/macro';
import { push } from 'connected-react-router';
import { assign, keyBy } from 'lodash';

import { i18n } from '../layouts/base';
import * as organizationsService from '../services/organizations';

export default {
  namespace: 'organizations',

  state: {
    items: {},
  },

  effects: {
    *list({ payload: { sort = ['name'] } = {} }, { put, call }) {
      try {
        const response = yield call(organizationsService.list, sort);
        yield put({ type: 'listSuccess', data: response.docs });
      } catch (e) {
        message.error(i18n._(t`Error loading organizations list!`), 5);
      }
    },

    *details(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
      } catch (e) {
        message.error(i18n._(t`Error loading organization details!`), 5);
      }
    },

    *initialize(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.details, id);
        yield put({ type: 'detailsSuccess', data: response });
        yield put(initialize('organization', response, false));
      } catch (e) {
        message.error(i18n._(t`Error initializing organization form!`), 5);
      }
    },

    *getLogo(
      {
        payload: { id },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.getLogo, { id });
        yield put({ type: 'logoSuccess', data: assign(response, { id }) });
      } catch (e) {
        if (!(e.status === 404)) {
          message.error(i18n._(t`Error getting organization logo!`), 5);
        }
      }
    },

    *setLogo(
      {
        payload: { _id, _rev, file },
      },
      { put, call }
    ) {
      try {
        const response = yield call(organizationsService.setLogo, { _id, _rev, file });
        yield put({ type: 'logoSuccess', data: assign(response) });
        message.success(i18n._(t`Organization logo set!`), 5);
      } catch (e) {
        message.error(i18n._(t`Error setting organization logo!`), 5);
      }
    },

    *setSync({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(organizationsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });
        message.success(
          data.sync
            ? i18n._(t`Organization sync enabled!`)
            : i18n._(t`Organization sync disabled!`),
          5
        );
      } catch (e) {
        message.error(i18n._(t`Error setting organization sync!`), 5);
      }
    },

    *save({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(organizationsService.save, data);
        yield put({ type: 'detailsSuccess', data: response });

        message.success(i18n._(t`Organization saved!`), 5);

        yield call(resolve);
        yield put(stopSubmit('organization'));
      } catch (e) {
        message.error(i18n._(t`Error saving organization!`), 5);
      }
    },

    *remove({ data, resolve, reject }, { put, call }) {
      try {
        const response = yield call(organizationsService.remove, data);
        yield put({ type: 'removeSuccess', data: response });
        message.success(i18n._(t`Organization deleted!`), 5);
        yield put(push('/'));
      } catch (e) {
        message.error(i18n._(t`Error deleting organization!`), 5);
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

    logoSuccess(state, payload) {
      const { data } = payload;

      return {
        ...state,
        logos: {
          ...state.logos,
          [data.id]: URL.createObjectURL(data),
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
