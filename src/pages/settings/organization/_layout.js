import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Form, Button, Col, Layout, Row } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
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
      <Layout.Content>
        <Form layout="vertical" onFinish={() => handleSubmit()}>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <HomeOutlined />
                {` `}
                <Trans>Organization details</Trans>
              </h2>
              <Field name="name" component={AInput} label={<Trans>Name</Trans>} />
              <Field name="address" component={ATextarea} rows={4} label={<Trans>Address</Trans>} />
              <Field name="email" component={AInput} label={<Trans>Email</Trans>} />
              <Field name="phone" component={APhoneInput} label={<Trans>Phone</Trans>} />
              <Field
                name="registration_number"
                component={AInput}
                label={<Trans>Registration number</Trans>}
              />
              <Row gutter={16}>
                <Col span={24}>
                  <Field name="bank" component={AInput} label={<Trans>Bank name</Trans>} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
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
                <Col span={24}>
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
            </Col>
          </Row>
        </Form>
      </Layout.Content>
    );
  }
}

export default compose(
  connect(state => ({})),
  reduxForm({
    form: 'organization',
    onSubmit: async (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'organizations/save', data: data, resolve, reject });
      });
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
