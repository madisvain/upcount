import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Card, Form, List, Row, Col } from 'antd';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { values } from 'lodash';

import router from 'umi/router';

import { AInput } from '../components/forms/fields';

class Index extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
  }

  setOrganization = id => {
    localStorage.setItem('organization', id);
    router.push({
      pathname: '/invoices',
    });
  };

  render() {
    const { i18n, handleSubmit, organizations, pristine, submitting } = this.props;

    return (
      <Row>
        <Col offset={2} span={20} style={{ marginTop: 40, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 20 }}>
            <Trans>Organizations</Trans>
          </h2>
          {organizations.items && (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 6,
                xxl: 3,
              }}
              dataSource={values(organizations.items)}
              renderItem={organization => (
                <List.Item>
                  <Card
                    title={organization.name}
                    onClick={() => this.setOrganization(organization._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {organization.name}
                  </Card>
                </List.Item>
              )}
            />
          )}
          <h2 style={{ marginTop: 80 }}>
            <Trans>To get started</Trans>
          </h2>
          <Form onSubmit={handleSubmit} layout="vertical">
            <Row>
              <Col offset={8} span={8}>
                <Field
                  name="name"
                  component={AInput}
                  size="large"
                  placeholder={i18n._(t`Organization name`)}
                  style={{ textAlign: 'center', margin: '10px 0' }}
                />
              </Col>
            </Row>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              disabled={pristine || submitting}
              loading={submitting}
            >
              <Trans>Create an organization</Trans>
            </Button>
          </Form>
        </Col>
      </Row>
    );
  }
}

export default compose(
  withI18n(),
  connect(state => ({
    organizations: state.organizations,
  })),
  reduxForm({
    form: 'organization',
    onSubmit: async (data, dispatch) => {
      return await dispatch({ type: 'organizations/save', data: data });
    },
  })
)(Index);
