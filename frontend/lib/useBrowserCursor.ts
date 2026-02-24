import { useState } from "react";
import { useDataChannel } from "@livekit/components-react";

export function useBrowserCursor() {
  const [cursor, setCursor] = useState("default");

  useDataChannel("cursor_changed", (msg) => {
    try {
      const { cursor: c } = JSON.parse(new TextDecoder().decode(msg.payload));
      if (typeof c === "string") setCursor(c);
    } catch {
      // ignore malformed messages
    }
  });

  return cursor;
}
