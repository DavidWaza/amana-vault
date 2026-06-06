"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatsCircle, User } from "phosphor-react";
import { useClientProfile } from "./ClientProfileProvider";
import { buildClientChatThreads, getClientUnreadChatCount } from "./chat-utils";

type ClientChatInboxProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

function formatChatPreviewTime(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export default function ClientChatInbox({ open, onToggle, onClose }: ClientChatInboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { jobs, jobMessages, chatReadAt, openChat } = useClientProfile();
  const panelRef = useRef<HTMLDivElement>(null);

  const threads = useMemo(
    () => buildClientChatThreads(jobs, jobMessages, chatReadAt),
    [jobs, jobMessages, chatReadAt],
  );
  const unreadCount = getClientUnreadChatCount(jobs, jobMessages, chatReadAt);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleSelect = (jobId: string) => {
    openChat(jobId);
    onClose();
    if (!pathname.startsWith("/client/dashboard")) {
      router.push("/client/dashboard");
    }
  };

  return (
    <div className="adash-chat-inbox" ref={panelRef}>
      <button
        type="button"
        className={`adash-icon-btn${open ? " adash-icon-btn--active" : ""}`}
        aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={onToggle}
      >
        <ChatsCircle size={20} weight="bold" />
        {unreadCount > 0 && <span className="adash-icon-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="adash-chat-inbox-panel" role="menu">
          <div className="adash-chat-inbox-header">
            <strong>Messages</strong>
            <span>{unreadCount} unread</span>
          </div>
          {threads.length === 0 ? (
            <p className="adash-chat-inbox-empty">
              No conversations yet. Fund a job or message an artisan to start chatting.
            </p>
          ) : (
            <ul className="adash-chat-inbox-list">
              {threads.map((thread) => (
                <li key={thread.jobId}>
                  <button
                    type="button"
                    className={`adash-chat-inbox-item${thread.unreadCount > 0 ? " adash-chat-inbox-item--unread" : ""}`}
                    onClick={() => handleSelect(thread.jobId)}
                  >
                    <span className="adash-chat-inbox-avatar">
                      <User size={18} weight="bold" />
                    </span>
                    <span className="adash-chat-inbox-body">
                      <strong>
                        {thread.artisanName}
                        {thread.unreadCount > 0 && (
                          <span className="adash-chat-inbox-unread">{thread.unreadCount}</span>
                        )}
                      </strong>
                      <span className="adash-chat-inbox-job">{thread.jobTitle}</span>
                      {thread.lastMessage && (
                        <span className="adash-chat-inbox-preview">{thread.lastMessage}</span>
                      )}
                    </span>
                    <span className="adash-chat-inbox-time">
                      {formatChatPreviewTime(thread.lastMessageAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
