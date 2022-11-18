import React, { useState } from 'react';
import { Button, Col, Card, Form, Input, List, Row, Modal, Empty, Spin } from 'antd';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { useRxCollection, useRxData } from 'rxdb-hooks';

import { OrganizationContext } from '../providers/contexts';

const Organizations = props => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const organizationsCollection = useRxCollection('organizations');
  const { result: organizations, isFetching } = useRxData('organizations', collection =>
    collection.find()
  );
  console.log(organizations);

  const handleSubmit = values => {
    if (!submitting) {
      setSubmitting(true);
      organizationsCollection.insert(values);
    }
  };

  if (isFetching) {
    return <Spin />;
  }

  if (organizations) {
    return (
      <OrganizationContext.Consumer>
        {context => (
          <Row>
            <Col offset={2} span={20} style={{ marginTop: 40 }}>
              <h2 style={{ marginBottom: 20 }}>
                <Trans>Organizations</Trans>
                <Button
                  type="primary"
                  style={{ marginBottom: 10, float: 'right' }}
                  onClick={() => setModalVisible(true)}
                >
                  <Trans>New organization</Trans>
                </Button>
                <Modal
                  title={t`New organization`}
                  visible={modalVisible}
                  okText={t`Create an organization`}
                  onOk={() => form.submit()}
                  onCancel={() => setModalVisible(false)}
                >
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                      name="name"
                      rules={[{ required: true, message: t`Please input name!` }]}
                    >
                      <Input
                        size="large"
                        placeholder={t`Organization name`}
                        style={{ textAlign: 'center', margin: '10px 0' }}
                      />
                    </Form.Item>
                  </Form>
                </Modal>
              </h2>
              {organizations && (
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
                  dataSource={organizations}
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
        )}
      </OrganizationContext.Consumer>
    );
  } else {
    return (
      <Row>
        <Col offset={2} span={20} style={{ textAlign: 'center', marginTop: 40 }}>
          <Empty />
          <h2 style={{ marginTop: 40 }}>
            <Trans>To get started create an organization</Trans>
          </h2>
          <Form onFinish={handleSubmit} layout="vertical">
            <Row>
              <Col offset={8} span={8}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: t`Please input organization name!` }]}
                >
                  <Input
                    size="large"
                    placeholder={t`Organization name`}
                    style={{ textAlign: 'center', margin: '10px 0' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              disabled={submitting}
              loading={submitting}
            >
              <Trans>Create</Trans>
            </Button>
          </Form>
        </Col>
      </Row>
    );
  }
};

export default withI18n()(Organizations);
