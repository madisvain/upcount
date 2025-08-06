import { Dropdown, Space, Tag } from "antd";
import { useSetAtom } from "jotai";
import { MoreOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";

import type { MenuProps } from "antd";

import { updateInvoiceStateAtom } from "src/atoms/invoice";

const stateColor = {
  draft: null,
  sent: "geekblue",
  paid: "green",
  void: "volcano",
};

const InvoiceStateSelect = ({ invoice }: { invoice: any }) => {
  const updateInvoiceState = useSetAtom(updateInvoiceStateAtom);

  const changeState = async (toState: string) => {
    await updateInvoiceState({ invoiceId: invoice.id, state: toState });
  };

  const items: MenuProps["items"] = [
    {
      key: "draft",
      label: <Trans>Draft</Trans>,
    },
    {
      key: "sent",
      label: <Trans>Sent</Trans>,
    },
    {
      key: "paid",
      label: <Trans>Paid</Trans>,
    },
    {
      key: "void",
      label: <Trans>Void</Trans>,
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [invoice.state],
        onSelect: ({ key }) => {
          changeState(key);
        },
      }}
    >
      {/* @ts-expect-error - TODO: stateColor ts definition */}
      <Tag color={stateColor[invoice.state]} style={{ marginInlineEnd: 0, cursor: "pointer" }}>
        <Space size={4} style={{ fontSize: 12 }}>
          {invoice.state === "draft" ? (
            <Trans>Draft</Trans>
          ) : invoice.state === "sent" ? (
            <Trans>Sent</Trans>
          ) : invoice.state === "paid" ? (
            <Trans>Paid</Trans>
          ) : invoice.state === "void" ? (
            <Trans>Void</Trans>
          ) : (
            invoice.state
          )}
          <MoreOutlined />
        </Space>
      </Tag>
    </Dropdown>
  );
};

export default InvoiceStateSelect;
