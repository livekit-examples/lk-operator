"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useStartAudio,
} from "@livekit/components-react";
import { BrowserView } from "@/components/BrowserView";
import { ChatBox } from "@/components/ChatBox";
import { ParticipantBar } from "@/components/ParticipantBar";

function RoomInner() {
  const params = useSearchParams();
  const url = params.get("url");
  const token = params.get("token");

  if (!url || !token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Missing url or token query parameters.
        </p>
      </div>
    );
  }

  return (
    <LiveKitRoom serverUrl={url} token={token} connect={true}>
      <RoomContent />
    </LiveKitRoom>
  );
}

function RoomContent() {
  const room = useRoomContext();

  const handleClick = useCallback(() => {
    room.startAudio();
  }, [room]);

  const { mergedProps, canPlayAudio } = useStartAudio({ room, props: {} });

  return (
    <div onClick={handleClick}>
      <div className="dotted-bg flex h-screen w-screen flex-col items-center px-6 pt-6 pb-4">
        {/* Unified window */}
        <div className="flex min-h-0 w-full max-w-[1400px] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/30">
          {/* Title bar — macOS style */}
          <div className="relative flex items-center justify-center border-b border-border px-4 py-2.5">
            <div className="absolute left-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <div className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-muted-foreground">Cloud Browser</span>
          </div>

          {/* Content — chat + browser side by side */}
          <div className="flex min-h-0 flex-1">
            <div className="w-[380px] shrink-0">
              <ChatBox />
            </div>
            <div className="relative min-w-0 flex-1 border-l border-border">
              <BrowserView />
            </div>
          </div>
        </div>

        {/* Footer — outside the window */}
        <div className="flex w-full max-w-[1400px] items-center justify-center py-3">
          <a
            href="https://github.com/livekit/agents"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Built with LiveKit Agents
          </a>
        </div>

        <ParticipantBar />
      </div>
      <RoomAudioRenderer />
      {!canPlayAudio && (
        <button
          {...mergedProps}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
        >
          Click to enable audio
        </button>
      )}
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <RoomInner />
    </Suspense>
  );
}
