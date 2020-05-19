import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Form, Button, Col, Layout, Row, Popconfirm } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { get } from 'lodash';

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

  handleDelete = () => {
    const { organizations } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));

    this.props.dispatch({
      type: 'organizations/remove',
      data: organization,
    });
  };

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
            </Col>
          </Row>
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
              <Popconfirm
                title="Are you sure delete this organization?"
                onConfirm={this.handleDelete}
                okText="Yes"
                cancelText="No!"
              >
                <Button
                  type="danger"
                  loading={submitting}
                  style={{ marginTop: '10px', float: 'right' }}
                >
                  <Trans>Delete</Trans>
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </Form>
      </Layout.Content>
    );
  }
}

export default compose(
  connect(state => ({
    organizations: state.organizations,
  })),
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
