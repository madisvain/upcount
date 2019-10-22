import { reducer as formReducer } from 'redux-form';
import { message } from 'antd';

// DVA
export const dva = {
  config: {
    extraReducers: {
      form: formReducer,
    },
    onError(err) {
      err.preventDefault();
      console.error(err.message);
      message.error(err.message);
    },
  },
};
