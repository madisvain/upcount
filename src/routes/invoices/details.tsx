import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, useParams, Link } from "react-router";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Table,
  Row,
  Col,
  Select,
  Space,
  Descriptions,
  Layout,
  Popconfirm,
  theme,
} from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { pdf } from "@react-pdf/renderer";
import dayjs from "dayjs";
import get from "lodash/get";
import includes from "lodash/includes";
import isString from "lodash/isString";
import lowerCase from "lodash/lowerCase";
import find from "lodash/find";
import filter from "lodash/filter";
import map from "lodash/map";
import sum from "lodash/sum";
import isNumber from "lodash/isNumber";
import toNumber from "lodash/toNumber";

import { clientsAtom, setClientsAtom } from "src/atoms/client";
import { invoiceIdAtom, invoiceAtom, deleteInvoiceAtom, duplicateInvoiceAtom } from "src/atoms/invoice";
import { organizationAtom, nextInvoiceNumberAtom } from "src/atoms/organization";
import { taxRatesAtom, setTaxRatesAtom } from "src/atoms/tax-rate";
import ClientForm from "src/components/clients/form.tsx";
import InvoicePDF from "src/components/invoices/pdf";
import { currencies, getCurrencySymbol } from "src/utils/currencies";
import { generateInvoiceNumber } from "src/utils/invoice";
import { multiplyDecimal, divideDecimal, calculateTax, addDecimal } from "src/utils/currency";

const { TextArea } = Input;
const { Option } = Select;
const { Footer } = Layout;

const InvoiceDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const { i18n } = useLingui();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const organization = useAtomValue(organizationAtom);
  const setInvoiceId = useSetAtom(invoiceIdAtom);
  const [invoice, setInvoice] = useAtom(invoiceAtom);
  const clients = useAtomValue(clientsAtom);
  const setClients = useSetAtom(setClientsAtom);
  const taxRates = useAtomValue(taxRatesAtom);
  const setTaxRates = useSetAtom(setTaxRatesAtom);
  const deleteInvoice = useSetAtom(deleteInvoiceAtom);
  const duplicateInvoice = useSetAtom(duplicateInvoiceAtom);
  const nextInvoiceNumber = useAtomValue(nextInvoiceNumberAtom);
  const [, setSubmitting] = useState(false);

  const isNew = id === "new";

  useEffect(() => {
    setClients();
    setTaxRates();
    if (!isNew) {
      setInvoiceId(id || null);
    }

    // Clean up
    return () => {
      setInvoiceId(null);
    };
  }, [id, isNew, setClients, setInvoiceId, setTaxRates]);

  const getInitialValues = () => {
    let values = {
      currency: organization.currency,
      date: dayjs(),
      dueDate: organization.due_days ? dayjs().add(organization.due_days, "day") : null,
      lineItems: [{ quantity: 1, taxRate: get(find(taxRates, { isDefault: 1 }), "id") }],
      customerNotes: organization.customerNotes,
      number: isNew ? (nextInvoiceNumber || '') : undefined,
    };
    if (!isNew && invoice) {
      values = {
        ...invoice,
        lineItems: map(invoice.lineItems, (item) => ({ ...item, total: multiplyDecimal(item.quantity, item.unitPrice) })),
      };
    }
    return values;
  };

  const initialValues = getInitialValues();
  const [form] = Form.useForm();

  // Reset form when invoice data changes (e.g., after duplication)
  useEffect(() => {
    if (!isNew && invoice) {
      const newValues = {
        ...invoice,
        lineItems: map(invoice.lineItems, (item) => ({ ...item, total: multiplyDecimal(item.quantity, item.unitPrice) })),
      };
      form.resetFields();
      form.setFieldsValue(newValues);
    }
  }, [invoice, isNew, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setInvoice({ ...values, subTotal, taxTotal, total });
    setSubmitting(false);
  };

  const handleDelete = (id: string) => async () => {
    await deleteInvoice(id);
    navigate("/invoices");
  };

  const handleDuplicate = (id: string) => async () => {
    const newInvoiceId = await duplicateInvoice(id);
    if (newInvoiceId) {
      navigate(`/invoices/${newInvoiceId}`);
    }
  };
  const lineItems = Form.useWatch("lineItems", form);

  const subTotal = sum(
    map(
      filter(lineItems, (item) => isNumber(get(item, "total"))),
      "total"
    )
  );
  const taxTotal = sum(
    map(
      filter(lineItems, (item) => isNumber(get(item, "total")) && get(item, "taxRate")),
      (item) => {
        const taxRate: any = find(taxRates, { id: get(item, "taxRate") });
        return taxRate?.percentage ? calculateTax(item.total, taxRate.percentage) : 0;
      }
    )
  );
  const total = addDecimal(subTotal, taxTotal);

  if (!organization) return null;
  if (!isNew && !invoice) return null;

  return (
    <>
      <Row>
        <Col span={24}>
          <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={initialValues}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={t`Select or create a client`}
                  name="clientId"
                  rules={[{ required: true, message: t`This field is required!` }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const clientName = get(option, ["props", "children"]);
                      if (isString(clientName)) {
                        return includes(lowerCase(clientName), lowerCase(input));
                      }
                      return true;
                    }}
                    onChange={(clientId) => {
                      if (isNew && organization?.invoiceNumberFormat?.includes('{clientCode}')) {
                        // Find the selected client
                        const selectedClient = clients.find((c: any) => c.id === clientId);
                        const clientCode = selectedClient?.code || '';
                        
                        // Regenerate invoice number with client code
                        const counter = addDecimal((organization.invoiceNumberCounter || 0), 1);
                        const newNumber = organization.invoiceNumberFormat 
                          ? generateInvoiceNumber(
                              organization.invoiceNumberFormat,
                              counter,
                              new Date(),
                              clientCode
                            )
                          : '';
                        form.setFieldsValue({ number: newNumber });
                      }
                    }}
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Button
                          type="text"
                          block
                          icon={<UserAddOutlined />}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(location.pathname, { state: { clientModal: true } });
                          }}
                          style={{ textAlign: "left", paddingLeft: 11, paddingRight: 11 }}
                        >
                          <Trans>New client</Trans>
                        </Button>
                      </>
                    )}
                  >
                    {map(clients, (client: any) => (
                      <Select.Option value={client.id} key={client.id}>
                        {get(client, "name", "-")}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t`Invoice number`}
                  name="number"
                  rules={[{ required: true, message: t`This field is required!` }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t`Currency`}
                  name="currency"
                  rules={[{ required: true, message: t`This field is required!` }]}
                >
                  <Select>
                    {map(currencies, (currency) => {
                      const symbol = getCurrencySymbol(i18n.locale, currency);
                      return (
                        <Option value={currency} key={currency}>
                          {`${currency} ${currency !== symbol ? symbol : ""}`}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6} offset={12}>
                <Form.Item label="Date" name="date" rules={[{ required: true, message: t`This field is required!` }]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t`Due date`}
                  name="dueDate"
                  rules={[{ required: true, message: t`This field is required!` }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "20px" }}>
              <Col span={24}>
                <Form.List name="lineItems">
                  {(fields, { add, remove }) => (
                    <>
                      <Table
                        dataSource={fields}
                        pagination={false}
                        size="middle"
                        locale={{ emptyText: t`No line items` }}
                      >
                        <Table.Column
                          title={t`Description`}
                          key="description"
                          onCell={() => {
                            return {
                              style: {
                                paddingLeft: 0,
                              },
                            };
                          }}
                          render={(field) => (
                            <>
                              <MoreOutlined style={{ position: "absolute", top: 20, left: -20 }} />
                              <Form.Item
                                name={[field.name, "description"]}
                                rules={[{ required: true, message: t`This field is required!` }]}
                                noStyle
                              >
                                <TextArea rows={4} autoSize />
                              </Form.Item>
                            </>
                          )}
                        />
                        <Table.Column
                          title={t`Qty.`}
                          key="quantity"
                          width={120}
                          render={(field) => (
                            <Form.Item
                              name={[field.name, "quantity"]}
                              rules={[{ required: true, message: t`This field is required!` }]}
                              noStyle
                            >
                              <InputNumber
                                onChange={(value) => {
                                  const total = form.getFieldValue(["lineItems", field.key, "total"]);
                                  const unitPrice = form.getFieldValue(["lineItems", field.key, "unitPrice"]);

                                  value = toNumber(value);
                                  if (value) {
                                    if (!unitPrice && total) {
                                      form.setFieldValue(["lineItems", field.key, "unitPrice"], divideDecimal(total, value));
                                    } else {
                                      form.setFieldValue(["lineItems", field.key, "total"], multiplyDecimal(value, unitPrice));
                                    }
                                  }
                                }}
                              />
                            </Form.Item>
                          )}
                        />
                        <Table.Column
                          title={t`Price`}
                          key="unitPrice"
                          width={120}
                          render={(field) => (
                            <Form.Item
                              name={[field.name, "unitPrice"]}
                              rules={[{ required: true, message: t`This field is required!` }]}
                              noStyle
                            >
                              <InputNumber
                                onChange={(value) => {
                                  const total = form.getFieldValue(["lineItems", field.key, "total"]);
                                  const quantity = form.getFieldValue(["lineItems", field.key, "quantity"]);

                                  value = toNumber(value);
                                  if (value) {
                                    if (!quantity && total) {
                                      form.setFieldValue(["lineItems", field.key, "quantity"], divideDecimal(total, value));
                                    } else {
                                      form.setFieldValue(["lineItems", field.key, "total"], multiplyDecimal(quantity, value));
                                    }
                                  }
                                }}
                              />
                            </Form.Item>
                          )}
                        />
                        <Table.Column
                          title={t`Total`}
                          key="total"
                          width={120}
                          render={(field) => (
                            <Form.Item
                              name={[field.name, "total"]}
                              rules={[{ required: true, message: t`This field is required!` }]}
                              noStyle
                            >
                              <InputNumber
                                onChange={(value) => {
                                  const unitPrice = form.getFieldValue(["lineItems", field.key, "unitPrice"]);
                                  const quantity = form.getFieldValue(["lineItems", field.key, "quantity"]);

                                  value = toNumber(value);
                                  if (value) {
                                    if (!quantity && unitPrice) {
                                      form.setFieldValue(["lineItems", field.key, "quantity"], divideDecimal(value, unitPrice));
                                    } else {
                                      form.setFieldValue(["lineItems", field.key, "unitPrice"], divideDecimal(value, quantity));
                                    }
                                  }
                                }}
                              />
                            </Form.Item>
                          )}
                        />
                        <Table.Column
                          title={t`Tax`}
                          key="taxRate"
                          width={120}
                          onCell={() => {
                            return {
                              style: {
                                position: "relative",
                                paddingRight: 0,
                              },
                            };
                          }}
                          render={(field) => (
                            <>
                              <DeleteOutlined
                                onClick={() => remove(field.name)}
                                style={{ position: "absolute", top: 20, right: -20 }}
                              />
                              <Form.Item name={[field.name, "taxRate"]} noStyle>
                                <Select style={{ width: "100%" }} allowClear placeholder="Select tax rate">
                                  {map(taxRates, (rate: any) => {
                                    return (
                                      <Option value={rate.id} key={rate.id}>
                                        {rate.name}
                                      </Option>
                                    );
                                  })}
                                </Select>
                              </Form.Item>
                            </>
                          )}
                        />
                      </Table>
                      <Form.Item style={{ marginTop: 16 }}>
                        <Button 
                          type="default" 
                          size="small" 
                          onClick={() => add({ quantity: 1, taxRate: get(find(taxRates, { isDefault: 1 }), "id") })} 
                          icon={<PlusOutlined />}
                        >
                          <Trans>Add line item</Trans>
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={t`Customer note`} name="customerNotes">
                  <TextArea rows={4} />
                </Form.Item>
              </Col>

              {/* Totals */}
              <Col span={12} offset={4}>
                <Descriptions
                  column={1}
                  styles={{
                    content: {
                      textAlign: "right",
                      display: "inline-block",
                      minWidth: 120,
                      color: "rgba(0, 0, 0, 0.88)",
                      fontSize: 15,
                      lineHeight: 1.4,
                    },
                    label: {
                      textAlign: "right",
                      display: "inline-block",
                      width: "100%",
                      color: "rgba(0, 0, 0, 0.88)",
                      fontWeight: 500,
                      fontSize: 15,
                      lineHeight: 1.4,
                    }
                  }}
                >
                  <Descriptions.Item label={<Trans>Subtotal</Trans>}>
                    {Intl.NumberFormat(i18n.locale, {
                      style: "currency",
                      currency: organization.currency,
                      minimumFractionDigits: organization.minimum_fraction_digits,
                    }).format(subTotal)}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Trans>Tax</Trans>}>
                    {Intl.NumberFormat(i18n.locale, {
                      style: "currency",
                      currency: organization.currency,
                      minimumFractionDigits: organization.minimum_fraction_digits,
                    }).format(taxTotal)}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <strong>
                        <Trans>Total</Trans>
                      </strong>
                    }
                  >
                    <strong>
                      {Intl.NumberFormat(i18n.locale, {
                        style: "currency",
                        currency: organization.currency,
                        minimumFractionDigits: organization.minimum_fraction_digits,
                      }).format(total)}
                    </strong>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            {/* Footer menu */}
            {document.getElementById("footer") &&
              createPortal(
                <Footer
                  style={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 1,
                    padding: 0,
                    background: colorBgContainer,
                    paddingLeft: 16,
                    paddingRight: 16,
                  }}
                >
                  <Row align="middle" justify="space-between" style={{ height: 64 }}>
                    <Col>
                      <Space>
                        {id && !isNew && (
                          <Button type="dashed" onClick={handleDuplicate(id)}>
                            <CopyOutlined /> <Trans>Duplicate</Trans>
                          </Button>
                        )}
                        {id && !isNew && (
                          <Popconfirm
                            title={t`Delete the invoice?`}
                            description={t`Are you sure to delete this invoice?`}
                            onConfirm={handleDelete(id)}
                            okText={t`Yes`}
                            cancelText={t`No`}
                          >
                            <Button type="dashed">
                              <DeleteOutlined /> <Trans>Delete</Trans>
                            </Button>
                          </Popconfirm>
                        )}
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        {/*!isNew && invoice && (
                          <Dropdown overlay={stateMenu(invoice._id, invoice._rev)} trigger={["click"]}>
                            <StateTag state={invoice.state} style={{ marginTop: 10, marginRight: 20 }} />
                          </Dropdown>
                        )*/}
                        {!isNew && (
                          <Link to={`/invoices/${id}/preview`}>
                            <Button type="dashed">
                              <EyeOutlined /> <Trans>View</Trans>
                            </Button>
                          </Link>
                        )}
                        {!isNew && (
                          <Button
                            onClick={async () => {
                              const filePath: string | null = await save({ defaultPath: `invoice-${id}.pdf` });
                              if (!filePath) return;

                              const blob = await pdf(
                                <InvoicePDF
                                  invoice={invoice}
                                  client={find(clients, { id: invoice.clientId })}
                                  organization={organization}
                                  i18n={i18n}
                                />
                              ).toBlob();
                              const contents = new Uint8Array(await blob.arrayBuffer());
                              await writeFile(filePath, contents);
                            }}
                          >
                            <FilePdfOutlined /> PDF
                          </Button>
                        )}
                        <Button type="primary" disabled={false} loading={false} onClick={() => form.submit()}>
                          <SaveOutlined /> <Trans>Save</Trans>
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Footer>,
                // @ts-expect-error - Footer can be null
                document.getElementById("footer")
              )}
          </Form>
        </Col>
      </Row>

      <ClientForm />
    </>
  );
};

export default InvoiceDetails;
