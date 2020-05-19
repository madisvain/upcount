import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Form } from 'antd';
import { Trans } from '@lingui/macro';

import { AInput, APasswordInput } from '../forms/fields';

const AccountDrawer = ({ handleSubmit, pristine, submitting }) => {
  return (
    <div>
      <Form onFinish={() => handleSubmit()} layout="vertical">
        <Field name="email" component={AInput} label={<Trans>Email</Trans>} />
        <Field name="password" component={APasswordInput} label={<Trans>Password</Trans>} />
        <Button
          type="primary"
          htmlType="submit"
          disabled={pristine || submitting}
          loading={submitting}
          style={{ marginTop: '10px' }}
        >
          <Trans>Register</Trans>
        </Button>
      </Form>
    </div>
  );
};

export default compose(
  reduxForm({
    form: 'register',
    onSubmit: async (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'accounts/register', data: data, resolve, reject });
      });
    },
    onSubmitSuccess: (result, dispatch, props) => {
      props.closeDrawer();
    },
  })
)(AccountDrawer);
