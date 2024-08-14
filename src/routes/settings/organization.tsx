import { Button, Col, Form, Input, Popconfirm, Space, Typography, Row } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { HomeOutlined } from "@ant-design/icons";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import isEmpty from "lodash/isEmpty";

import { organizationAtom, setOrganizationsAtom, deleteOrganizationAtom } from "src/atoms";

const { Title } = Typography;
const { TextArea } = Input;

const submittingAtom = atom(false);

function SettingsInvoice() {
  useLingui();
  const [form] = Form.useForm();

  const setOrganizations = useSetAtom(setOrganizationsAtom);
  const deleteOrganization = useSetAtom(deleteOrganizationAtom);
  const [organization, setOrganization] = useAtom(organizationAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);

  const onSubmit = async (values: object) => {
    setSubmitting(true);
    setOrganization(values);
    setOrganizations();
    setSubmitting(false);
  };
  const onDelete = () => {
    setSubmitting(true);
    deleteOrganization();
    setSubmitting(false);
  };

  return (
    <>
      {!isEmpty(organization) && (
        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={organization}>
          <Row style={{ backgroundColor: "#fff" }}>
            <Col span={24}>
              <Title level={3} style={{ marginTop: 0 }}>
                <Space>
                  <HomeOutlined />
                  <Trans>Organization details</Trans>
                </Space>
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={t`Name`} name="name" rules={[{ required: true, message: "This field is required!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t`Address`} name="address">
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item label={t`E-mail`} name="email">
                <Input />
              </Form.Item>
              <Form.Item label={t`Phone`} name="phone">
                <Input />
              </Form.Item>
              <Form.Item label={t`Registration number`} name="registration_number">
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label={t`Bank name`} name="bank_name">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label={t`IBAN`} name="iban">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={`VATIN`} name="vatin">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item label={`Website`} name="website">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Space>
                <Button type="primary" htmlType="submit" disabled={submitting} loading={submitting}>
                  <Trans>Save</Trans>
                </Button>
                <Popconfirm
                  title={t`Are you sure delete this organization?`}
                  onConfirm={onDelete}
                  okText={t`Yes`}
                  cancelText={t`No!`}
                >
                  <Button type="default" danger loading={submitting}>
                    <Trans>Delete</Trans>
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Form>
      )}
    </>
  );
}

export default SettingsInvoice;
