import { Component } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Drawer, Form } from 'antd';
import { has } from 'lodash';

import router from 'umi/router';

import { AInput, ATextarea } from '../../../components/fields';

class TaxForm extends Component {
  closeDrawer = () => {
    router.push({
      pathname: '/settings',
    });
  };

  componentWillMount() {
    const {
      match: { params },
    } = this.props;

    if (!this.isNew()) {
      this.props.dispatch({
        type: 'taxRates/initialize',
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

    return has(params, 'id') && params['id'] === 'new';
  };

  render() {
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <Drawer
        title={this.isNew() ? 'Add tax' : 'Edit tax'}
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
          <Field name="description" component={ATextarea} label="Description" rows={4} />
          <Field name="percentage" component={AInput} label="Percentage" />
          <Button
            type="primary"
            htmlType="submit"
            disabled={pristine || submitting}
            loading={submitting}
            style={{ marginTop: '10px' }}
          >
            Save percentage
          </Button>
        </Form>
      </Drawer>
    );
  }
}

export default compose(
  reduxForm({
    form: 'taxRate',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'taxRates/save', data: data, resolve, reject });
      });
    },
  })
)(TaxForm);
