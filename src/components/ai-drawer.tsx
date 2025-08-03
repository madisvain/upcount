import { Drawer, Space, Input, Button, List, Typography, Alert, Spin } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useAtom, useAtomValue } from "jotai";
import { aiDrawerAtom } from "src/atoms/generic";
import { anthropicApiKeyAtom } from "src/atoms/ai";
import { useState } from "react";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { Link } from "react-router";
import { fetch } from "@tauri-apps/plugin-http";
import omit from "lodash/omit";

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AiDrawer() {
  const [open, setOpen] = useAtom(aiDrawerAtom);
  const apiKey = useAtomValue(anthropicApiKeyAtom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        messages: [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: userMessage.content },
        ],
        system:
          "You are a helpful AI assistant for an invoicing application. Help users with their questions about invoicing, clients, projects, and general business matters.",
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
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
        <Space>
          <RobotOutlined />
          <Trans>AI Assistant</Trans>
        </Space>
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
        <form onSubmit={handleSubmit}>
          <Space.Compact style={{ width: "100%" }}>
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
