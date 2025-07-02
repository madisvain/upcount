import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Form, Input, Modal, Select, Button, Popconfirm } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { DeleteOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import { invoke } from "@tauri-apps/api/core";

import { clientIdAtom, clientAtom, deleteClientAtom } from "src/atoms";
import { generateClientCode } from "src/utils/client";

const submittingAtom = atom(false);

const ClientForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [clientId, setClientId] = useAtom(clientIdAtom);
  const [client, setClient] = useAtom(clientAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);
  const deleteClient = useSetAtom(deleteClientAtom);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    await setClient(values);
    setClientId(null);
    navigate(location.pathname, { state: { clientModal: false } });
    form.resetFields();
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (clientId) {
      setSubmitting(true);
      await deleteClient(clientId);
      setClientId(null);
      navigate(location.pathname, { state: { clientModal: false } });
      form.resetFields();
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (get(location, "state.clientId")) {
      setClientId(get(location, "state.clientId"));
    } else {
      form.resetFields();
      setClientId(null);
    }
  }, [location, form, setClientId]);

  useEffect(() => {
    if (client) {
      form.setFieldsValue(client);
    }
  }, [client, form]);

  useEffect(() => {
    if (clientId) {
      // Fetch invoice count when clientId changes
      const fetchInvoiceCount = async () => {
        try {
          const count = await invoke<number>("get_client_invoice_count", { clientId });
          setInvoiceCount(count);
        } catch (error) {
          console.error("Failed to fetch invoice count:", error);
          setInvoiceCount(0);
        }
      };
      fetchInvoiceCount();
    } else {
      setInvoiceCount(null);
    }
  }, [clientId]);

  return (
    <Modal
      title={clientId ? <Trans>Edit client</Trans> : <Trans>New client</Trans>}
      open={get(location.state, "clientModal", false)}
      okText={<Trans>Save</Trans>}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      onCancel={() => {
        setClientId(null);
        form.resetFields();
        navigate(location.pathname, { state: { clientModal: false } });
      }}
      footer={[
        <div key="footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {clientId && (
              <Popconfirm
                title={
                  <div>
                    <div><Trans>Are you sure you want to delete this client?</Trans></div>
                    {invoiceCount !== null && invoiceCount > 0 && (
                      <div style={{ color: '#ff4d4f', marginTop: 4 }}>
                        <Trans>Warning: This will also delete {invoiceCount} related invoice(s).</Trans>
                      </div>
                    )}
                  </div>
                }
                onConfirm={handleDelete}
                okText={<Trans>Yes</Trans>}
                cancelText={<Trans>No</Trans>}
                placement="topRight"
              >
                <Button danger icon={<DeleteOutlined />} loading={submitting}>
                  <Trans>Delete</Trans>
                </Button>
              </Popconfirm>
            )}
          </div>
          <div>
            <Button
              onClick={() => {
                setClientId(null);
                form.resetFields();
                navigate(location.pathname, { state: { clientModal: false } });
              }}
              style={{ marginRight: 8 }}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => form.submit()}
            >
              <Trans>Save</Trans>
            </Button>
          </div>
        </div>
      ]}
      forceRender={true}
    >
      {(!clientId || !isEmpty(client)) && (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" rules={[{ required: true, message: t`Please input name!` }]}>
            <Input 
              placeholder={t`Name`} 
              onChange={(e) => {
                // Only auto-generate code for new clients (no clientId)
                if (!clientId) {
                  const code = generateClientCode(e.target.value);
                  form.setFieldValue('code', code);
                }
              }}
            />
          </Form.Item>
          <Form.Item name="code" rules={[{ required: false }]}>
            <Input placeholder={t`Code`} maxLength={10} />
          </Form.Item>
          <Form.Item name="address">
            <Input.TextArea rows={4} placeholder={t`Address`} />
          </Form.Item>
          {/* TODO: E-mail validation */}
          <Form.Item name="emails">
            <Select placeholder={t`E-mails`} mode="tags" tokenSeparators={[",", ";"]} />
          </Form.Item>
          <Form.Item name="phone">
            <Input placeholder={t`Phone`} />
          </Form.Item>
          <Form.Item name="vatin">
            <Input placeholder={t`VAT Number`} />
          </Form.Item>
          <Form.Item name="website">
            <Input placeholder={t`Website`} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ClientForm;
