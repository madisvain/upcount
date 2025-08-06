import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Checkbox, Form, Input, Modal } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import isEmpty from "lodash/isEmpty";

import { taxRateIdAtom, taxRateAtom } from "src/atoms/tax-rate";

const submittingAtom = atom(false);

const TaxRateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<string>();

  const [form] = Form.useForm();

  const setTaxRateId = useSetAtom(taxRateIdAtom);
  const [taxRate, setTaxRate] = useAtom(taxRateAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setTaxRate(values);
    form.resetFields();
    setTaxRateId(null);
    navigate("/settings/tax-rates");
    setSubmitting(false);
  };

  useEffect(() => {
    if (id) {
      setTaxRateId(id);
    } else {
      // Clear form when opening for new tax rate
      form.resetFields();
    }
  }, [id, form, setTaxRateId]);

  return (
    <Modal
      title={id ? <Trans>Edit tax rate</Trans> : <Trans>New tax rate</Trans>}
      open={true}
      okText={<Trans>Save</Trans>}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      onCancel={() => {
        form.resetFields();
        setTaxRateId(null);
        navigate("/settings/tax-rates");
      }}
      forceRender={true}
    >
      {(!id || !isEmpty(taxRate)) && (
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={taxRate}>
          <Form.Item name="name" rules={[{ required: true, message: t`Please input name!` }]}>
            <Input placeholder={t`Name`} />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea rows={4} placeholder={t`Description`} />
          </Form.Item>
          <Form.Item name="percentage" rules={[{ required: true, message: t`Please input a percentage!` }]}>
            <Input placeholder={t`Percentage`} />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>
              <Trans>Default</Trans>
            </Checkbox>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default TaxRateForm;
