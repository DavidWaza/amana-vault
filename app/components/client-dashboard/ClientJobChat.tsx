"use client";

import { useEffect, useRef, useState } from "react";
import { X, PaperPlaneTilt, ChatsCircle } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import type { ClientJob, JobChatMessage } from "./types";

const CHAT_ANIMATION_MS = 360;

type ClientJobChatProps = {
  job: ClientJob | null;
  messages: JobChatMessage[];
  clientName: string;
  open: boolean;
  onClose: () => void;
  onSend: (jobId: string, text: string) => void;
};

function formatChatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClientJobChat({
  job,
  messages,
  clientName,
  open,
  onClose,
  onSend,
}: ClientJobChatProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), CHAT_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mounted, onClose]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages]);

  const [handleSubmit, sendLoading] = useAsyncAction((event: React.FormEvent) => {
    event.preventDefault();
    if (!job) return;
    const text = draft.trim();
    if (!text) return;
    onSend(job.id, text);
    setDraft("");
  });

  if (!mounted || !job) return null;

  return (
    <div
      className={`adash-chat-overlay${visible ? " adash-chat-overlay--open" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`adash-chat-panel${visible ? " adash-chat-panel--open" : ""}`}
        role="dialog"
        aria-labelledby="client-job-chat-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-chat-header">
          <div>
            <p className="adash-eyebrow">
              <ChatsCircle size={14} weight="bold" />
              Contract chat
            </p>
            <h2 id="client-job-chat-title">{job.artisanName}</h2>
            <p className="adash-chat-subtitle">{job.title}</p>
          </div>
          <button type="button" className="adash-modal-close" onClick={onClose} aria-label="Close chat">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="adash-chat-messages" ref={listRef}>
          {messages.length === 0 ? (
            <p className="adash-chat-empty">
              Message {job.artisanName.split(" ")[0]} about this job. All messages
              are tied to your protected agreement.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`adash-chat-bubble adash-chat-bubble--${message.sender}`}
              >
                <span className="adash-chat-bubble-meta">
                  {message.sender === "client"
                    ? clientName.split(" ")[0]
                    : job.artisanName.split(" ")[0]}
                  {" · "}
                  {formatChatTime(message.createdAt)}
                </span>
                <p>{message.text}</p>
              </div>
            ))
          )}
        </div>

        <form className="adash-chat-compose" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="adash-input adash-textarea adash-chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${job.artisanName.split(" ")[0]}…`}
            rows={2}
          />
          <Button
            type="submit"
            className="adash-btn adash-btn--primary adash-chat-send"
            disabled={!draft.trim()}
            loading={sendLoading}
            loadingLabel="Sending…"
          >
            <PaperPlaneTilt size={16} weight="bold" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
