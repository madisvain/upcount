import { reducer as formReducer } from 'redux-form';
import { message } from 'antd';

export function config() {
  return {
    extraReducers: {
      form: formReducer,
    },
    onError(err) {
      err.preventDefault();
      message.error(err.message);
    },
  };
}