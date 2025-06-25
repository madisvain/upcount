import { useState } from "react";
import {
  Button,
  Col,
  Space,
  Typography,
  Row,
  message,
  Card,
  Modal,
} from "antd";
import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { invoke } from "@tauri-apps/api/core";

const { Title, Paragraph } = Typography;

function SettingsBackup() {
  useLingui();
  const [messageApi, contextHolder] = message.useMessage();
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleBackup = async () => {
    setBacking(true);
    try {
      const backupPath = await invoke<string>("backup_database");
      messageApi.success(
        t`Database backup saved successfully to ${backupPath}`,
      );
    } catch (error) {
      console.error("Backup failed:", error);
      messageApi.error(t`Failed to backup database: ${error}`);
    } finally {
      setBacking(false);
    }
  };

  const handleRestore = async () => {
    Modal.confirm({
      title: t`Restore Database`,
      content: t`Are you sure you want to restore from a backup? This will replace all current data and cannot be undone.`,
      okText: t`Restore`,
      cancelText: t`Cancel`,
      okType: "danger",
      onOk: async () => {
        setRestoring(true);
        try {
          const result = await invoke<string>("restore_database");
          messageApi.success(result);
          // Recommend restarting the application
          Modal.info({
            title: t`Restore Complete`,
            content: t`Database has been restored successfully. Please restart the application to see the changes.`,
          });
        } catch (error) {
          console.error("Restore failed:", error);
          messageApi.error(t`Failed to restore database: ${error}`);
        } finally {
          setRestoring(false);
        }
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Row style={{ backgroundColor: "#fff" }}>
        <Col span={24}>
          <Title level={3} style={{ marginTop: 0 }}>
            <Space>
              <DatabaseOutlined />
              <Trans>Backup & restore</Trans>
            </Space>
          </Title>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1 } }}
            actions={[
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                loading={backing}
                onClick={handleBackup}
                style={{ margin: "0 16px" }}
              >
                <Trans>Create Backup</Trans>
              </Button>,
            ]}
          >
            <Paragraph>
              <Trans>
                Create a backup of your database to save all your invoices,
                clients, and settings. The backup file can be used to restore
                your data if needed.
              </Trans>
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            styles={{ body: { flex: 1 } }}
            actions={[
              <Button
                type="default"
                icon={<CloudUploadOutlined />}
                loading={restoring}
                onClick={handleRestore}
                style={{ margin: "0 16px" }}
              >
                <Trans>Restore from Backup</Trans>
              </Button>,
            ]}
          >
            <Paragraph>
              <Trans>
                Restore your database from a previously created backup file.
                This will replace all current data with the backup data.
              </Trans>
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SettingsBackup;
