import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Form } from 'antd';
import { Trans } from '@lingui/macro';

import { AInput, APasswordInput } from '../forms/fields';

const AccountDrawer = ({ setForm, handleSubmit, pristine, submitting }) => {
  return (
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
        <Trans>Log in</Trans>
      </Button>
    </Form>
  );
};

export default compose(
  reduxForm({
    form: 'register',
    onSubmit: async (data, dispatch) => {
      return await dispatch({ type: 'accounts/register', data: data });
    },
    onSubmitSuccess: (result, dispatch, props) => {
      props.setForm();
    },
  })
)(AccountDrawer);
