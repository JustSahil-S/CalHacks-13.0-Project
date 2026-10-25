import { OPERATOR_SYSTEM, OPERATOR_TOOLS } from "./spec";

export type ClaudeContent =
  | { type: "text"; text: string }
  | {
      type: "tool_use";
      id: string;
      name: string;
      input: Record<string, unknown>;
    };

export type ClaudeMessage = {
  role: "user" | "assistant";
  content: string | ClaudeContent[] | ToolResult[];
};

export type ToolResult = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

export async function assistantTurn(messages: ClaudeMessage[]) {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system: OPERATOR_SYSTEM,
      tools: OPERATOR_TOOLS,
      messages,
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text.slice(0, 400) || `Assistant ${response.status}`);
  return JSON.parse(text) as {
    content: ClaudeContent[];
    stop_reason?: string;
  };
}
