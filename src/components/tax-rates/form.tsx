import { useParams, useNavigate } from "react-router-dom";
import { Checkbox, Form, Input, Modal } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { t, Trans } from "@lingui/macro";
import isEmpty from "lodash/isEmpty";

import { taxRateIdAtom, taxRateAtom } from "src/atoms";

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
    setTaxRateId(null);
    navigate("/settings/tax-rates");
    setSubmitting(false);
  };

  if (id) {
    setTaxRateId(id);
  }

  return (
    <Modal
      title={id ? <Trans>Edit tax rate</Trans> : <Trans>New tax rate</Trans>}
      open={true}
      okText={<Trans>Save tax rate</Trans>}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      onCancel={() => {
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
