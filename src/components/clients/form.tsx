import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Modal, Select } from "antd";
import { atom, useAtom } from "jotai";
import { t, Trans } from "@lingui/macro";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";

import { clientIdAtom, clientAtom } from "src/atoms";

const submittingAtom = atom(false);

const ClientForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [clientId, setClientId] = useAtom(clientIdAtom);
  const [client, setClient] = useAtom(clientAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setClient(values);
    setClientId(null);
    navigate(location.pathname, { state: { clientModal: false } });
    form.resetFields();
    setSubmitting(false);
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
