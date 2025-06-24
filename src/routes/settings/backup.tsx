import { useState } from "react";
import { Button, Col, Space, Typography, Row, message, Card } from "antd";
import { CloudDownloadOutlined, DatabaseOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { invoke } from "@tauri-apps/api/core";

const { Title, Paragraph } = Typography;

function SettingsBackup() {
  useLingui();
  const [messageApi, contextHolder] = message.useMessage();
  const [backing, setBacking] = useState(false);

  const handleBackup = async () => {
    setBacking(true);
    try {
      const backupPath = await invoke<string>("backup_database");
      messageApi.success(t`Database backup saved successfully to ${backupPath}`);
    } catch (error) {
      console.error("Backup failed:", error);
      messageApi.error(t`Failed to backup database: ${error}`);
    } finally {
      setBacking(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Row style={{ backgroundColor: "#fff" }}>
        <Col span={24}>
          <Title level={3} style={{ marginTop: 0 }}>
            <Space>
              <DatabaseOutlined />
              <Trans>Database Backup</Trans>
            </Space>
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Paragraph>
                <Trans>
                  Create a backup of your database to save all your invoices, clients, and settings. 
                  The backup file can be used to restore your data if needed.
                </Trans>
              </Paragraph>
              
              <Paragraph type="secondary">
                <Trans>
                  The backup will include all organizations, clients, invoices, tax rates, and settings.
                </Trans>
              </Paragraph>

              <Button
                type="primary"
                size="large"
                icon={<CloudDownloadOutlined />}
                loading={backing}
                onClick={handleBackup}
              >
                <Trans>Create Backup</Trans>
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SettingsBackup;