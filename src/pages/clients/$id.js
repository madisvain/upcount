import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Drawer, Form, Select } from 'antd';
import { has, map } from 'lodash';

import router from 'umi/router';

import { AInput, APhoneInput, ASelect, ATextarea } from '../../components/fields';

class ClientForm extends Component {
  state = {
    emails: [],
  };

  closeDrawer = () => {
    router.push({
      pathname: '/clients',
    })
  };

  componentWillMount() {
    const {
      match: { params },
    } = this.props;

    if (!this.isNew()) {
      this.props.dispatch({
        type: 'clients/initialize',
        payload: {
          id: params['id'],
        },
      });
    }
  };

  isNew = () => {
    const {
      match: { params },
    } = this.props;

    return has(params, 'id') && params['id'] === 'new';
  };

  render() {
    const { emails } = this.state;
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <Drawer
        title={this.isNew() ? 'Add client' : 'Edit client'}
        width={450}
        placement="right"
        onClose={this.closeDrawer}
        maskClosable={true}
        visible={true}
        style={{
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: 53,
        }}
      >
        <Form onSubmit={handleSubmit} layout="vertical">
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
          <Button
            type="primary"
            htmlType="submit"
            disabled={pristine || submitting}
            loading={submitting}
            style={{ marginTop: '10px' }}
          >
            Save account role
          </Button>
        </Form>
      </Drawer>
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
