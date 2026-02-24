import { useState, useCallback } from "react";
import { useRoomContext, useDataChannel, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export function useBrowserFocus() {
  const room = useRoomContext();
  const [focusHolder, setFocusHolder] = useState<string | null>(null);
  const localIdentity = room.localParticipant.identity;
  const hasFocus = focusHolder === localIdentity;

  // Find the agent identity from whoever is publishing a screen share
  const tracks = useTracks([Track.Source.ScreenShare]);
  const agentIdentity = tracks[0]?.participant?.identity;

  useDataChannel("browser-focus", (msg) => {
    try {
      const { identity } = JSON.parse(new TextDecoder().decode(msg.payload));
      setFocusHolder(identity);
    } catch {
      // ignore malformed messages
    }
  });

  const requestFocus = useCallback(async (): Promise<boolean> => {
    if (!agentIdentity) return false;
    try {
      const resp = await room.localParticipant.performRpc({
        destinationIdentity: agentIdentity,
        method: "browser/request-focus",
        payload: "",
      });
      const { granted } = JSON.parse(resp);
      return granted as boolean;
    } catch {
      return false;
    }
  }, [room, agentIdentity]);

  const releaseFocus = useCallback(async () => {
    if (!agentIdentity) return;
    setFocusHolder(null);
    room.localParticipant.performRpc({
      destinationIdentity: agentIdentity,
      method: "browser/release-focus",
      payload: "",
    }).catch(() => {});
  }, [room, agentIdentity]);

  return { hasFocus, focusHolder, requestFocus, releaseFocus };
}
