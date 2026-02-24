"use client";

import { useState, useEffect, useCallback, type RefCallback } from "react";
import { useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { useBrowserFocus } from "@/lib/useBrowserFocus";
import { useBrowserInput } from "@/lib/useBrowserInput";
import { useBrowserCursor } from "@/lib/useBrowserCursor";
import { useBrowserNavigation } from "@/lib/useBrowserNavigation";
import { useAgentCursor } from "@/lib/useAgentCursor";
import { FocusButton } from "./FocusButton";
import { FocusIndicator } from "./FocusIndicator";
import { AgentCursor } from "./AgentCursor";
import { ClaudeMascot } from "./ClaudeMascot";

export function BrowserView() {
  const tracks = useTracks([Track.Source.ScreenShare]);
  const browserTrack = tracks[0];
  const { hasFocus, focusHolder, requestFocus, releaseFocus } =
    useBrowserFocus();
  const overlayRef = useBrowserInput(browserTrack, hasFocus);
  const cursor = useBrowserCursor();
  const { url, navigate, goBack, goForward } = useBrowserNavigation();
  const agentCursor = useAgentCursor();
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  const [urlInput, setUrlInput] = useState(url);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setUrlInput(url);
  }, [url, isEditing]);

  const videoContainerRef: RefCallback<HTMLDivElement> = useCallback((node) => {
    if (!node) return;
    setViewportEl(node);
    const video = node.querySelector("video");
    if (video) setVideoEl(video);
    else {
      const observer = new MutationObserver(() => {
        const v = node.querySelector("video");
        if (v) {
          setVideoEl(v);
          observer.disconnect();
        }
      });
      observer.observe(node, { childList: true, subtree: true });
    }
  }, []);

  const submitUrl = useCallback(() => {
    if (!hasFocus || !urlInput.trim()) return;
    let target = urlInput.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = "https://" + target;
    }
    setIsEditing(false);
    navigate(target);
  }, [hasFocus, urlInput, navigate]);

  return (
    <div className="flex h-full flex-col">
      {/* Nav bar — h-11 matches chat header */}
      <div className="flex h-11 items-center gap-2 border-b border-border bg-card px-3">
        <div className="flex items-center gap-0.5">
          <button
            onClick={goBack}
            disabled={!hasFocus}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goForward}
            disabled={!hasFocus}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Go forward"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(url)}
            disabled={!hasFocus}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            title="Reload"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitUrl();
            }
          }}
          disabled={!hasFocus}
          placeholder="Enter URL..."
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        />

        <div className="flex items-center gap-2">
          <FocusIndicator focusHolder={focusHolder} />
          <FocusButton
            hasFocus={hasFocus}
            onRequest={requestFocus}
            onRelease={releaseFocus}
          />
        </div>
      </div>

      {/* Browser viewport */}
      <div ref={videoContainerRef} className="relative min-h-0 flex-1 overflow-hidden bg-background">
        {browserTrack && <ClaudeMascot videoEl={videoEl} viewportEl={viewportEl} />}
        {browserTrack ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg border border-border/50 shadow-lg shadow-black/20">
            <VideoTrack
              trackRef={browserTrack}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <div
              ref={overlayRef}
              tabIndex={hasFocus ? 0 : -1}
              style={hasFocus ? { cursor } : undefined}
              className={`absolute inset-0 outline-none ${hasFocus ? "" : "pointer-events-none"}`}
            />
            <AgentCursor cursor={agentCursor} videoEl={videoEl} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
            <span className="font-serif text-sm italic text-muted-foreground">
              Connecting to browser...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
