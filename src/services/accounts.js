import api from '../api';

export const login = async data => {
  return api().post('login/', data);
};

export const signup = async data => {
  return api().post('signup/', data);
};
