import { Button, Col, Form, Input, InputNumber, Select, Space, Typography, Row, Upload, Divider } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import map from "lodash/map";
import isEmpty from "lodash/isEmpty";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

import { organizationAtom, setOrganizationsAtom } from "src/atoms";
import { currencies, getCurrencySymbol } from "src/utils/currencies";

const submittingAtom = atom(false);

function SettingsInvoice() {
  const [form] = Form.useForm();
  const { i18n } = useLingui();

  const setOrganizations = useSetAtom(setOrganizationsAtom);
  const [organization, setOrganization] = useAtom(organizationAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);
  
  // Generate preview based on form values
  const invoiceFormat = Form.useWatch("invoiceNumberFormat", form);
  const generatePreview = (format: string | undefined) => {
    const template = format || organization?.invoiceNumberFormat || "INV-{year}-{number}";
    const counter = (organization?.invoiceNumberCounter || 0) + 1;
    const now = new Date();
    
    let preview = template;
    preview = preview.replace("{number}", String(counter).padStart(5, "0"));
    preview = preview.replace("{year}", now.getFullYear().toString());
    preview = preview.replace("{y}", String(now.getFullYear() % 100).padStart(2, "0"));
    preview = preview.replace("{month}", String(now.getMonth() + 1).padStart(2, "0"));
    preview = preview.replace("{m}", now.toLocaleString("en", { month: "short" }));
    preview = preview.replace("{day}", String(now.getDate()).padStart(2, "0"));
    
    return preview;
  };
  
  const invoiceNumberPreview = generatePreview(invoiceFormat);

  const onSubmit = async (values: object) => {
    setSubmitting(true);
    setOrganization(values);
    setOrganizations();
    setSubmitting(false);
  };
  // const onDelete = () => {};

  const onLogoUpload = (data: any) => {
    const reader = new FileReader();
    reader.onload = function () {
      const base64data = reader.result;
      setOrganization({ ...organization, logo: base64data });
    };
    reader.readAsDataURL(data.file);
  };

  return (
    !isEmpty(organization) && (
      <>
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
              <Form.Item label={t`Overdue charge`} name="overdue_charge">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label={t`Notes`} name="customerNotes">
                <TextArea rows={4} />
              </Form.Item>

              <Divider orientation="left">
                <Trans>Invoice Numbering</Trans>
              </Divider>

              <Form.Item
                label={t`Invoice Number Format`}
                name="invoiceNumberFormat"
                help={
                  <div style={{ marginTop: 8 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>
                        <Trans>Preview</Trans>:
                      </strong>{" "}
                      {invoiceNumberPreview}
                    </div>
                    <div>
                      <strong>
                        <Trans>Available variables</Trans>:
                      </strong>
                      <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                        <li>
                          {"{number}"} - <Trans>Sequential number</Trans>
                        </li>
                        <li>
                          {"{year}"} - <Trans>4-digit year</Trans> ({new Date().getFullYear()})
                        </li>
                        <li>
                          {"{y}"} - <Trans>2-digit year</Trans> ({String(new Date().getFullYear() % 100).padStart(2, "0")})
                        </li>
                        <li>
                          {"{month}"} - <Trans>2-digit month</Trans> ({String(new Date().getMonth() + 1).padStart(2, "0")})
                        </li>
                        <li>
                          {"{m}"} - <Trans>Month name</Trans> ({new Date().toLocaleString("en", { month: "short" })})
                        </li>
                        <li>
                          {"{day}"} - <Trans>Day of month</Trans> ({String(new Date().getDate()).padStart(2, "0")})
                        </li>
                      </ul>
                    </div>
                  </div>
                }
              >
                <Input placeholder="INV-{year}-{number}" />
              </Form.Item>

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
                  <Upload accept="image/*" showUploadList={false} customRequest={(data) => onLogoUpload(data)}>
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
      </>
    )
  );
}

export default SettingsInvoice;
