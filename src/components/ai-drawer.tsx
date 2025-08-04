import { Drawer, Space, Input, Button, List, Typography, Alert, Spin, Tag } from "antd";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  PaperClipOutlined,
  FileTextOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue } from "jotai";
import { aiDrawerAtom } from "src/atoms/generic";
import { anthropicApiKeyAtom } from "src/atoms/ai";
import { useState } from "react";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, stepCountIs } from "ai";
import { Link, useNavigate } from "react-router";
import { fetch } from "@tauri-apps/plugin-http";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import omit from "lodash/omit";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { organizationIdAtom, organizationAtom } from "src/atoms/organization";
import { unitsToCents } from "src/utils/currency";
import { taxRatesAtom } from "src/atoms/tax-rate";
import { tool } from "ai";
import { z } from "zod";

const { TextArea } = Input;
const { Text } = Typography;

interface FileAttachment {
  name: string;
  content: string;
  path: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: FileAttachment[];
}

export default function AiDrawer() {
  const [open, setOpen] = useAtom(aiDrawerAtom);
  const apiKey = useAtomValue(anthropicApiKeyAtom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const navigate = useNavigate();
  const organizationId = useAtomValue(organizationIdAtom);
  const organization = useAtomValue(organizationAtom);
  const taxRates = useAtomValue(taxRatesAtom);

  const handleFileSelect = async () => {
    try {
      const selected = await openDialog({
        multiple: true,
      });

      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected];
        const newAttachments = await Promise.all(
          files.map(async (filePath) => {
            const content = await readTextFile(filePath);
            const name = filePath.split("/").pop() || "unknown";
            return { name, content, path: filePath };
          })
        );
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch (err) {
      console.error("Error selecting files:", err);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Define tools using AI SDK format
  const tools = {
    create_invoice: tool({
      description: "Create a new invoice in the system",
      inputSchema: z.object({
        clientId: z.string().describe("The ID of the client for this invoice"),
        currency: z.string().describe("Currency code (e.g., USD, EUR)"),
        date: z.string().optional().describe("Invoice date in ISO format"),
        dueDate: z.string().optional().describe("Due date in ISO format"),
        lineItems: z
          .array(
            z.object({
              description: z.string(),
              quantity: z.number(),
              unitPrice: z.number(),
              taxRateId: z.string().optional(),
            })
          )
          .describe("Line items for the invoice"),
        customerNotes: z.string().optional().describe("Notes for the customer"),
      }),
      execute: async (args) => {
        try {
          // Find default tax rate if needed
          const defaultTaxRate = taxRates.find((t: any) => t.isDefault);

          // Prepare line items
          const lineItemsWithTotals = (args.lineItems || []).map((item: any) => ({
            ...item,
            taxRateId: item.taxRateId || defaultTaxRate?.id,
            unitPrice: unitsToCents(item.unitPrice),
          }));

          const invoiceNumber = organization?.invoiceNumberPrefix
            ? `${organization.invoiceNumberPrefix}${(organization.invoiceNumberCounter || 0) + 1}`
            : `${(organization?.invoiceNumberCounter || 0) + 1}`;

          // Calculate totals (backend requires these fields)
          let subTotal = 0;
          let taxTotal = 0;

          lineItemsWithTotals.forEach((item: any) => {
            // unitPrice is already in cents after unitsToCents conversion
            const itemTotal = (item.quantity * item.unitPrice) / 100; // Convert back to units for calculation
            subTotal += itemTotal;

            if (item.taxRateId) {
              const taxRate = taxRates.find((t: any) => t.id === item.taxRateId);
              if (taxRate && taxRate.rate) {
                const itemTax = (itemTotal * taxRate.rate) / 100;
                taxTotal += itemTax;
              }
            }
          });

          const total = subTotal + taxTotal;

          // Use organization defaults
          const invoiceDate = args.date ? dayjs(args.date).valueOf() : dayjs().valueOf();
          const defaultCurrency = args.currency || organization?.currency || "USD";

          // Calculate due date based on due_days setting
          let dueDate = null;
          if (args.dueDate) {
            dueDate = dayjs(args.dueDate).valueOf();
          } else if (organization?.due_days) {
            dueDate = dayjs(invoiceDate).add(organization.due_days, "days").valueOf();
          } else {
            // Default to 30 days if not set
            dueDate = dayjs(invoiceDate).add(30, "days").valueOf();
          }

          const invoiceData = {
            id: nanoid(),
            organizationId,
            number: invoiceNumber,
            state: "draft",
            clientId: args.clientId,
            date: invoiceDate,
            dueDate: dueDate,
            currency: defaultCurrency,
            total: unitsToCents(total),
            taxTotal: unitsToCents(taxTotal),
            subTotal: unitsToCents(subTotal),
            customerNotes: args.customerNotes || "",
            lineItems: lineItemsWithTotals,
          };

          const createdInvoice = await invoke<any>("create_invoice", {
            invoice: invoiceData,
          });

          // Navigate to the new invoice
          navigate(`/invoices/${createdInvoice.id}`);
          setOpen(false);

          return {
            success: true,
            invoiceId: createdInvoice.id,
            invoiceNumber: createdInvoice.number,
            message: `Invoice ${createdInvoice.number} created successfully!`,
          };
        } catch (error) {
          console.error("Failed to create invoice:", error);
          return {
            success: false,
            error: `Failed to create invoice: ${error}`,
          };
        }
      },
    }),

    list_clients: tool({
      description: "List all available clients to select from",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const clientsList = await invoke<any[]>("get_clients", { organizationId });
          return {
            clients: clientsList.map((client: any) => ({
              id: client.id,
              name: client.name,
              email: client.email,
              code: client.code,
            })),
          };
        } catch (error) {
          console.error("Failed to fetch clients:", error);
          return {
            clients: [],
            error: "Failed to fetch clients",
          };
        }
      },
    }),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);
    setError(null);

    try {
      const anthropic = createAnthropic({
        apiKey: apiKey,
        fetch: async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
          const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

          const headers = {
            ...omit(init?.headers as any, ["content-length"]),
            "anthropic-dangerous-direct-browser-access": "true",
          };

          const response = await fetch(url, {
            method: init?.method || "GET",
            headers: headers as any,
            body: init?.body as string,
          });

          return response;
        },
      });

      const result = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        messages: [
          ...messages.map((msg) => ({
            role: msg.role,
            content:
              msg.attachments && msg.attachments.length > 0
                ? `${msg.content}\n\n${msg.attachments
                    .map((att) => `File: ${att.name}\n\`\`\`\n${att.content}\n\`\`\``)
                    .join("\n\n")}`
                : msg.content,
          })),
          {
            role: "user",
            content:
              userMessage.attachments && userMessage.attachments.length > 0
                ? `${userMessage.content}\n\n${userMessage.attachments
                    .map((att) => `File: ${att.name}\n\`\`\`\n${att.content}\n\`\`\``)
                    .join("\n\n")}`
                : userMessage.content,
          },
        ],
        tools,
        stopWhen: stepCountIs(5), // Enable multi-step generation (max 5 steps)
        system:
          "You are a helpful AI assistant for an invoicing application. You have access to tools that can create invoices and list clients. When a user asks to create an invoice, follow these steps EXACTLY:\n\n1. Call list_clients to show available options\n2. Ask for the hourly rate (currency and payment terms use organization defaults)\n3. MANDATORY: Show a detailed summary with:\n   - Client name\n   - Total hours\n   - Hourly rate\n   - Line items description\n   - Subtotal calculation\n   - Tax amount (if applicable)\n   - Total amount\n   - Currency\n   - Invoice date and due date\n4. MANDATORY: Ask 'Do you want me to create this invoice?' or similar confirmation question\n5. WAIT for user's explicit confirmation (yes/proceed/confirm/create it)\n6. ONLY create the invoice after receiving explicit confirmation\n\nNEVER skip the confirmation step. NEVER create an invoice without showing the summary and getting confirmation first.",
      });

      // According to AI SDK docs, result.text contains the complete response including tool results

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.text || "I'm processing your request...",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <Drawer
        title={
          <Space>
            <RobotOutlined />
            <Trans>AI Assistant</Trans>
          </Space>
        }
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={400}
      >
        <Alert
          message={<Trans>API Key Required</Trans>}
          description={
            <span>
              <Trans>Please configure your Anthropic API key in</Trans>{" "}
              <Link to="/settings/ai" onClick={() => setOpen(false)}>
                <Trans>Settings → AI</Trans>
              </Link>{" "}
              <Trans>to use the AI assistant.</Trans>
            </span>
          }
          type="warning"
          showIcon
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <RobotOutlined />
            <Trans>AI Assistant</Trans>
          </Space>
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={() => {
              setMessages([]);
              setAttachments([]);
              setError(null);
            }}
            title={t`Clear chat`}
          />
        </div>
      }
      placement="right"
      onClose={() => setOpen(false)}
      open={open}
      width={500}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <div>
          {attachments.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <Space size={4} wrap>
                {attachments.map((file, index) => (
                  <Tag key={index} icon={<FileTextOutlined />} closable onClose={() => removeAttachment(index)}>
                    {file.name}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Space.Compact style={{ width: "100%" }}>
              <Button icon={<PaperClipOutlined />} onClick={handleFileSelect} disabled={isLoading} />
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t`Ask me about invoicing, clients, or general questions...`}
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                htmlType="submit"
                loading={isLoading}
                disabled={!input.trim() || isLoading}
              />
            </Space.Compact>
          </form>
        </div>
      }
    >
      {error && (
        <Alert
          message={<Trans>Error</Trans>}
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <List
        dataSource={messages}
        renderItem={(message) => (
          <List.Item
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "12px 0",
            }}
          >
            <Space align="start" style={{ width: "100%" }}>
              {message.role === "assistant" ? (
                <RobotOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              ) : (
                <UserOutlined style={{ fontSize: 20 }} />
              )}
              <div style={{ flex: 1 }}>
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  {message.role === "assistant" ? <Trans>AI Assistant</Trans> : <Trans>You</Trans>}
                </Text>
                <Text style={{ whiteSpace: "pre-wrap" }}>{message.content}</Text>
                {message.attachments && message.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Space size={4} wrap>
                      {message.attachments.map((file, index) => (
                        <Tag key={index} icon={<FileTextOutlined />} color="blue">
                          {file.name}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </div>
            </Space>
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
              <RobotOutlined style={{ fontSize: 48, marginBottom: 16, display: "block" }} />
              <Text type="secondary">
                <Trans>Start a conversation with your AI assistant</Trans>
              </Text>
            </div>
          ),
        }}
      />

      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Spin />
        </div>
      )}
    </Drawer>
  );
}
