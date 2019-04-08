import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Drawer, Form, Select } from 'antd';
import { get, has, map } from 'lodash';

import pathToRegexp from 'path-to-regexp';
import router from 'umi/router';

import { AInput, APhoneInput, ASelect, ATextarea } from '../../components/forms/fields';

class ClientForm extends Component {
  state = {
    emails: [],
  };

  closeDrawer = () => {
    const pathname = get(this.props, ['location', 'pathname']);
    const match = pathToRegexp(`/(.*)/:subpath`).exec(pathname);

    router.push({
      pathname: `/${get(match, 1, 'clients')}`,
    });
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
  }

  isNew = () => {
    const {
      match: { params },
    } = this.props;

    const pathname = get(this.props, ['location', 'pathname']);
    const match = pathToRegexp(`/:path/(.*)`).exec(pathname);

    return has(params, 'id') && params['id'] === 'new' || get(match, 1) !== 'clients';
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
          <Field name="name" component={AInput} label="Name" />
          <Field name="address" component={ATextarea} label="Address" rows={4} />
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
      </Drawer>
    );
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
        dispatch({ type: 'clients/save', data: data, redirect: '/clients', resolve, reject });
      });
    },
  })
)(ClientForm);
