"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Search, ShoppingCart, FileText } from "lucide-react";

const SUGGESTIONS = [
  { icon: Search, text: "Search for the latest AI news" },
  { icon: ShoppingCart, text: "Find the best deal on headphones" },
  { icon: FileText, text: "Summarize a Wikipedia article" },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState("");
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connection-details", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const { serverUrl, participantToken } = await res.json();
      const params = new URLSearchParams({
        url: serverUrl,
        token: participantToken,
      });
      router.push(`/room?${params.toString()}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="dotted-bg flex min-h-screen flex-col items-center justify-center p-4">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl text-foreground">
          Browse the web with AI
        </h1>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          Powered by Claude computer use and
          <a
            href="https://github.com/livekit/agents"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline decoration-muted-foreground/30 underline-offset-2 transition-colors hover:text-foreground"
          >
            LiveKit
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </p>
      </div>

      {/* Input card */}
      <div className="w-full max-w-[560px]">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What would you like to browse?"
            rows={2}
            className="w-full resize-none rounded-t-2xl bg-transparent px-5 pt-5 pb-3 text-[15px] placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span>Cloud Browser</span>
              </div>
            </div>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Let\u2019s go"}
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <span>Try something</span>
          </div>
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => {
                  setTask(s.text);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-card"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                {s.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
