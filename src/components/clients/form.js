import { Button, Form, Input, Select } from 'antd';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';

const ClientForm = props => {
  const { handleSubmit, submitting } = props;
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="name" rules={[{ required: true, message: t`Please input name!` }]}>
        <Input placeholder={t`Name`} />
      </Form.Item>
      <Form.Item name="address">
        <Input.TextArea rows={4} placeholder={t`Address`} />
      </Form.Item>
      {/* TODO: E-mail validation */}
      <Form.Item name="emails">
        <Select placeholder={t`E-mails`} mode="tags" tokenSeparators={[',', ';']} />
      </Form.Item>
      <Form.Item name="phone">
        <Input placeholder={t`Phone`} />
      </Form.Item>
      <Form.Item name="vatin">
        <Input placeholder={t`VATIN`} />
      </Form.Item>
      <Form.Item name="website">
        <Input placeholder={t`Website`} />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        disabled={submitting}
        loading={submitting}
        style={{ marginTop: '10px' }}
      >
        <Trans>Save client</Trans>
      </Button>
    </Form>
  );
};

export default withI18n()(ClientForm);
