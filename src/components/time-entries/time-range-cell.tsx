import React, { useState } from "react";
import { Button, Row, Col, Form, Popover, TimePicker, DatePicker } from "antd";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";

interface TimeRangeCellProps {
  record: any;
  handleSave: (record: any) => void;
}

const TimeRangeCell: React.FC<TimeRangeCellProps> = ({ record, handleSave }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const formatTimeRange = (startTime: number, endTime?: number) => {
    const start = dayjs(startTime);
    if (!endTime) {
      return `${start.format("HH:mm")} - `;
    }
    const end = dayjs(endTime);
    return `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
  };

  const handleSubmit = async (values: any) => {
    const selectedDate = values.date || dayjs(record.startTime);
    const startTime = values.startTime || dayjs(record.startTime);
    const endTime = values.endTime || (record.endTime ? dayjs(record.endTime) : null);

    // Combine selected date with times
    const newStartTime = selectedDate.hour(startTime.hour()).minute(startTime.minute()).second(0).millisecond(0);

    const newEndTime = endTime
      ? selectedDate.hour(endTime.hour()).minute(endTime.minute()).second(0).millisecond(0)
      : null;

    const updates: any = {
      startTime: newStartTime.valueOf(),
    };

    if (newEndTime) {
      updates.endTime = newEndTime.valueOf();
      updates.duration = Math.floor((newEndTime.valueOf() - newStartTime.valueOf()) / 1000);
    }

    await handleSave({ ...record, ...updates });
    setOpen(false);
  };

  const popoverContent = (
    <div style={{ width: 280 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(record.startTime),
          startTime: dayjs(record.startTime),
          endTime: record.endTime ? dayjs(record.endTime) : null,
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="startTime" label={<Trans>Start Time</Trans>}>
              <TimePicker format="HH:mm" style={{ width: "100%" }} open={false} inputReadOnly={false} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endTime" label={<Trans>End Time</Trans>}>
              <TimePicker format="HH:mm" style={{ width: "100%" }} open={false} inputReadOnly={false} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item name="date" label={<Trans>Date</Trans>}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button onClick={() => setOpen(false)} style={{ marginRight: 8 }}>
            <Trans>Cancel</Trans>
          </Button>
          <Button type="primary" htmlType="submit">
            <Trans>Save</Trans>
          </Button>
        </div>
      </Form>
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="click" open={open} onOpenChange={setOpen} placement="bottomLeft">
      <span style={{ cursor: "pointer", color: "#1890ff" }}>{formatTimeRange(record.startTime, record.endTime)}</span>
    </Popover>
  );
};

export default TimeRangeCell;
