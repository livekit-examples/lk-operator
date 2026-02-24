"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Key, Eye, EyeOff } from "lucide-react";
import { useRoomContext } from "@livekit/components-react";
import { RemoteParticipant } from "livekit-client";
import { useBrowserChat } from "@/lib/useBrowserChat";
import ReactMarkdown from "react-markdown";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { cn } from "@/lib/utils";

const API_KEY_STORAGE_KEY = "anthropic-api-key";
const MAX_RETRIES = 5;
const RETRY_DELAY = 1500;

export function ChatBox() {
  const { messages, agentStatus, sendMessage } = useBrowserChat();
  const room = useRoomContext();
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load stored key on mount
  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setApiKeySet(true);
    }
  }, []);

  // Send API key to agent via RPC when set
  useEffect(() => {
    if (!apiKeySet || !apiKey) return;

    const sendApiKey = async (participant: RemoteParticipant) => {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await room.localParticipant.performRpc({
            destinationIdentity: participant.identity,
            method: "set-api-key",
            payload: JSON.stringify({ apiKey }),
          });
          return;
        } catch {
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
          }
        }
      }
      console.error("Failed to send API key after retries");
    };

    const participants = Array.from(room.remoteParticipants.values());
    if (participants.length > 0) {
      sendApiKey(participants[0]);
      return;
    }

    const handler = (p: RemoteParticipant) => sendApiKey(p);
    room.on("participantConnected", handler);
    return () => {
      room.off("participantConnected", handler);
    };
  }, [apiKeySet, apiKey, room]);

  const handleSetKey = useCallback(() => {
    if (!apiKey.trim()) return;
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    setApiKeySet(true);
  }, [apiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentStatus]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    inputRef.current?.focus();
  }, [input, sendMessage]);

  return (
    <div className="chat-panel flex h-full flex-col bg-card">
      {/* Header — h-11 matches browser nav bar */}
      <div className="flex h-11 items-center gap-2.5 border-b border-border px-4">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            !apiKeySet
              ? "bg-muted-foreground/30"
              : agentStatus === "idle"
                ? "bg-primary"
                : "bg-primary animate-pulse"
          )}
        />
        <span className="text-sm font-medium">Claude</span>
        <span className="text-xs text-muted-foreground">computer use</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {!apiKeySet ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted">
              <Key className="size-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-serif text-lg italic">Enable AI browsing</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Enter your Anthropic API key to<br />chat with Claude
              </p>
            </div>
            <div className="w-full max-w-[260px] space-y-3">
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSetKey();
                    }
                  }}
                  placeholder="sk-ant-..."
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-3.5 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <button
                onClick={handleSetKey}
                disabled={!apiKey.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enable AI
              </button>
              <p className="text-center text-[10px] text-muted-foreground">
                Stored locally in your browser only.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-serif text-sm italic text-muted-foreground">
              Ask Claude to browse for you...
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) =>
              msg.sender === "user" ? (
                <div
                  key={msg.id}
                  className="ml-auto max-w-[85%] rounded-2xl bg-[#3a3633] px-4 py-2.5 text-[15px] leading-relaxed text-foreground"
                >
                  {msg.text}
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="chat-prose text-[15px] leading-[1.7] text-foreground/90"
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )
            )}
            <ThinkingIndicator status={agentStatus} />
          </>
        )}
      </div>

      {/* Input */}
      {apiKeySet && (
        <div className="p-3">
          <div className="rounded-2xl border border-border bg-background">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Reply..."
              rows={1}
              className="max-h-[120px] min-h-[36px] w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[15px] placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-end px-2.5 pb-2.5">
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
