import { Button, Col, Form, Input, InputNumber, Select, Space, Typography, Row, Upload, Divider, message } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { FileTextOutlined, UploadOutlined, CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import map from "lodash/map";
import isEmpty from "lodash/isEmpty";

const { Title } = Typography;
const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

import { organizationAtom, setOrganizationsAtom } from "src/atoms/organization";
import { currencies, getCurrencySymbol } from "src/utils/currencies";
import { validateInvoiceFormat, generateInvoiceNumber } from "src/utils/invoice";

const submittingAtom = atom(false);

function SettingsInvoice() {
  const [form] = Form.useForm();
  const { i18n } = useLingui();

  const setOrganizations = useSetAtom(setOrganizationsAtom);
  const [organization, setOrganization] = useAtom(organizationAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);
  const [showVariables, setShowVariables] = useState(false);

  // Generate preview based on form values
  const invoiceFormat = Form.useWatch("invoiceNumberFormat", form);
  const getPreview = (format: string | undefined) => {
    const template = format || organization?.invoiceNumberFormat;
    if (!template) return "";

    const counter = (organization?.invoiceNumberCounter || 0) + 1;
    // Use a pseudo client code for preview
    return generateInvoiceNumber(template, counter, new Date(), "AB");
  };

  const invoiceNumberPreview = getPreview(invoiceFormat);

  const onSubmit = async (values: object) => {
    setSubmitting(true);
    await setOrganization(values);
    await setOrganizations();
    setSubmitting(false);
  };
  // const onDelete = () => {};

  const onLogoUpload = (data: any) => {
    const file = data.file;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      message.error(t`Please upload a PNG or JPEG image`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const base64data = reader.result;
      setOrganization({ ...organization, logo: base64data });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {!isEmpty(organization) && (
        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={organization}>
          <Row>
            <Col span={12}>
              <Title level={3} style={{ marginTop: 0 }}>
                <Space>
                  <FileTextOutlined />
                  <Trans>Invoice details</Trans>
                </Space>
              </Title>

              <Form.Item
                label={t`Currency`}
                name="currency"
                rules={[{ required: true, message: t`This field is required!` }]}
              >
                <Select showSearch>
                  {map(currencies, (currency) => {
                    const symbol = getCurrencySymbol(i18n.locale, currency);
                    return (
                      <Option value={currency} key={currency}>
                        {`${currency} ${currency !== symbol ? symbol : ""}`}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label={t`Decimal places`} name="minimum_fraction_digits">
                <InputNumber min={0} max={10} />
              </Form.Item>
              <Form.Item label={t`Due days`} name="due_days">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label={t`Overdue charge`} help={<Trans>% per day</Trans>} name="overdueCharge">
                <InputNumber
                  min={0}
                  step={0.01}
                  formatter={(value) => `${value} %`}
                  parser={(value) => value?.replace("%", "") as any}
                  placeholder="0%"
                />
              </Form.Item>
              <Form.Item label={t`Notes`} name="customerNotes">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Divider orientation="left">
                <Trans>Invoice Numbering</Trans>
              </Divider>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={t`Invoice Number Format`}
                name="invoiceNumberFormat"
                rules={[
                  { required: true, message: t`This field is required!` },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      const validation = validateInvoiceFormat(value);
                      if (!validation.isValid) {
                        return Promise.reject(new Error(validation.error));
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button
                type="link"
                size="small"
                onClick={() => setShowVariables(!showVariables)}
                style={{ marginTop: 4, padding: 0, height: "auto", gap: 2 }}
              >
                {showVariables ? <CaretDownOutlined /> : <CaretRightOutlined />}
                <Trans>Show variables</Trans>
              </Button>
              {showVariables && (
                <div style={{ marginBottom: 16, padding: "12px 16px", backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    <Trans>Available variables:</Trans>
                  </Text>
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <div>
                      <Text code>{"{number}"}</Text> - <Trans>Sequential number</Trans>
                    </div>
                    <div>
                      <Text code>{"{year}"}</Text> - <Trans>4-digit year</Trans> ({new Date().getFullYear()})
                    </div>
                    <div>
                      <Text code>{"{y}"}</Text> - <Trans>2-digit year</Trans> (
                      {String(new Date().getFullYear() % 100).padStart(2, "0")})
                    </div>
                    <div>
                      <Text code>{"{month}"}</Text> - <Trans>2-digit month</Trans> (
                      {String(new Date().getMonth() + 1).padStart(2, "0")})
                    </div>
                    <div>
                      <Text code>{"{m}"}</Text> - <Trans>Month name</Trans> (
                      {new Date().toLocaleString("en", { month: "short" })})
                    </div>
                    <div>
                      <Text code>{"{day}"}</Text> - <Trans>Day of month</Trans> (
                      {String(new Date().getDate()).padStart(2, "0")})
                    </div>
                    <div>
                      <Text code>{"{clientCode}"}</Text> - <Trans>Client code</Trans> (<Trans>e.g. AP, MS</Trans>)
                    </div>
                  </Space>
                </div>
              )}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={t`Invoice Number Counter`}
                name="invoiceNumberCounter"
                rules={[
                  { required: true, message: t`This field is required!` },
                  { type: "number", min: 0, message: t`Counter must be 0 or greater` },
                ]}
                help={t`Next invoice will use this number + 1`}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t`Preview`}>
                <Text code style={{ fontSize: "16px" }}>
                  {invoiceNumberPreview || t`Enter format to see preview`}
                </Text>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Divider orientation="left">
                <Trans>Logo</Trans>
              </Divider>

              <Row>
                <Col span={24}>
                  {organization.logo && (
                    <img
                      src={organization.logo}
                      alt="logo"
                      style={{ maxWidth: 250, maxHeight: 250, marginBottom: 16 }}
                    />
                  )}
                  <br />
                  <Upload
                    accept="image/png,image/jpeg,image/jpg"
                    showUploadList={false}
                    customRequest={(data) => onLogoUpload(data)}
                  >
                    <Button>
                      <UploadOutlined /> {organization.logo ? t`Change` : t`Upload`}
                    </Button>
                  </Upload>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={submitting}
                loading={submitting}
                style={{ marginBottom: 40 }}
              >
                <Trans>Save</Trans>
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </>
  );
}

export default SettingsInvoice;
