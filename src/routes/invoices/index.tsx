import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Col, Input, Space, Table, Typography, Row, Dropdown, MenuProps, Popconfirm } from "antd";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FileTextOutlined, MoreOutlined, CopyOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import dayjs from "dayjs";
import filter from "lodash/filter";
import get from "lodash/get";
import includes from "lodash/includes";
import some from "lodash/some";
import toString from "lodash/toString";

import { invoicesAtom, setInvoicesAtom, duplicateInvoiceAtom, deleteInvoiceAtom } from "src/atoms/invoice";
import { organizationAtom } from "src/atoms/organization";
import { getFormattedNumber } from "src/utils/currencies";
import InvoiceStateSelect from "src/components/invoices/state-select";

const { Title } = Typography;

const searchAtom = atom<string>("");

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
  const navigate = useNavigate();

  const organization = useAtomValue(organizationAtom);
  const invoices = useAtomValue(invoicesAtom);
  const setInvoices = useSetAtom(setInvoicesAtom);
  const duplicateInvoice = useSetAtom(duplicateInvoiceAtom);
  const deleteInvoice = useSetAtom(deleteInvoiceAtom);
  const [search, setSearch] = useAtom(searchAtom);

  useEffect(() => {
    if (location.pathname === "/invoices") {
      setInvoices();
    }
  }, [setInvoices]);

  const searchInvoices = () => {
    return filter(invoices, (invoice: any) => {
      return some(["clientName", "number", "customerNotes", "total"], (field) => {
        const value = get(invoice, field);
        return includes(toString(value).toLowerCase(), search.toLowerCase());
      });
    });
  };

  const handleDuplicateInvoice = async (invoiceId: string) => {
    const newInvoiceId = await duplicateInvoice(invoiceId);
    if (newInvoiceId) {
      navigate(`/invoices/${newInvoiceId}`);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
  };

  const getActionItems = (invoice: any): MenuProps["items"] => [
    {
      key: "edit",
      label: <Trans>Edit</Trans>,
      icon: <EditOutlined />,
      onClick: () => navigate(`/invoices/${invoice.id}`),
    },
    {
      key: "duplicate",
      label: <Trans>Duplicate</Trans>,
      icon: <CopyOutlined />,
      onClick: () => handleDuplicateInvoice(invoice.id),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title={t`Delete the invoice?`}
          description={t`Are you sure to delete this invoice?`}
          onConfirm={(e?: React.MouseEvent<HTMLElement>) => {
            e?.stopPropagation();
            handleDeleteInvoice(invoice.id);
          }}
          okText={t`Yes`}
          cancelText={t`No`}
        >
          <span>
            <DeleteOutlined /> <Trans>Delete</Trans>
          </span>
        </Popconfirm>
      ),
      onClick: (e) => e.domEvent.stopPropagation(),
    },
  ];

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

      <Table dataSource={search ? searchInvoices() : invoices} pagination={false} rowKey="id">
        <Table.Column
          title="#"
          dataIndex="number"
          sorter={(a: any, b: any) => (a.number < b.nuber ? -1 : a.number === b.number ? 0 : 1)}
          render={(number, invoice: any) => <Link to={`/invoices/${invoice.id}`}>{number}</Link>}
        />
        <Table.Column
          title={<Trans>Client</Trans>}
          dataIndex="clientName"
          sorter={(a: any, b: any) => (a.clientName < b.clientName ? -1 : a.clientName === b.clientName ? 0 : 1)}
          render={(clientName) => (clientName ? clientName : "-")}
        />
        <Table.Column
          title={<Trans>Date</Trans>}
          dataIndex="date"
          key="date"
          sorter={(a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()}
          render={(date) => (date ? dayjs(date).format("L") : "-")}
        />
        <Table.Column
          title={<Trans>Due date</Trans>}
          dataIndex="dueDate"
          key="dueDate"
          sorter={(a: any, b: any) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()}
          render={(date) => (date ? dayjs(date).format("L") : "-")}
        />
        <Table.Column
          title={<Trans>Total</Trans>}
          dataIndex="total"
          key="total"
          align="right"
          sorter={(a: any, b: any) => a.total - b.total}
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
        <Table.Column
          key="actions"
          align="right"
          width={60}
          render={(invoice) => (
            <Dropdown menu={{ items: getActionItems(invoice) }} trigger={["click"]}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        />
      </Table>
    </>
  );
};

export default Invoices;
