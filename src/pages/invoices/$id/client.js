import { compose } from 'redux';
import { connect } from 'dva';
import { reduxForm } from 'redux-form';

import ClientForm from '../../clients/$id';

export default compose(
  connect(state => ({
    initialValues: {
      emails: [],
    },
  })),
  reduxForm({
    form: 'client',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'clients/save', data: data, resolve, reject });
      });
    },
  })
)(ClientForm);
