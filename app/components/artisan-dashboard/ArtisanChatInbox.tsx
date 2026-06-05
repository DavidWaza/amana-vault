"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatsCircle, User } from "phosphor-react";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import { buildChatThreads, getUnreadChatCount } from "./chat-utils";

type ArtisanChatInboxProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

function formatChatPreviewTime(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export default function ArtisanChatInbox({
  open,
  onToggle,
  onClose,
}: ArtisanChatInboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { jobs, jobMessages, chatReadAt, openChat } = useArtisanProfile();
  const panelRef = useRef<HTMLDivElement>(null);

  const threads = useMemo(
    () => buildChatThreads(jobs, jobMessages, chatReadAt),
    [jobs, jobMessages, chatReadAt],
  );

  const unreadCount = getUnreadChatCount(threads);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
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
    if (!pathname.startsWith("/artisan/dashboard")) {
      router.push("/artisan/dashboard");
    }
  };

  return (
    <div className="adash-chat-inbox" ref={panelRef}>
      <button
        type="button"
        className={`adash-icon-btn${open ? " adash-icon-btn--active" : ""}`}
        aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
      >
        <ChatsCircle size={20} weight="bold" />
        {unreadCount > 0 && (
          <span className="adash-icon-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="adash-chat-inbox-panel" role="menu">
          <div className="adash-chat-inbox-header">
            <strong>Messages</strong>
            <span>{unreadCount} unread</span>
          </div>

          {threads.length === 0 ? (
            <p className="adash-chat-inbox-empty">
              No conversations yet. Send an agreement or invoice to start chatting
              with a client.
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
                        {thread.clientName}
                        {thread.unreadCount > 0 && (
                          <span className="adash-chat-inbox-unread">
                            {thread.unreadCount}
                          </span>
                        )}
                      </strong>
                      <span className="adash-chat-inbox-job">{thread.jobTitle}</span>
                      {thread.lastMessage && (
                        <span className="adash-chat-inbox-preview">
                          {thread.lastMessage}
                        </span>
                      )}
                    </span>
                    {thread.lastMessageAt && (
                      <span className="adash-chat-inbox-time">
                        {formatChatPreviewTime(thread.lastMessageAt)}
                      </span>
                    )}
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
