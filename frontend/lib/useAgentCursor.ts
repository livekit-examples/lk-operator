import { useState } from "react";
import { useDataChannel } from "@livekit/components-react";

export interface AgentCursorState {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  action: string;
  visible: boolean;
}

export function useAgentCursor() {
  const [cursor, setCursor] = useState<AgentCursorState>({
    x: 0,
    y: 0,
    action: "",
    visible: false,
  });

  useDataChannel("browser-agent-cursor", (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload));
      if (data.visible === false) {
        setCursor((prev) => ({ ...prev, visible: false }));
        return;
      }
      const w = data.width || 1280;
      const h = data.height || 720;
      setCursor({
        x: data.x / w,
        y: data.y / h,
        action: data.action || "",
        visible: true,
      });
    } catch {
      // ignore malformed
    }
  });

  return cursor;
}
