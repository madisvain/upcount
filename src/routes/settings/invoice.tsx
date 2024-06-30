import { Button, Col, Form, Input, InputNumber, Select, Space, Typography, Row, Upload } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { FileTextOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { t, Trans } from "@lingui/macro";
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
  const setOrganizations = useSetAtom(setOrganizationsAtom);
  const [organization, setOrganization] = useAtom(organizationAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);

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
                    const locale = "en-US";
                    const symbol = getCurrencySymbol(locale, currency);
                    return (
                      <Option value={currency} key={currency}>
                        {`${currency} ${currency !== symbol ? symbol : ""}`}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label="Decimal places" name="minimum_fraction_digits">
                <InputNumber min={0} max={10} />
              </Form.Item>
              <Form.Item label="Due days" name="due_days">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label="Overdue charge" name="overdue_charge">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label="Notes" name="customerNotes">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={submitting}
                loading={submitting}
                style={{ marginBottom: 40 }}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col span={24}>
            <Row>
              <Col span={12}>
                <Title level={3}>
                  <Space>
                    <PictureOutlined />
                    Logo
                  </Space>
                </Title>
                {organization.logo && (
                  <img src={organization.logo} alt="logo" style={{ maxWidth: 250, maxHeight: 250 }} />
                )}
                <br />
                <Upload accept="image/*" showUploadList={false} customRequest={(data) => onLogoUpload(data)}>
                  <Button style={{ marginTop: 20 }}>
                    <UploadOutlined /> {organization.logo ? "Change" : "Upload"}
                  </Button>
                </Upload>
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    )
  );
}

export default SettingsInvoice;
