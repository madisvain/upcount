import { Dropdown, Space, Tag } from "antd";
import { useSetAtom } from "jotai";
import { MoreOutlined } from "@ant-design/icons";
import { t } from "@lingui/core/macro";
import capitalize from "lodash/capitalize";

import type { MenuProps } from "antd";

import { invoiceAtom, invoiceIdAtom } from "src/atoms";

const stateColor = {
  draft: null,
  sent: "geekblue",
  paid: "green",
  void: "volcano",
};

const items: MenuProps["items"] = [
  {
    key: "draft",
    label: t`Draft`,
  },
  {
    key: "sent",
    label: t`Sent`,
  },
  {
    key: "paid",
    label: t`Paid`,
  },
  {
    key: "void",
    label: t`Void`,
  },
];

const InvoiceStateSelect = ({ invoice }: { invoice: any }) => {
  const setInvoiceId = useSetAtom(invoiceIdAtom);
  const setInvoice = useSetAtom(invoiceAtom);

  const changeState = async (toState: string) => {
    setInvoiceId(invoice.id);
    await setInvoice({ state: toState });
    setInvoiceId(null);
  };

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
          {capitalize(invoice.state)}
          <MoreOutlined />
        </Space>
      </Tag>
    </Dropdown>
  );
};

export default InvoiceStateSelect;
