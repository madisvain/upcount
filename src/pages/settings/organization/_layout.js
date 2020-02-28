import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, Form, reduxForm } from 'redux-form';
import { Button, Col, Icon, Layout, Row } from 'antd';
import { Trans } from '@lingui/macro';

import { AInput, APhoneInput, ATextarea } from '../../../components/forms/fields';

class Organization extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'organizations/initialize',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });
  }

  render() {
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <div>
        <Layout.Content>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <Icon type="home" />
                {` `}
                <Trans>Organization details</Trans>
              </h2>
              <Form layout="vertical" onSubmit={handleSubmit}>
                <Field name="name" component={AInput} label={<Trans>Name</Trans>} />
                <Field
                  name="address"
                  component={ATextarea}
                  rows={4}
                  label={<Trans>Address</Trans>}
                />
                <Field name="email" component={AInput} label={<Trans>Email</Trans>} />
                <Field name="phone" component={APhoneInput} label={<Trans>Phone</Trans>} />
                <Field
                  name="registration_number"
                  component={AInput}
                  label={<Trans>Registration number</Trans>}
                />
                <Row gutter={16}>
                  <Col span={12}>
                    <Field name="bank" component={AInput} label={<Trans>Bank name</Trans>} />
                  </Col>
                  <Col span={12}>
                    <Field name="iban" component={AInput} label={<Trans>IBAN</Trans>} />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Field name="vatin" component={AInput} label={<Trans>VATIN</Trans>} />
                  </Col>
                </Row>
                <Field name="website" component={AInput} label={<Trans>Website</Trans>} />
                <Row>
                  <Col>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={pristine || submitting}
                      loading={submitting}
                      style={{ marginTop: '10px' }}
                    >
                      <Trans>Save</Trans>
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Layout.Content>
      </div>
    );
  }
}

export default compose(
  connect(state => ({})),
  reduxForm({
    form: 'organization',
    onSubmit: async (data, dispatch) => {
      return await dispatch({ type: 'organizations/save', data: data });
    },
    onSubmitSuccess: (result, dispatch) => {
      dispatch({
        type: 'organizations/initialize',
        payload: {
          id: localStorage.getItem('organization'),
        },
      });
    },
  })
)(Organization);
