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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { aiDrawerAtom } from "src/atoms/generic";
import { anthropicApiKeyAtom, aiInvoiceDataAtom } from "src/atoms/ai";
import { useState, ReactNode } from "react";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, stepCountIs, ToolInvocation } from "ai";
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
import { AI_ASSISTANT_SYSTEM_PROMPT } from "src/utils/ai";

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
  toolInvocations?: ToolInvocation[];
}

export default function AiDrawer() {
  const [open, setOpen] = useAtom(aiDrawerAtom);
  const apiKey = useAtomValue(anthropicApiKeyAtom);
  const setAiInvoiceData = useSetAtom(aiInvoiceDataAtom);
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
      description: "Create a new invoice",
      inputSchema: z.object({
        clientId: z.string().describe("The ID of the client for this invoice"),
        clientName: z.string().describe("The name of the client"),
        currency: z.string().describe("Currency code (e.g., USD, EUR)"),
        hourlyRate: z.number().optional().describe("Hourly rate if applicable"),
        period: z.string().optional().describe("Billing period"),
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

          // Calculate totals
          let subTotal = 0;
          let taxTotal = 0;
          
          args.lineItems.forEach((item: any) => {
            const itemTotal = item.quantity * item.unitPrice;
            subTotal += itemTotal;
            
            const taxRateId = item.taxRateId || defaultTaxRate?.id;
            if (taxRateId) {
              const taxRate = taxRates.find((t: any) => t.id === taxRateId);
              if (taxRate && taxRate.rate) {
                const itemTax = (itemTotal * taxRate.rate) / 100;
                taxTotal += itemTax;
              }
            }
          });

          const total = subTotal + taxTotal;

          // Navigate to the new invoice form with pre-filled data
          // Store the form data in sessionStorage to be used by the invoice form
          const formData = {
            clientId: args.clientId,
            currency: args.currency || organization?.currency || "USD",
            date: args.date ? dayjs(args.date) : dayjs(),
            dueDate: args.dueDate ? dayjs(args.dueDate) : organization?.due_days ? dayjs().add(organization.due_days, "day") : null,
            lineItems: args.lineItems.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRateId: item.taxRateId || defaultTaxRate?.id,
            })),
            customerNotes: args.customerNotes || organization?.customerNotes || "",
          };

          // Store in atom to be picked up by the invoice form
          setAiInvoiceData(formData);
          
          // Navigate to new invoice form
          navigate('/invoices/new');
          setOpen(false);

          return {
            success: true,
            message: "Opening new invoice form with your data. Please review and click Save to create the invoice.",
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

      const result = streamText({
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
        stopWhen: stepCountIs(5),
        system: AI_ASSISTANT_SYSTEM_PROMPT,
      });

      // Create assistant message to track streaming
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        toolInvocations: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Collect the text content
      let fullText = "";
      for await (const text of result.textStream) {
        fullText += text;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "assistant") {
            lastMessage.content = fullText;
          }
          return newMessages;
        });
      }

      // Get the final result with tool invocations
      const finalResult = await result;
      console.log("Final result:", finalResult);
      
      // Check for tool results in steps
      if (finalResult.steps && finalResult.steps.length > 0) {
        const toolInvocations: any[] = [];
        
        for (const step of finalResult.steps) {
          if (step.toolCalls && step.toolCalls.length > 0) {
            for (let i = 0; i < step.toolCalls.length; i++) {
              const toolCall = step.toolCalls[i];
              const toolResult = step.toolResults?.[i];
              
              if (toolCall.toolName === "create_invoice") {
                toolInvocations.push({
                  state: "result",
                  toolCallId: toolCall.toolCallId || `tool-${i}`,
                  toolName: toolCall.toolName,
                  args: toolCall.args,
                  result: toolResult?.result || toolResult,
                });
              }
            }
          }
        }
        
        if (toolInvocations.length > 0) {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.toolInvocations = toolInvocations;
            }
            return newMessages;
          });
        }
      }
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
