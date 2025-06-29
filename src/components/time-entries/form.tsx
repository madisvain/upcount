import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Form, Input, Modal, Select, Button, Popconfirm, DatePicker, InputNumber, Switch, Row, Col } from "antd";
import { atom, useAtom, useSetAtom, useAtomValue } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { DeleteOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import dayjs from "dayjs";

import { 
  timeEntryIdAtom, 
  timeEntryAtom, 
  deleteTimeEntryAtom,
  clientsAtom,
  tagsAtom,
  setTagsAtom
} from "src/atoms";
import TagSelector from "src/components/tags/selector";

const submittingAtom = atom(false);

const TimeEntryForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [timeEntryId, setTimeEntryId] = useAtom(timeEntryIdAtom);
  const [timeEntry, setTimeEntry] = useAtom(timeEntryAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);
  const deleteTimeEntry = useSetAtom(deleteTimeEntryAtom);
  const clients = useAtomValue(clientsAtom);
  const tags = useAtomValue(tagsAtom);
  const setTags = useSetAtom(setTagsAtom);

  const isEditing = Boolean(timeEntryId);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    
    // Calculate duration if both start and end times are provided
    let duration = values.duration || 0;
    if (values.startTime && values.endTime) {
      duration = dayjs(values.endTime).diff(dayjs(values.startTime), 'seconds');
    }

    const submitData = {
      ...values,
      duration,
      startTime: values.startTime,
      endTime: values.endTime,
      tags: values.tags || [],
      isBillable: values.isBillable || false,
    };

    await setTimeEntry(submitData);
    navigate(location.pathname, { state: { timeEntryModal: false }, replace: true });
    form.resetFields();
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (timeEntryId) {
      setSubmitting(true);
      await deleteTimeEntry(timeEntryId);
      navigate(location.pathname, { state: { timeEntryModal: false }, replace: true });
      form.resetFields();
      setSubmitting(false);
    }
  };

  const calculateDuration = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    
    if (startTime && endTime) {
      const durationSeconds = dayjs(endTime).diff(dayjs(startTime), 'seconds');
      form.setFieldValue('duration', durationSeconds);
    }
  };

  useEffect(() => {
    if (get(location, "state.timeEntryId")) {
      setTimeEntryId(get(location, "state.timeEntryId"));
    } else {
      form.resetFields();
      setTimeEntryId(null);
    }
  }, [location, form, setTimeEntryId]);

  useEffect(() => {
    if (timeEntry) {
      const formValues = {
        ...timeEntry,
        startTime: timeEntry.startTime ? dayjs(timeEntry.startTime) : null,
        endTime: timeEntry.endTime ? dayjs(timeEntry.endTime) : null,
      };
      form.setFieldsValue(formValues);
    }
  }, [timeEntry, form]);

  useEffect(() => {
    setTags();
  }, [setTags]);

  return (
    <Modal
      title={isEditing ? <Trans>Edit Time Entry</Trans> : <Trans>New Time Entry</Trans>}
      open={get(location.state, "timeEntryModal", false)}
      okText={<Trans>Save</Trans>}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      onCancel={() => {
        form.resetFields();
        navigate(location.pathname, { state: { timeEntryModal: false }, replace: true });
      }}
      footer={[
        <div key="footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {isEditing && (
              <Popconfirm
                title={<Trans>Are you sure you want to delete this time entry?</Trans>}
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
                form.resetFields();
                navigate(location.pathname, { state: { timeEntryModal: false }, replace: true });
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
      {(!timeEntryId || !isEmpty(timeEntry)) && (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="description" 
            label={<Trans>Description</Trans>}
          >
            <Input.TextArea rows={3} placeholder={t`What are you working on?`} />
          </Form.Item>

          <Form.Item name="clientId" label={<Trans>Client</Trans>}>
            <Select placeholder={t`Select client (optional)`} allowClear>
              {clients.map((client: any) => (
                <Select.Option key={client.id} value={client.id}>
                  {client.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="startTime" 
                label={<Trans>Start Time</Trans>}
                rules={[{ required: true, message: t`Please select start time!` }]}
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  onChange={calculateDuration}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label={<Trans>End Time</Trans>}>
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  onChange={calculateDuration}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="duration" label={<Trans>Duration (seconds)</Trans>}>
            <InputNumber 
              style={{ width: '100%' }}
              min={0}
              placeholder={t`Duration in seconds`}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isBillable" label={<Trans>Billable</Trans>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hourlyRate" label={<Trans>Hourly Rate</Trans>}>
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder={t`Optional hourly rate`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label={<Trans>Tags</Trans>}>
            <TagSelector placeholder={t`Add or select tags`} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default TimeEntryForm;