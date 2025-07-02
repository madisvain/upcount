import { useEffect } from "react";
import { Form, Input, Select, Typography, Row, Col, Button, Space } from "antd";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import compact from "lodash/compact";
import map from "lodash/map";
import uniq from "lodash/uniq";
import first from "lodash/first";

import { organizationAtom, organizationsAtom, organizationIdAtom } from "src/atoms/organization";
import { countries } from "src/utils/countries";

const { Title, Text } = Typography;

const submittingAtom = atom(false);
const currencies = compact(uniq(map(countries, "currency_code")));

const Index = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();

  // Atoms
  const organizations = useAtomValue(organizationsAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setOrganization = useSetAtom(organizationAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);


  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setOrganization(values);
    navigate("/settings/organization");
    setSubmitting(false);
  };

  const handleCancel = () => {
    // Activate the first organization to get user unstuck
    const firstOrganization = first(organizations);
    if (firstOrganization) {
      setOrganizationId(firstOrganization.id);
    }
  };


  // Handle redirect to invoices when organization exists
  useEffect(() => {
    if (organizationId) {
      navigate("/invoices");
    }
  }, [organizationId, navigate]);

  return (
    <>
      <Row style={{ marginTop: 100 }}>
        <Col span={12} offset={6}>
          <Text type="secondary" style={{ fontWeight: 400 }}>
            <Trans>Create your organization to get started</Trans>
          </Text>
          <Title level={3} style={{ marginTop: 12 }}>
            <Trans>Organization details</Trans>
          </Title>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" rules={[{ required: true, message: t`Please input name!` }]}>
              <Input placeholder={t`Name`} />
            </Form.Item>
            <Form.Item name="country">
              <Select placeholder={t`Country`} showSearch>
                {countries.map((country) => (
                  <Select.Option key={country.name} value={country.name}>
                    {country.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="currency">
              <Select placeholder={t`Currency`} showSearch>
                {currencies.map((currency) => (
                  <Select.Option key={currency} value={currency}>
                    {currency}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" disabled={submitting}>
                <Trans>Get started</Trans>
              </Button>
              {organizations.length > 0 && (
                <Button onClick={handleCancel} disabled={submitting}>
                  <Trans>Cancel</Trans>
                </Button>
              )}
            </Space>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Index;
