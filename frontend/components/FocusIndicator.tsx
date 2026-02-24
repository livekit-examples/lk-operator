"use client";

import { useRoomContext } from "@livekit/components-react";
import { AnimatePresence, motion } from "motion/react";

interface FocusIndicatorProps {
  focusHolder: string | null;
}

export function FocusIndicator({ focusHolder }: FocusIndicatorProps) {
  const room = useRoomContext();
  const isLocal = focusHolder === room.localParticipant.identity;

  const isAgent = !isLocal;

  if (!focusHolder) return null;

  const label = isLocal
    ? "You have control"
    : isAgent
      ? "Claude is browsing"
      : `${focusHolder} has control`;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={focusHolder}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-1.5 text-[11px]"
      >
        <span
          className={`inline-block size-1.5 rounded-full ${
            isLocal ? "bg-primary" : "bg-primary animate-pulse"
          }`}
        />
        <span className="text-muted-foreground">{label}</span>
      </motion.span>
    </AnimatePresence>
  );
}
