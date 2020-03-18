/* global API_URL:readonly */

import axios from 'axios';

export const getHeaders = () => {
  let headers = {
    Accept: 'application/json;',
  };
  if (localStorage.getItem('token')) {
    headers['Authorization'] = `Token ${localStorage.getItem('token')}`;
  }
  return headers;
};

export default () =>
  axios.create({
    baseURL: typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:8888/',
    timeout: 30000,
    headers: getHeaders(),
  });
