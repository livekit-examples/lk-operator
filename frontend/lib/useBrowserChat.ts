import { useState, useCallback, useRef, useEffect } from "react";
import { useRoomContext, useDataChannel } from "@livekit/components-react";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: number;
}

export type AgentStatus = "idle" | "thinking" | "acting";

export function useBrowserChat() {
  const room = useRoomContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const nextId = useRef(0);

  useDataChannel("browser-agent-chat", (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload));
      if (data.text && data.sender === "agent") {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${nextId.current++}`,
            text: data.text,
            sender: "agent",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      // ignore malformed messages
    }
  });

  useDataChannel("browser-agent-status", (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload));
      if (data.status) {
        setAgentStatus(data.status as AgentStatus);
      }
    } catch {
      // ignore
    }
  });

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      // Add to local messages
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${nextId.current++}`,
          text,
          sender: "user",
          timestamp: Date.now(),
        },
      ]);

      // Send to agent via data channel
      const payload = new TextEncoder().encode(
        JSON.stringify({ text, sender: "user" })
      );
      room.localParticipant.publishData(payload, {
        reliable: true,
        topic: "browser-agent-chat",
      });
    },
    [room]
  );

  return { messages, agentStatus, sendMessage };
}
