import { Component } from 'react';
import { Field } from 'redux-form';
import { Button, Form } from 'antd';

import { AInput, APhoneInput, ASelect, ATextarea } from '../../components/forms/fields';


class ClientForm extends Component {
  render() {
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit} layout="vertical">
        <Field name="name" component={AInput} label="Name" />
        <Field name="address" component={ATextarea} label="Address" rows={4} />
        <Field
          name="emails"
          component={ASelect}
          mode="tags"
          tokenSeparators={[',', ';']}
          label="Emails"
        />
        <Field name="phone" component={APhoneInput} label="Phone" />
        <Field name="vatin" component={AInput} label="VATIN" />
        <Field name="website" component={AInput} label="Website" />
        <Button
          type="primary"
          htmlType="submit"
          disabled={pristine || submitting}
          loading={submitting}
          style={{ marginTop: '10px' }}
        >
          Save client
        </Button>
      </Form>
    )
  }
}

export default ClientForm;
