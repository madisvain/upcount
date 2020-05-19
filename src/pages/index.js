import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { withState } from 'recompose';
import { Button, Card, Empty, Form, List, Modal, Row, Col } from 'antd';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { values } from 'lodash';

import { AInput } from '../components/forms/fields';
import { required } from '../components/forms/validators';

import { OrganizationContext } from '../providers/contexts';

class Index extends Component {
  closeNewOrganizationModal = () => {
    this.setState({ newOrganizationModal: false });
  };

  render() {
    const {
      i18n,
      handleSubmit,
      organizations,
      organizationModal,
      setOrganizationModal,
      pristine,
      submitting,
    } = this.props;

    return (
      <OrganizationContext.Consumer>
        {context =>
          organizations ? (
            <Row>
              <Col offset={2} span={20} style={{ marginTop: 40 }}>
                <h2 style={{ marginBottom: 20 }}>
                  <Trans>Organizations</Trans>
                  <Button
                    type="primary"
                    style={{ marginBottom: 10, float: 'right' }}
                    onClick={() => setOrganizationModal(true)}
                  >
                    <Trans>New organization</Trans>
                  </Button>
                  <Modal
                    title={i18n._(t`New organization`)}
                    visible={organizationModal}
                    okText={<Trans>Create an organization</Trans>}
                    onOk={() => handleSubmit()}
                    onCancel={() => setOrganizationModal(false)}
                  >
                    <Form layout="vertical">
                      <Field
                        name="name"
                        component={AInput}
                        size="large"
                        placeholder={i18n._(t`Organization name`)}
                        style={{ textAlign: 'center', margin: '10px 0' }}
                        validate={[required]}
                      />
                    </Form>
                  </Modal>
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
                          onClick={() => context.setOrganization(organization)}
                          style={{ cursor: 'pointer' }}
                        >
                          {organization.name}
                        </Card>
                      </List.Item>
                    )}
                  />
                )}
              </Col>
            </Row>
          ) : (
            <Row>
              <Col offset={2} span={20} style={{ textAlign: 'center', marginTop: 40 }}>
                <Empty />
                <h2 style={{ marginTop: 40 }}>
                  <Trans>To get started</Trans>
                </h2>
                <Form onFinish={() => handleSubmit()} layout="vertical">
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
          )
        }
      </OrganizationContext.Consumer>
    );
  }
}

export default compose(
  withI18n(),
  withState('organizationModal', 'setOrganizationModal', false),
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
    onSubmitSuccess: (result, dispatch, props) => {
      props.setOrganizationModal(false);
    },
  })
)(Index);
