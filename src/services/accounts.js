import api from '../api';

export const login = async data => {
  return api().post('login/', data);
};

export const signup = async data => {
  return api().post('signup/', data);
};

export const list = async () => {
  return api().get('users/');
};

export const details = async id => {
  return api().get(`users/${id}/`);
};
