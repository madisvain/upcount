import api from '../api';

export const login = async data => {
  console.log(data);
  return api().post('login/', data);
};

export const signup = async data => {
  return api().post('signup/', data);
};

export const list = async data => {
  return api().get('signup/', data);
};
