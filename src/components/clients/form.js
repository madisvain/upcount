import { Component } from 'react';
import { Field } from 'redux-form';
import { Button, Form } from 'antd';
import { Trans } from '@lingui/macro';

import { AInput, APhoneInput, ASelect, ATextarea } from '../../components/forms/fields';
import { emails, required } from '../../components/forms/validators';

class ClientForm extends Component {
  render() {
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit} layout="vertical">
        <Field name="name" component={AInput} label={<Trans>Name</Trans>} validate={[required]} />
        <Field name="address" component={ATextarea} label={<Trans>Address</Trans>} rows={4} />
        <Field
          name="emails"
          component={ASelect}
          mode="tags"
          tokenSeparators={[',', ';']}
          label={<Trans>Emails</Trans>}
          validate={[emails]}
        />
        <Field name="phone" component={APhoneInput} label={<Trans>Phone</Trans>} />
        <Field name="vatin" component={AInput} label={<Trans>VATIN</Trans>} />
        <Field name="website" component={AInput} label={<Trans>Website</Trans>} />
        <Button
          type="primary"
          htmlType="submit"
          disabled={pristine || submitting}
          loading={submitting}
          style={{ marginTop: '10px' }}
        >
          <Trans>Save client</Trans>
        </Button>
      </Form>
    );
  }
}

export default ClientForm;
