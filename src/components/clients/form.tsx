import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Modal, Select, Button, Popconfirm } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { t, Trans } from "@lingui/macro";
import { DeleteOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";

import { clientIdAtom, clientAtom, deleteClientAtom } from "src/atoms";

const submittingAtom = atom(false);

const ClientForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [clientId, setClientId] = useAtom(clientIdAtom);
  const [client, setClient] = useAtom(clientAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);
  const deleteClient = useSetAtom(deleteClientAtom);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setClient(values);
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
    form.resetFields();
    if (get(location, "state.clientId")) {
      setClientId(get(location, "state.clientId"));
    }
  }, [location]);

  useEffect(() => {
    form.setFieldsValue(client);
  }, [client]);

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
                title={<Trans>Are you sure you want to delete this client?</Trans>}
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
            <Input placeholder={t`Name`} />
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
