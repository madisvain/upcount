import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, useParams } from "react-router";
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
  Spin,
} from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { Document, Page } from "react-pdf";
import dayjs from "dayjs";

// Import CSS for react-pdf
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
import { useDatePickerFormat, formatDate } from "src/utils/date";
import {
  invoiceIdAtom,
  invoiceAtom,
  deleteInvoiceAtom,
  duplicateInvoiceAtom,
} from "src/atoms/invoice";
import { organizationAtom, nextInvoiceNumberAtom } from "src/atoms/organization";
import { taxRatesAtom, setTaxRatesAtom } from "src/atoms/tax-rate";
import { siderAtom } from "src/atoms/generic";
import ClientForm from "src/components/clients/form.tsx";
import { currencies, getFormattedNumber } from "src/utils/currencies";
import { generateInvoiceNumber } from "src/utils/invoice";
import { multiplyDecimal, divideDecimal, calculateTax, addDecimal } from "src/utils/currency";

const { TextArea } = Input;
const { Option } = Select;
const { Footer } = Layout;

// Drag handle component that works with the table cell
const DragHandleCell: React.FC<{
  children: React.ReactNode;
  rowKey: string;
}> = ({ children, rowKey }) => {
  const { attributes, listeners } = useSortable({
    id: rowKey,
  });

  return (
    <>
      <MoreOutlined
        {...attributes}
        {...listeners}
        style={{ position: "absolute", top: 20, left: -20, cursor: "move", color: "#999" }}
      />
      {children}
    </>
  );
};

// Sortable row component for Ant Design Table
const SortableRow: React.FC<{
  children: React.ReactNode;
  "data-row-key": string;
  [key: string]: any;
}> = ({ children, ...props }) => {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: props["data-row-key"],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr {...props} ref={setNodeRef} style={style}>
      {children}
    </tr>
  );
};

const PDFPreview: React.FC<{
  buildPdfRequest: () => { request: any; logoData: string | null } | null;
}> = ({ buildPdfRequest }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const siderCollapsed = useAtomValue(siderAtom);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const measureWidth = () => {
        setContainerWidth(node.offsetWidth - 40);
      };
      measureWidth();
      const handleResize = () => measureWidth();
      window.addEventListener("resize", handleResize);
      (node as any)._cleanup = () => window.removeEventListener("resize", handleResize);
    } else {
      const prevNode = containerRef as any;
      if (prevNode._cleanup) prevNode._cleanup();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      setTimeout(() => {
        const container = document.querySelector("[data-pdf-container]") as HTMLDivElement;
        if (container?.parentElement) {
          setContainerWidth(container.parentElement.offsetWidth - 40);
        }
      }, 100);
    }, 500);
    return () => clearTimeout(timer);
  }, [siderCollapsed]);

  useEffect(() => {
    const generatePDF = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = buildPdfRequest();
        if (!result) {
          setError("Please select a client to view PDF preview.");
          setLoading(false);
          return;
        }

        const pdfBytes: number[] = await invoke("generate_pdf", {
          request: result.request,
          logoData: result.logoData,
        });
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("PDF generation error:", err);
        setError("Error generating PDF preview. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generatePDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: "50px", color: "red" }}>{error}</div>;
  }

  return (
    <div ref={containerRef} data-pdf-container style={{ width: "100%" }}>
      <Document file={pdfUrl}>
        <Page
          pageNumber={1}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={containerWidth > 0 ? containerWidth : undefined}
        />
      </Document>
    </div>
  );
};

const InvoiceDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const { i18n } = useLingui();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const organization = useAtomValue(organizationAtom);
  const [invoiceId, setInvoiceId] = useAtom(invoiceIdAtom);
  const [invoice, setInvoice] = useAtom(invoiceAtom);
  const clients = useAtomValue(clientsAtom);
  const setClients = useSetAtom(setClientsAtom);
  const taxRates = useAtomValue(taxRatesAtom);
  const setTaxRates = useSetAtom(setTaxRatesAtom);
  const deleteInvoice = useSetAtom(deleteInvoiceAtom);
  const duplicateInvoice = useSetAtom(duplicateInvoiceAtom);
  const nextInvoiceNumber = useAtomValue(nextInvoiceNumberAtom);
  const [, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const dateFormat = useDatePickerFormat();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  // Navigate to the new invoice after successful creation
  useEffect(() => {
    if (isNew && invoiceId) {
      navigate(`/invoices/${invoiceId}`);
    }
  }, [isNew, invoiceId, navigate]);

  const getInitialValues = () => {
    let values = {
      currency: organization.currency,
      date: dayjs(),
      dueDate: organization.due_days ? dayjs().add(organization.due_days, "day") : null,
      lineItems: [{ quantity: 1, taxRate: get(find(taxRates, { isDefault: 1 }), "id") }],
      customerNotes: organization.customerNotes,
      overdueCharge: organization.overdueCharge || 0,
      number: isNew ? nextInvoiceNumber || "" : undefined,
    };

    if (!isNew && invoice) {
      values = {
        ...invoice,
        lineItems: map(invoice.lineItems, (item) => ({
          ...item,
          total: multiplyDecimal(item.quantity, item.unitPrice),
        })),
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
        lineItems: map(invoice.lineItems, (item) => ({
          ...item,
          total: multiplyDecimal(item.quantity, item.unitPrice),
        })),
      };
      form.resetFields();
      form.setFieldsValue(newValues);
    }
  }, [invoice, isNew, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    await setInvoice({
      ...values,
      subTotal,
      taxTotal,
      total,
      overdueCharge: values.overdueCharge,
    });
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

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const lineItems = form.getFieldValue("lineItems") || [];
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over?.id as string);

      if (oldIndex !== newIndex && !isNaN(oldIndex) && !isNaN(newIndex)) {
        const newLineItems = arrayMove(lineItems, oldIndex, newIndex);
        form.setFieldValue("lineItems", newLineItems);
      }
    }
  };
  const lineItems = Form.useWatch("lineItems", form);

  const subTotal = sum(
    map(
      filter(lineItems, (item) => isNumber(get(item, "total"))),
      "total",
    ),
  );
  // Group line items by tax rate and calculate tax for each group
  const taxGroups = useMemo(() => {
    const groups: { [key: string]: { taxRate: any; items: any[]; subtotal: number; tax: number } } =
      {};

    if (lineItems && Array.isArray(lineItems)) {
      lineItems.forEach((item: any) => {
        if (isNumber(get(item, "total")) && get(item, "taxRate")) {
          const taxRateId = get(item, "taxRate");
          const taxRate = find(taxRates, { id: taxRateId });

          if (!groups[taxRateId]) {
            groups[taxRateId] = {
              taxRate,
              items: [],
              subtotal: 0,
              tax: 0,
            };
          }

          groups[taxRateId].items.push(item);
          groups[taxRateId].subtotal = addDecimal(groups[taxRateId].subtotal, item.total);
          groups[taxRateId].tax = taxRate?.percentage
            ? calculateTax(groups[taxRateId].subtotal, taxRate.percentage)
            : 0;
        }
      });
    }

    return Object.values(groups);
  }, [lineItems, taxRates]);

  const taxTotal = sum(map(taxGroups, "tax"));
  const total = addDecimal(subTotal, taxTotal);

  const buildPdfRequest = () => {
    const formValues = form.getFieldsValue();
    const clientData = find(clients, { id: formValues.clientId });
    if (!clientData) return null;

    const dateFormat = organization?.date_format;
    const currency = formValues.currency || organization.currency;
    const fmt = (n: number) => getFormattedNumber(n, currency, i18n.locale, organization);

    let clientEmail = "";
    try {
      const emails =
        typeof clientData.emails === "string" ? JSON.parse(clientData.emails) : clientData.emails;
      clientEmail = emails?.[0] || "";
    } catch {
      clientEmail = "";
    }

    const items = (formValues.lineItems || []).filter((item: any) => isNumber(get(item, "total")));

    const request = {
      invoice: {
        number: formValues.number || "",
        date: formatDate(formValues.date, dateFormat),
        dueDate: formatDate(formValues.dueDate, dateFormat),
        overdueCharge: formValues.overdueCharge ? `${formValues.overdueCharge}%` : null,
        customerNotes: formValues.customerNotes || null,
      },
      client: {
        name: clientData.name || "",
        address: clientData.address || null,
        email: clientEmail || null,
        website: clientData.website || null,
      },
      organization: {
        name: organization.name || "",
        address: organization.address || null,
        email: organization.email || null,
        website: organization.website || null,
        bankName: organization.bank_name || null,
        iban: organization.iban || null,
        registrationNumber: organization.registration_number || null,
        vatin: organization.vatin || null,
      },
      lineItems: items.map((item: any) => {
        const taxRate = find(taxRates, { id: item.taxRate });
        return {
          description: item.description || "",
          quantity: String(item.quantity ?? ""),
          unitPrice: fmt(item.unitPrice),
          taxPct: taxRate ? `${taxRate.percentage}%` : "",
          total: fmt(item.total),
        };
      }),
      subtotal: fmt(subTotal),
      taxGroups: taxGroups.map((group: any) => ({
        name: group.taxRate
          ? `${group.taxRate.name} ${group.taxRate.percentage}%`
          : i18n._("Tax 0%"),
        amount: fmt(group.tax),
      })),
      total: fmt(total),
      labels: {
        invoice: i18n._("Invoice"),
        date: i18n._("Date"),
        dueDate: i18n._("Due date"),
        overdueCharge: i18n._("Overdue charge"),
        description: i18n._("Description"),
        qty: i18n._("Qty."),
        price: i18n._("Price"),
        tax: i18n._("Tax %"),
        total: i18n._("Total"),
        subtotal: i18n._("Subtotal"),
      },
      hasLogo: !!organization.logo,
    };

    return { request, logoData: organization.logo || null };
  };

  if (!organization) return null;
  if (!isNew && !invoice) return null;

  return (
    <>
      <Row>
        <Col span={24}>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={initialValues}
            style={{ display: previewMode ? "none" : "block" }}
          >
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
                      if (isNew && organization?.invoiceNumberFormat?.includes("{clientCode}")) {
                        // Find the selected client
                        const selectedClient = clients.find((c: any) => c.id === clientId);
                        const clientCode = selectedClient?.code || "";

                        // Regenerate invoice number with client code
                        const counter = addDecimal(organization.invoiceNumberCounter || 0, 1);
                        const newNumber = organization.invoiceNumberFormat
                          ? generateInvoiceNumber(
                              organization.invoiceNumberFormat,
                              counter,
                              new Date(),
                              clientCode,
                            )
                          : "";
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
                      return (
                        <Option value={currency} key={currency}>
                          {currency}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={4} offset={12}>
                <Form.Item
                  label="Date"
                  name="date"
                  rules={[{ required: true, message: t`This field is required!` }]}
                >
                  <DatePicker style={{ width: "100%" }} format={dateFormat} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={t`Due date`}
                  name="dueDate"
                  rules={[{ required: true, message: t`This field is required!` }]}
                >
                  <DatePicker style={{ width: "100%" }} format={dateFormat} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={t`Overdue charge`}
                  name="overdueCharge"
                  help={
                    <span
                      style={{ fontSize: "12px", display: "block", textAlign: "right" }}
                    >{t`Daily %`}</span>
                  }
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={100}
                    step={0.01}
                    formatter={(value) => `${value} %`}
                    parser={(value) => value?.replace("%", "") as any}
                    placeholder="0%"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "20px" }}>
              <Col span={24}>
                <Form.List name="lineItems">
                  {(fields, { add, remove }) => (
                    <>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={fields.map((_, index) => index.toString())}
                          strategy={verticalListSortingStrategy}
                        >
                          <Table
                            dataSource={fields.map((field, index) => ({ ...field, index }))}
                            pagination={false}
                            size="middle"
                            locale={{ emptyText: t`No line items` }}
                            rowKey={(record) => record.index.toString()}
                            components={{
                              body: {
                                row: SortableRow,
                              },
                            }}
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
                              render={(field, record) => (
                                <DragHandleCell rowKey={record.index.toString()}>
                                  <Form.Item
                                    name={[field.name, "description"]}
                                    rules={[
                                      { required: true, message: t`This field is required!` },
                                    ]}
                                    noStyle
                                  >
                                    <TextArea rows={4} autoSize />
                                  </Form.Item>
                                </DragHandleCell>
                              )}
                            />
                            <Table.Column
                              title={t`Qty.`}
                              key="quantity"
                              width={80}
                              render={(field) => (
                                <Form.Item
                                  name={[field.name, "quantity"]}
                                  rules={[{ required: true, message: t`This field is required!` }]}
                                  noStyle
                                >
                                  <InputNumber
                                    style={{ width: "100%" }}
                                    onChange={(value) => {
                                      const total = form.getFieldValue([
                                        "lineItems",
                                        field.key,
                                        "total",
                                      ]);
                                      const unitPrice = form.getFieldValue([
                                        "lineItems",
                                        field.key,
                                        "unitPrice",
                                      ]);

                                      value = toNumber(value);
                                      if (value) {
                                        if (!unitPrice && total) {
                                          form.setFieldValue(
                                            ["lineItems", field.key, "unitPrice"],
                                            divideDecimal(total, value),
                                          );
                                        } else if (unitPrice) {
                                          form.setFieldValue(
                                            ["lineItems", field.key, "total"],
                                            multiplyDecimal(value, unitPrice),
                                          );
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
                                    style={{ width: "100%" }}
                                    onChange={(value) => {
                                      const total = form.getFieldValue([
                                        "lineItems",
                                        field.key,
                                        "total",
                                      ]);
                                      const quantity = form.getFieldValue([
                                        "lineItems",
                                        field.key,
                                        "quantity",
                                      ]);

                                      value = toNumber(value);
                                      if (value) {
                                        if (!quantity && total) {
                                          form.setFieldValue(
                                            ["lineItems", field.key, "quantity"],
                                            divideDecimal(total, value),
                                          );
                                        } else if (quantity) {
                                          form.setFieldValue(
                                            ["lineItems", field.key, "total"],
                                            multiplyDecimal(quantity, value),
                                          );
                                        }
                                      }
                                    }}
                                  />
                                </Form.Item>
                              )}
                            />
                            <Table.Column
                              title={t`Tax %`}
                              key="taxRate"
                              width={120}
                              render={(field) => (
                                <Form.Item name={[field.name, "taxRate"]} noStyle>
                                  <Select
                                    style={{ width: "100%" }}
                                    allowClear
                                    placeholder="Select tax"
                                  >
                                    {map(taxRates, (rate: any) => {
                                      return (
                                        <Option value={rate.id} key={rate.id}>
                                          {rate.name} {rate.percentage}%
                                        </Option>
                                      );
                                    })}
                                  </Select>
                                </Form.Item>
                              )}
                            />
                            <Table.Column
                              title={t`Total`}
                              key="total"
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
                                  <Form.Item
                                    name={[field.name, "total"]}
                                    rules={[
                                      { required: true, message: t`This field is required!` },
                                    ]}
                                    noStyle
                                  >
                                    <InputNumber
                                      style={{ width: "100%" }}
                                      onChange={(value) => {
                                        const unitPrice = form.getFieldValue([
                                          "lineItems",
                                          field.key,
                                          "unitPrice",
                                        ]);
                                        const quantity = form.getFieldValue([
                                          "lineItems",
                                          field.key,
                                          "quantity",
                                        ]);

                                        value = toNumber(value);
                                        if (value) {
                                          if (!quantity && unitPrice) {
                                            form.setFieldValue(
                                              ["lineItems", field.key, "quantity"],
                                              divideDecimal(value, unitPrice),
                                            );
                                          } else if (quantity) {
                                            form.setFieldValue(
                                              ["lineItems", field.key, "unitPrice"],
                                              divideDecimal(value, quantity),
                                            );
                                          }
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </>
                              )}
                            />
                          </Table>
                        </SortableContext>
                      </DndContext>
                      <Form.Item style={{ marginTop: 16 }}>
                        <Button
                          type="default"
                          size="small"
                          onClick={() =>
                            add({
                              quantity: 1,
                              taxRate: get(find(taxRates, { isDefault: 1 }), "id"),
                            })
                          }
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
                    },
                  }}
                >
                  <Descriptions.Item label={<Trans>Subtotal</Trans>}>
                    {Intl.NumberFormat(i18n.locale, {
                      style: "currency",
                      currency: organization.currency,
                      minimumFractionDigits: organization.minimum_fraction_digits,
                    }).format(subTotal)}
                  </Descriptions.Item>
                  {taxGroups.length > 0 ? (
                    taxGroups.map((group) => (
                      <Descriptions.Item
                        key={group.taxRate?.id}
                        label={`${group.taxRate?.name || "Tax"} ${group.taxRate?.percentage || 0}%`}
                      >
                        {Intl.NumberFormat(i18n.locale, {
                          style: "currency",
                          currency: organization.currency,
                          minimumFractionDigits: organization.minimum_fraction_digits,
                        }).format(group.tax)}
                      </Descriptions.Item>
                    ))
                  ) : (
                    <Descriptions.Item label={<Trans>Tax</Trans>}>
                      {Intl.NumberFormat(i18n.locale, {
                        style: "currency",
                        currency: organization.currency,
                        minimumFractionDigits: organization.minimum_fraction_digits,
                      }).format(0)}
                    </Descriptions.Item>
                  )}
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
                          <Button type="dashed" onClick={() => setPreviewMode(!previewMode)}>
                            {previewMode ? (
                              <>
                                <EditOutlined /> <Trans>Edit</Trans>
                              </>
                            ) : (
                              <>
                                <EyeOutlined /> <Trans>View</Trans>
                              </>
                            )}
                          </Button>
                        )}
                        {!isNew && (
                          <Button
                            onClick={async () => {
                              const filePath: string | null = await save({
                                defaultPath: `invoice-${id}.pdf`,
                              });
                              if (!filePath) return;

                              const result = buildPdfRequest();
                              if (!result) return;
                              const pdfBytes: number[] = await invoke("generate_pdf", {
                                request: result.request,
                                logoData: result.logoData,
                              });
                              await writeFile(filePath, new Uint8Array(pdfBytes));
                            }}
                          >
                            <FilePdfOutlined /> PDF
                          </Button>
                        )}
                        <Button
                          type="primary"
                          disabled={false}
                          loading={false}
                          onClick={() => form.submit()}
                        >
                          <SaveOutlined /> <Trans>Save</Trans>
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Footer>,
                // @ts-expect-error - Footer can be null
                document.getElementById("footer"),
              )}
          </Form>
          {previewMode && (
            // PDF Preview Mode
            <PDFPreview buildPdfRequest={buildPdfRequest} />
          )}
        </Col>
      </Row>

      <ClientForm />
    </>
  );
};

export default InvoiceDetails;
