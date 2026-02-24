"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MousePointer2, Hand } from "lucide-react";

interface FocusButtonProps {
  hasFocus: boolean;
  onRequest: () => Promise<boolean>;
  onRelease: () => Promise<void>;
}

export function FocusButton({
  hasFocus,
  onRequest,
  onRelease,
}: FocusButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (hasFocus) {
        await onRelease();
      } else {
        await onRequest();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        hasFocus
          ? "text-muted-foreground hover:bg-muted hover:text-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90 animate-[focus-pulse_2s_ease-in-out_infinite]"
      )}
    >
      {hasFocus ? (
        <Hand className="h-3.5 w-3.5" />
      ) : (
        <MousePointer2 className="h-3.5 w-3.5" />
      )}
      {loading ? "..." : hasFocus ? "Release" : "Take Control"}
    </button>
  );
}
