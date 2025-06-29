import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button, Row, Col, Space, Input, Table, Typography, Tag, Popconfirm, Dropdown, Form, Select } from "antd";
import type { GetRef, InputRef } from "antd";
import {
  PlayCircleOutlined,
  StopOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { atom } from "jotai";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import filter from "lodash/filter";
import get from "lodash/get";
import includes from "lodash/includes";
import some from "lodash/some";
import toString from "lodash/toString";

import {
  timeEntriesAtom,
  setTimeEntriesAtom,
  deleteTimeEntryAtom,
  runningTimerAtom,
  clientsAtom,
  setClientsAtom,
  timeEntryAtom,
  timeEntryIdAtom,
  updateTimeEntryDirectlyAtom,
} from "src/atoms";
import TimeEntryForm from "src/components/time-entries/form";
import TimeRangeCell from "src/components/time-entries/time-range-cell";

dayjs.extend(duration);

const { Title } = Typography;
const { Search } = Input;

type FormInstance<T> = GetRef<typeof Form<T>>;
const EditableContext = React.createContext<FormInstance<any> | null>(null);

const searchAtom = atom<string>("");

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
  inputType?: 'text' | 'select';
  options?: Array<{ value: any; label: string }>;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType = 'text',
  options = [],
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      // Auto-open dropdown for client field
      if (dataIndex === 'clientId') {
        setSelectOpen(true);
      }
    } else {
      setSelectOpen(false);
    }
  }, [editing, dataIndex]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async (e?: React.FocusEvent | React.KeyboardEvent) => {
    if (saving) return; // Prevent duplicate saves
    
    setSaving(true);
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    } finally {
      setSaving(false);
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent) => {
    e.preventDefault();
    save(e);
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
      >
        {dataIndex === 'clientId' ? (
          <Select
            ref={inputRef}
            open={selectOpen}
            onOpenChange={setSelectOpen}
            onBlur={save}
            onChange={save}
            options={options}
            allowClear
            placeholder="Select client"
          />
        ) : (
          <Input ref={inputRef} onPressEnter={handlePressEnter} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24, cursor: "pointer" }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const TimeTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useAtom(searchAtom);

  // Atoms
  const timeEntries = useAtomValue(timeEntriesAtom);
  const setTimeEntries = useSetAtom(setTimeEntriesAtom);
  const deleteTimeEntry = useSetAtom(deleteTimeEntryAtom);
  const [runningTimer, setRunningTimer] = useAtom(runningTimerAtom);
  const clients = useAtomValue(clientsAtom);
  const setClients = useSetAtom(setClientsAtom);
  const setTimeEntry = useSetAtom(timeEntryAtom);
  const [timeEntryId, setTimeEntryId] = useAtom(timeEntryIdAtom);
  const updateTimeEntryDirectly = useSetAtom(updateTimeEntryDirectlyAtom);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Load data on mount
  useEffect(() => {
    if (location.pathname === "/time-tracking") {
      setTimeEntries();
      setClients();
    }
  }, [location, setTimeEntries, setClients]);

  // Update current time every second for running timer
  useEffect(() => {
    if (runningTimer) {
      const interval = setInterval(() => {
        setCurrentTime(dayjs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [runningTimer]);

  // Search function
  const searchTimeEntries = () => {
    return filter(timeEntries, (entry: any) => {
      return some(["description", "clientName"], (field) => {
        const value = get(entry, field);
        return includes(toString(value).toLowerCase(), search.toLowerCase());
      });
    });
  };


  // Timer functionality
  const startTimer = async () => {
    const startTime = dayjs().valueOf();
    const newEntry = {
      description: "",
      startTime,
      endTime: null,
      duration: 0,
      clientId: null,
      tags: [],
      isBillable: true,
      hourlyRate: null,
    };

    try {
      // Create the time entry
      setTimeEntryId(null); // Reset to create new
      const createdEntry = await setTimeEntry(newEntry);

      // Set the running timer with the created entry ID
      setRunningTimer(createdEntry?.id || null);

      // Refresh the list to show the new entry
      setTimeEntries();
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const stopTimer = async () => {
    if (runningTimer) {
      try {
        // Find the running timer entry by ID
        const runningEntry = timeEntries.find((entry) => entry.id === runningTimer);

        if (runningEntry) {
          const endTime = dayjs().valueOf();
          const duration = Math.floor((endTime - runningEntry.startTime) / 1000);

          // Update the entry with end time and duration
          setTimeEntryId(runningEntry.id);
          await setTimeEntry({
            ...runningEntry,
            endTime,
            duration,
          });

          // Refresh the list
          setTimeEntries();
        }

        setRunningTimer(null);
      } catch (error) {
        console.error("Failed to stop timer:", error);
      }
    }
  };


  // Format duration
  const formatDuration = (seconds: number) => {
    const d = dayjs.duration(seconds, "seconds");
    const hours = Math.floor(d.asHours());
    const minutes = d.minutes();
    const secs = d.seconds();
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle inline field update
  const handleSave = async (row: any) => {
    // Extract the changed fields (exclude unchanged ones)
    const original = timeEntries.find(e => e.id === row.id);
    const updates: any = {};
    
    if (row.description !== original?.description) {
      updates.description = row.description;
    }
    
    if (row.clientId !== original?.clientId) {
      updates.clientId = row.clientId;
      // Also update the clientName for display
      const client = clients.find(c => c.id === row.clientId);
      updates.clientName = client?.name || null;
    }

    // Handle time range updates
    if (row.startTime !== original?.startTime) {
      updates.startTime = row.startTime;
    }
    
    if (row.endTime !== original?.endTime) {
      updates.endTime = row.endTime;
    }
    
    if (row.duration !== original?.duration) {
      updates.duration = row.duration;
    }
    
    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      await updateTimeEntryDirectly({ id: row.id, updates });
    }
  };

  // Table columns
  const defaultColumns = [
    {
      title: <Trans>Description</Trans>,
      dataIndex: "description",
      key: "description",
      editable: true,
      render: (text: string) => text || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Add description...</span>,
    },
    {
      title: <Trans>Client</Trans>,
      dataIndex: "clientId",
      key: "clientId",
      editable: true,
      inputType: 'select',
      render: (clientId: string, record: any) => record.clientName || "-",
      filters: clients.map((client: any) => ({
        text: client.name,
        value: client.id,
      })),
      onFilter: (value: any, record: any) => record.clientId === value,
    },
    {
      title: <Trans>Time Range</Trans>,
      dataIndex: "timeRange",
      key: "timeRange",
      render: (_: any, record: any) => (
        <TimeRangeCell record={record} handleSave={handleSave} />
      ),
      sorter: (a: any, b: any) => a.startTime - b.startTime,
      defaultSortOrder: 'descend',
      showSorterTooltip: false,
    },
    {
      title: <Trans>Duration</Trans>,
      dataIndex: "duration",
      key: "duration",
      render: (seconds: number, record: any) => {
        // For running timers, calculate current duration dynamically
        if (runningTimer && record.id === runningTimer && !record.endTime) {
          const currentDuration = Math.max(0, Math.floor((currentTime.valueOf() - record.startTime) / 1000));
          return formatDuration(currentDuration);
        }
        return formatDuration(seconds);
      },
    },
    {
      title: <Trans>Tags</Trans>,
      dataIndex: "tags",
      key: "tags",
      render: (tags: string) => {
        if (!tags) return null;
        try {
          const tagArray = JSON.parse(tags);
          return tagArray.map((tagName: string, index: number) => (
            <Tag key={index} style={{ marginBottom: 4 }}>
              {tagName}
            </Tag>
          ));
        } catch {
          return null;
        }
      },
    },
    {
      title: <Trans>Billable</Trans>,
      dataIndex: "isBillable",
      key: "isBillable",
      render: (isBillable: number) => (
        <Tag color={isBillable ? "green" : "orange"}>
          {isBillable ? <Trans>Billable</Trans> : <Trans>Non-billable</Trans>}
        </Tag>
      ),
      filters: [
        { text: <Trans>Billable</Trans>, value: 1 },
        { text: <Trans>Non-billable</Trans>, value: 0 },
      ],
      onFilter: (value: any, record: any) => record.isBillable === value,
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: <Trans>Edit</Trans>,
                icon: <EditOutlined />,
                onClick: () => {
                  navigate(location.pathname, { 
                    state: { 
                      ...location.state,
                      timeEntryModal: true, 
                      timeEntryId: record.id 
                    }, 
                    replace: true 
                  });
                },
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title={<Trans>Delete the time entry?</Trans>}
                    description={<Trans>Are you sure to delete this time entry?</Trans>}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      deleteTimeEntry(record.id);
                    }}
                    okText={<Trans>Yes</Trans>}
                    cancelText={<Trans>No</Trans>}
                  >
                    <span onClick={(e) => e.stopPropagation()}>
                      <Trans>Delete</Trans>
                    </span>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: (e) => e.domEvent.stopPropagation(),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    
    // Prepare options for select fields
    let options: Array<{ value: any; label: string }> = [];
    if (col.inputType === 'select' && col.dataIndex === 'clientId') {
      options = clients.map((client: any) => ({
        value: client.id,
        label: client.name,
      }));
    }
    
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        inputType: col.inputType,
        options,
      }),
    };
  });

  return (
    <>
      <Row>
        <Col span={12}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            <Trans>Time Tracking</Trans>
          </Title>
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Space style={{ alignItems: "start" }}>
            <Search
              placeholder={t`Search time entries...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            {runningTimer ? (
              <Button type="primary" danger icon={<StopOutlined />} onClick={stopTimer}>
                <Trans>Stop Timer</Trans>
              </Button>
            ) : (
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={startTimer}>
                <Trans>Start Timer</Trans>
              </Button>
            )}
            <Link to="/time-tracking" state={{ timeEntryModal: true }}>
              <Button type="primary" style={{ marginBottom: 10 }}>
                <Trans>New Entry</Trans>
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            components={components}
            columns={columns}
            dataSource={search ? searchTimeEntries() : timeEntries}
            rowKey="id"
            pagination={false}
          />
        </Col>
      </Row>

      <TimeEntryForm />
    </>
  );
};

export default TimeTracking;
