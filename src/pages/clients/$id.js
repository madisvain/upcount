import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Col, Form, Row, Select } from 'antd';
import { map } from 'lodash';

import currencyToSymbolMap from 'currency-symbol-map/map';
import { AInput, APhoneInput, ASelect, ATextarea } from '../../components/fields';

class ClientForm extends Component {
  state = {
    emails: [],
  };

  render() {
    const { emails } = this.state;

    return (
      <div>
        <Form>
          <Field
            name="name"
            component={AInput}
            label="Name"
          />
          <Field
            name="address"
            component={ATextarea}
            label="Address"
            rows={4}
          />
          <Field
            name="emails"
            component={ASelect}
            mode="tags"
            tokenSeparators={[',', ';']}
            label="Emails"
          >
            {map(emails.items, email => (
              <Select.Option value={email} key={email}>
                {email}
              </Select.Option>
            ))}
          </Field>
          <Field
            name="phone"
            component={APhoneInput}
            label="Phone"
          />
          <Field
            name="vatin"
            component={AInput}
            label="VATIN"
          />
          <Field
            name="website"
            component={AInput}
            label="Website"
          />
        </Form>
      </div>
    )
  }
}

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
