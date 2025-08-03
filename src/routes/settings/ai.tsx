import { Button, Col, Form, Input, Space, Typography, Row, Alert, message } from "antd";
import { useAtom } from "jotai";
import { RobotOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { anthropicApiKeyAtom } from "src/atoms/ai";

const { Title } = Typography;

function SettingsAI() {
  useLingui();
  const [form] = Form.useForm();

  const [apiKey, setApiKey] = useAtom(anthropicApiKeyAtom);

  const onSubmit = async (values: { anthropic_api_key: string }) => {
    setApiKey(values.anthropic_api_key);
    message.success(t`API key saved successfully`);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ anthropic_api_key: apiKey }}>
      <Row style={{ backgroundColor: "#fff" }}>
        <Col span={24}>
          <Title level={3} style={{ marginTop: 0 }}>
            <Space>
              <RobotOutlined />
              <Trans>AI Configuration</Trans>
            </Space>
          </Title>
        </Col>
      </Row>
      <Row>
        <Col xs={24} xl={12}>
          {apiKey ? (
            <Alert
              description={t`Your Anthropic API key is configured and AI features are enabled.`}
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          ) : (
            <Alert
              description={t`Configure your Anthropic API key to enable AI-powered features in your invoicing workflow.`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <div style={{ position: "relative" }}>
            <Form.Item label={t`Anthropic API Key`} name="anthropic_api_key">
              <Input.Password placeholder="sk-ant-api03-..." autoComplete="off" />
            </Form.Item>
            <span style={{ position: "absolute", top: "0", right: "0", fontSize: "14px", color: "#666" }}>
              <Trans>Get your API key from</Trans>{" "}
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  await openUrl("https://console.anthropic.com/settings/keys");
                }}
                style={{ textDecoration: "underline" }}
              >
                console.anthropic.com
              </a>
            </span>
          </div>

          <Row>
            <Col span={24}>
              <Button type="primary" htmlType="submit">
                <Trans>Save Configuration</Trans>
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
}

export default SettingsAI;
