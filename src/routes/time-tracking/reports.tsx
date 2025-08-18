import { useState, useMemo } from "react";
import { Card, Col, Row, Typography, Select, DatePicker, Table, Statistic, Button, Space } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useAtomValue } from "jotai";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import groupBy from "lodash/groupBy";
import sumBy from "lodash/sumBy";
import sortBy from "lodash/sortBy";
import filter from "lodash/filter";

import { timeEntriesAtom } from "src/atoms/time-tracking";
import { clientsAtom } from "src/atoms/client";
import { useDateFormatter, useDatePickerFormat } from "src/utils/date";

dayjs.extend(duration);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function TimeTrackingReports() {
  const timeEntries = useAtomValue(timeEntriesAtom);
  const clients = useAtomValue(clientsAtom);
  const formatDate = useDateFormatter();
  const dateFormat = useDatePickerFormat();

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [groupByOption, setGroupByOption] = useState<"client" | "date" | "week">("client");

  // Filter entries by date range and client, excluding active tracking entries
  const filteredEntries = useMemo(() => {
    return filter(timeEntries, (entry) => {
      // Exclude entries that are still active (no end time)
      if (!entry.endTime) {
        return false;
      }
      
      const entryDate = dayjs(entry.startTime);
      const inDateRange = entryDate.isAfter(dateRange[0]) && entryDate.isBefore(dateRange[1]);
      const matchesClient = selectedClient === "all" || entry.clientId === selectedClient;
      return inDateRange && matchesClient;
    });
  }, [timeEntries, dateRange, selectedClient]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return sumBy(filteredEntries, "duration");
  }, [filteredEntries]);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const dur = dayjs.duration(seconds, "seconds");
    const hours = Math.floor(dur.asHours());
    const minutes = dur.minutes();
    return `${hours}h ${minutes}m`;
  };

  // Group and prepare data for table
  const tableData = useMemo(() => {
    let grouped: Record<string, any[]> = {};

    if (groupByOption === "client") {
      grouped = groupBy(filteredEntries, "clientId");
    } else if (groupByOption === "date") {
      grouped = groupBy(filteredEntries, (entry) => dayjs(entry.startTime).format("YYYY-MM-DD"));
    } else if (groupByOption === "week") {
      grouped = groupBy(filteredEntries, (entry) => {
        const date = dayjs(entry.startTime);
        return `${date.year()}-W${date.isoWeek()}`;
      });
    }

    return sortBy(
      Object.entries(grouped).map(([key, entries]) => {
        const totalSeconds = sumBy(entries, "duration");
        let displayName = key;

        if (groupByOption === "client") {
          const client = clients.find((c) => c.id === key);
          displayName = client?.name || t`No client`;
        } else if (groupByOption === "week") {
          const [year, week] = key.split("-W");
          const startOfWeek = dayjs().year(parseInt(year)).isoWeek(parseInt(week)).startOf("isoWeek");
          displayName = t`Week ${week} (${startOfWeek.format("MMM D")})`;
        }

        return {
          key,
          name: displayName,
          entries: entries.length,
          duration: totalSeconds,
          formattedDuration: formatDuration(totalSeconds),
        };
      }),
      groupByOption === "date" ? [(item) => -dayjs(item.key).valueOf()] : [(item) => -item.duration]
    );
  }, [filteredEntries, groupByOption, clients]);

  const columns = [
    {
      title: groupByOption === "client" ? t`Client` : groupByOption === "date" ? t`Date` : t`Week`,
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => {
        if (groupByOption === "date") {
          return formatDate(record.key, true);
        }
        return text;
      },
    },
    {
      title: t`Entries`,
      dataIndex: "entries",
      key: "entries",
      width: 100,
      align: "center" as const,
    },
    {
      title: t`Total time`,
      dataIndex: "formattedDuration",
      key: "duration",
      width: 150,
      align: "right" as const,
    },
    {
      title: t`%`,
      key: "percentage",
      width: 80,
      align: "right" as const,
      render: (_: any, record: any) => {
        const percentage = totalDuration > 0 ? (record.duration / totalDuration) * 100 : 0;
        return `${percentage.toFixed(1)}%`;
      },
    },
  ];

  return (
    <>
      <Row>
        <Col span={12}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            <Trans>Reports</Trans>
          </Title>
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Space style={{ alignItems: "start" }}>
            <Button type="default" style={{ marginBottom: 10 }} disabled>
              <Trans>Export</Trans>
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
            style={{ width: "100%" }}
            format={dateFormat}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            value={selectedClient}
            onChange={setSelectedClient}
            style={{ width: "100%" }}
            placeholder={t`Select client`}
          >
            <Select.Option value="all">
              <Trans>All clients</Trans>
            </Select.Option>
            {clients.map((client) => (
              <Select.Option key={client.id} value={client.id}>
                {client.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select value={groupByOption} onChange={setGroupByOption} style={{ width: "100%" }}>
            <Select.Option value="client">
              <Trans>Group by client</Trans>
            </Select.Option>
            <Select.Option value="date">
              <Trans>Group by date</Trans>
            </Select.Option>
            <Select.Option value="week">
              <Trans>Group by week</Trans>
            </Select.Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title={<Trans>Total time</Trans>} value={formatDuration(totalDuration)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title={<Trans>Total entries</Trans>} value={filteredEntries.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={<Trans>Average per entry</Trans>}
              value={filteredEntries.length > 0 ? formatDuration(totalDuration / filteredEntries.length) : "0h 0m"}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={<Trans>Daily average</Trans>}
              value={(() => {
                const days = dateRange[1].diff(dateRange[0], "day") + 1;
                return formatDuration(totalDuration / days);
              })()}
            />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            summary={(data) => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>
                      <Trans>Total</Trans>
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <strong>{sumBy(data, "entries")}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>{formatDuration(sumBy(data, "duration"))}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>100%</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Col>
      </Row>
    </>
  );
}
