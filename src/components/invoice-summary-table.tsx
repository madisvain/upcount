import { Table, Typography } from "antd";
import { Trans } from "@lingui/react/macro";

const { Text } = Typography;

interface LineItem {
  description: string;
  hours: string;
  rate: number;
  amount: number;
}

interface InvoiceSummaryProps {
  client: string;
  hourlyRate: number;
  currency: string;
  period?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  invoiceDate?: string;
  dueDate?: string;
}

export default function InvoiceSummaryTable({
  client,
  hourlyRate,
  currency,
  period,
  lineItems,
  subtotal,
  tax,
  total,
  invoiceDate = "Today",
  dueDate = "30 days from invoice date",
}: InvoiceSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns = [
    {
      title: <Trans>Description</Trans>,
      dataIndex: "description",
      key: "description",
    },
    {
      title: <Trans>Hours</Trans>,
      dataIndex: "hours",
      key: "hours",
      align: "right" as const,
    },
    {
      title: <Trans>Rate</Trans>,
      dataIndex: "rate",
      key: "rate",
      align: "right" as const,
      render: (rate: number) => formatCurrency(rate),
    },
    {
      title: <Trans>Amount</Trans>,
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (amount: number) => formatCurrency(amount),
    },
  ];

  const summaryData = [
    { key: "subtotal", label: <Trans>Subtotal</Trans>, value: formatCurrency(subtotal) },
    { key: "tax", label: <Trans>Tax</Trans>, value: formatCurrency(tax) },
    { key: "total", label: <Trans>Total Amount</Trans>, value: <Text strong>{formatCurrency(total)}</Text> },
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong><Trans>Client:</Trans></Text> {client}
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text strong><Trans>Hourly Rate:</Trans></Text> {formatCurrency(hourlyRate)}/hour
        </div>
        {period && (
          <div style={{ marginBottom: 8 }}>
            <Text strong><Trans>Period:</Trans></Text> {period}
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={lineItems.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />

      <div style={{ textAlign: "right", maxWidth: 400, marginLeft: "auto" }}>
        {summaryData.map((item) => (
          <div key={item.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        <div><Trans>Invoice Date:</Trans> {invoiceDate}</div>
        <div><Trans>Due Date:</Trans> {dueDate}</div>
      </div>
    </div>
  );
}