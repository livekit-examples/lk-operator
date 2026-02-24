import { useEffect, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { DataPublishOptions } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";

export function useBrowserInput(
  trackRef: TrackReferenceOrPlaceholder | undefined,
  hasFocus: boolean
) {
  const room = useRoomContext();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFocus || !overlayRef.current) return;
    const el = overlayRef.current;
    el.focus();

    const getVideoEl = () =>
      el.parentElement?.querySelector("video") as HTMLVideoElement | null;

    // Account for object-fit: contain letterboxing
    const toBrowserCoords = (e: MouseEvent) => {
      const videoEl = getVideoEl();
      if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight)
        return { x: 0, y: 0 };

      const rect = videoEl.getBoundingClientRect();
      const videoAspect = videoEl.videoWidth / videoEl.videoHeight;
      const elemAspect = rect.width / rect.height;

      let renderW: number, renderH: number, offsetX: number, offsetY: number;
      if (videoAspect > elemAspect) {
        // Video wider than container — letterbox top/bottom
        renderW = rect.width;
        renderH = rect.width / videoAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      } else {
        // Video taller than container — letterbox left/right
        renderH = rect.height;
        renderW = rect.height * videoAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      }

      const relX = e.clientX - rect.left - offsetX;
      const relY = e.clientY - rect.top - offsetY;

      return {
        x: Math.round((relX / renderW) * videoEl.videoWidth),
        y: Math.round((relY / renderH) * videoEl.videoHeight),
      };
    };

    const sendOpts: DataPublishOptions = { reliable: false, topic: "browser-input" };

    const send = (events: object[]) => {
      const data = new TextEncoder().encode(JSON.stringify(events));
      room.localParticipant.publishData(data, sendOpts);
    };

    // Batch mouse moves to ~60fps
    let pendingMoves: object[] = [];
    let moveTimer: ReturnType<typeof setTimeout> | null = null;

    const flushMoves = () => {
      if (pendingMoves.length > 0) {
        send(pendingMoves);
        pendingMoves = [];
      }
      moveTimer = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = toBrowserCoords(e);
      pendingMoves.push({ type: "mousemove", x, y });
      if (!moveTimer) moveTimer = setTimeout(flushMoves, 16);
    };

    const onMouseDown = (e: MouseEvent) => {
      el.focus();
      flushMoves();
      const { x, y } = toBrowserCoords(e);
      send([{ type: "mousedown", x, y, button: e.button }]);
      e.preventDefault();
    };

    // Listen on document so we catch releases outside the overlay
    const onMouseUp = (e: MouseEvent) => {
      const { x, y } = toBrowserCoords(e);
      send([{ type: "mouseup", x, y, button: e.button }]);
    };

    const onWheel = (e: WheelEvent) => {
      const { x, y } = toBrowserCoords(e);
      send([{
        type: "wheel",
        x,
        y,
        deltaX: Math.round(-e.deltaX),
        deltaY: Math.round(-e.deltaY),
      }]);
      e.preventDefault();
    };

    const modifiers = (e: KeyboardEvent) => {
      let m = 0;
      if (e.shiftKey) m |= 1 << 1;
      if (e.ctrlKey) m |= 1 << 2;
      if (e.altKey) m |= 1 << 3;
      if (e.metaKey) m |= 1 << 7;
      return m;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      send([{ type: "keydown", keyCode: e.keyCode, modifiers: modifiers(e) }]);
      if (e.key.length === 1) {
        send([{
          type: "char",
          keyCode: e.key.charCodeAt(0),
          charCode: e.key.charCodeAt(0),
          modifiers: modifiers(e),
        }]);
      }
      e.preventDefault();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      send([{ type: "keyup", keyCode: e.keyCode, modifiers: modifiers(e) }]);
      e.preventDefault();
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);
    el.addEventListener("contextmenu", onContextMenu);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("contextmenu", onContextMenu);
      if (moveTimer) clearTimeout(moveTimer);
    };
  }, [hasFocus, room, trackRef]);

  return overlayRef;
}
