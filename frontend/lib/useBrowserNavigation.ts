import { useState, useCallback } from "react";
import { useRoomContext, useDataChannel, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export function useBrowserNavigation() {
  const room = useRoomContext();
  const [url, setUrl] = useState<string>("");

  const tracks = useTracks([Track.Source.ScreenShare]);
  const agentIdentity = tracks[0]?.participant?.identity;

  useDataChannel("browser-url", (msg) => {
    try {
      const { url } = JSON.parse(new TextDecoder().decode(msg.payload));
      setUrl(url);
    } catch {
      // ignore malformed messages
    }
  });

  const navigate = useCallback(
    async (targetUrl: string) => {
      if (!agentIdentity) return;
      await room.localParticipant.performRpc({
        destinationIdentity: agentIdentity,
        method: "browser/navigate",
        payload: JSON.stringify({ url: targetUrl }),
      });
    },
    [room, agentIdentity]
  );

  const goBack = useCallback(async () => {
    if (!agentIdentity) return;
    await room.localParticipant.performRpc({
      destinationIdentity: agentIdentity,
      method: "browser/go-back",
      payload: "",
    });
  }, [room, agentIdentity]);

  const goForward = useCallback(async () => {
    if (!agentIdentity) return;
    await room.localParticipant.performRpc({
      destinationIdentity: agentIdentity,
      method: "browser/go-forward",
      payload: "",
    });
  }, [room, agentIdentity]);

  return { url, navigate, goBack, goForward };
}
