import { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { Sentry } from "src/utils/sentry";

const { TextArea } = Input;

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Send feedback to Sentry
      Sentry.captureFeedback({
        name: values.name || undefined,
        email: values.email || undefined,
        message: values.message,
      });
      
      message.success(t`Feedback sent successfully!`);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Failed to send feedback:", error);
      message.error(t`Failed to send feedback. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={<Trans>Send Feedback</Trans>}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={<Trans>Send</Trans>}
      cancelText={<Trans>Cancel</Trans>}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label={<Trans>Name</Trans>}
        >
          <Input placeholder={t`Your name (optional)`} />
        </Form.Item>
        
        <Form.Item
          name="email"
          label={<Trans>Email</Trans>}
          rules={[
            {
              type: "email",
              message: t`Please enter a valid email address`,
            },
          ]}
        >
          <Input placeholder={t`your.email@example.com (optional)`} />
        </Form.Item>
        
        <Form.Item
          name="message"
          label={<Trans>Message</Trans>}
          rules={[
            {
              required: true,
              message: t`Please enter your feedback`,
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t`Tell us what you think, report a bug, or suggest an improvement...`}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackModal;