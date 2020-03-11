import { Component } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Drawer, Form } from 'antd';
import { Trans } from '@lingui/macro';
import { has } from 'lodash';

import router from 'umi/router';

import { AInput, ATextarea } from '../../../components/forms/fields';

class TaxForm extends Component {
  closeDrawer = () => {
    router.push({
      pathname: '/settings/tax-rates',
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
        title={this.isNew() ? <Trans>Add tax</Trans> : <Trans>Edit tax</Trans>}
        width={450}
        placement="right"
        onClose={this.closeDrawer}
        maskClosable={true}
        visible={true}
      >
        <Form onFinish={() => handleSubmit()} layout="vertical">
          <Field name="name" component={AInput} label={<Trans>Name</Trans>} />
          <Field
            name="description"
            component={ATextarea}
            label={<Trans>Description</Trans>}
            rows={4}
          />
          <Field name="percentage" component={AInput} label={<Trans>Percentage</Trans>} />
          <Button
            type="primary"
            htmlType="submit"
            disabled={pristine || submitting}
            loading={submitting}
            style={{ marginTop: '10px' }}
          >
            <Trans>Save tax rate</Trans>
          </Button>
        </Form>
      </Drawer>
    );
  }
}

export default compose(
  reduxForm({
    form: 'taxRate',
    onSubmit: async (data, dispatch) => {
      return await dispatch({ type: 'taxRates/save', data: data });
    },
    onSubmitSuccess: (result, dispatch) => {
      router.push({
        pathname: '/settings/tax-rates',
      });
    },
  })
)(TaxForm);
