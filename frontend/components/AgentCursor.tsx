"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import type { AgentCursorState } from "@/lib/useAgentCursor";
import { browserToScreenCoords } from "@/lib/videoCoords";

interface AgentCursorProps {
  cursor: AgentCursorState;
  videoEl: HTMLVideoElement | null;
}

export function AgentCursor({ cursor, videoEl }: AgentCursorProps) {
  const springConfig = { damping: 28, stiffness: 180, mass: 0.5 };
  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);
  const [clicking, setClicking] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!cursor.visible || !videoEl) return;

    const coords = browserToScreenCoords(cursor.x, cursor.y, videoEl);
    if (coords) {
      x.set(coords.x);
      y.set(coords.y);
    }

    // Trigger click ripple
    if (cursor.action.includes("click")) {
      setClicking(true);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => setClicking(false), 500);
    }
  }, [cursor.x, cursor.y, cursor.visible, cursor.action, videoEl, x, y]);

  if (!cursor.visible) return null;

  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-50"
      style={{ x, y }}
    >
      {/* Cursor arrow */}
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        fill="none"
        className="drop-shadow-md"
        style={{ marginLeft: -2, marginTop: -2 }}
      >
        <path
          d="M4 2L18 12L11 13.5L8 21L4 2Z"
          fill="#da7756"
          stroke="#1a1815"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Click ripple */}
      {clicking && (
        <motion.div
          className="absolute left-0 top-0 rounded-full border-2 border-primary"
          initial={{ width: 0, height: 0, opacity: 0.8, x: 0, y: 0 }}
          animate={{ width: 36, height: 36, opacity: 0, x: -18, y: -18 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      {/* Label */}
      <span className="ml-4 mt-0.5 inline-block whitespace-nowrap rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">
        Claude
      </span>
    </motion.div>
  );
}
