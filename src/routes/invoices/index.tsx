import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Input, Space, Table, Typography, Row } from "antd";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FileTextOutlined } from "@ant-design/icons";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import dayjs from "dayjs";

import { invoicesAtom, setInvoicesAtom, organizationAtom } from "src/atoms";
import { getFormattedNumber } from "src/utils/currencies";
import InvoiceStateSelect from "src/components/invoices/state-select";

const { Title } = Typography;

const searchAtom = atom("");

const stateFilter = [
  {
    text: t`Draft`,
    value: "draft",
  },
  {
    text: t`Confirmed`,
    value: "confirmed",
  },
  {
    text: t`Paid`,
    value: "paid",
  },
  {
    text: t`Void`,
    value: "void",
  },
];

const Invoices = () => {
  const { i18n } = useLingui();

  const organization = useAtomValue(organizationAtom);
  const invoices = useAtomValue(invoicesAtom);
  const setInvoices = useSetAtom(setInvoicesAtom);
  const [_search, setSearch] = useAtom(searchAtom);

  useEffect(() => {
    if (location.pathname === "/invoices") {
      setInvoices();
    }
  }, [location]);

  return (
    <>
      <Row>
        <Col span={12}>
          <Title level={3} style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            <Trans>Invoices</Trans>
          </Title>
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Space style={{ alignItems: "start" }}>
            <Input.Search placeholder={t`Search text`} onChange={(e) => setSearch(e.target.value)} />
            <Link to="/invoices/new">
              <Button type="primary" style={{ marginBottom: 10 }}>
                <Trans>New invoice</Trans>
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <Table dataSource={invoices} pagination={false} rowKey="id">
        <Table.Column
          title={<Trans>Number</Trans>}
          dataIndex="number"
          sorter={(a: string, b: string) => (a < b ? -1 : a === b ? 0 : 1)}
          render={(number, invoice: any) => <Link to={`/invoices/${invoice.id}`}>{number}</Link>}
        />
        <Table.Column
          title={<Trans>Client</Trans>}
          dataIndex="clientName"
          sorter={(a: string, b: string) => (a < b ? -1 : a === b ? 0 : 1)}
          render={(clientName) => (clientName ? clientName : "-")}
        />
        <Table.Column
          title={<Trans>Date</Trans>}
          dataIndex="date"
          key="date"
          sorter={(a: string, b: string) => dayjs(a).valueOf() - dayjs(b).valueOf()}
          render={(date) => (date ? dayjs(date).format("L") : "-")}
        />
        <Table.Column
          title={<Trans>Due date</Trans>}
          dataIndex="dueDate"
          key="dueDate"
          sorter={(a: string, b: string) => dayjs(a).valueOf() - dayjs(b).valueOf()}
          render={(date) => (date ? dayjs(date).format("L") : "-")}
        />
        <Table.Column
          title={<Trans>Total</Trans>}
          dataIndex="total"
          key="total"
          align="right"
          sorter={(a: number, b: number) => a - b}
          render={(total, invoice: any) => getFormattedNumber(total, invoice.currency, i18n.locale, organization)}
        />
        <Table.Column
          title={<Trans>State</Trans>}
          key="state"
          align="right"
          filters={stateFilter}
          onFilter={(value, record: any) => record.state.indexOf(value) === 0}
          render={(invoice) => <InvoiceStateSelect invoice={invoice} />}
        />
      </Table>
    </>
  );
};

export default Invoices;
