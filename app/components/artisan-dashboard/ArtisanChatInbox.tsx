"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatsCircle, User } from "phosphor-react";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import { buildChatThreads, getUnreadChatCount } from "./chat-utils";
import {
  adashIconBadge,
  adashIconBtn,
  adashIconBtnActive,
  adashIconBtnInactive,
} from "./ui";

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
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className={`${adashIconBtn} ${open ? adashIconBtnActive : adashIconBtnInactive}`}
        aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
      >
        <ChatsCircle size={20} weight="bold" />
        {unreadCount > 0 && (
          <span className={adashIconBadge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(24rem,calc(100vw-2rem))] border border-solid border-line rounded-2xl bg-white shadow-[0_16px_40px_rgba(15,118,110,0.14)] overflow-hidden"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-[0.85rem] border-b border-solid border-line bg-soft">
            <strong>Messages</strong>
            <span>{unreadCount} unread</span>
          </div>

          {threads.length === 0 ? (
            <p className="m-0 px-4 py-5 text-muted text-[0.88rem] leading-[1.55]">
              No conversations yet. Send an agreement or invoice to start chatting
              with a client.
            </p>
          ) : (
            <ul className="list-none m-0 p-0 max-h-88 overflow-y-auto">
              {threads.map((thread) => (
                <li key={thread.jobId}>
                  <button
                    type="button"
                    className={`w-full flex items-start gap-3 px-4 py-[0.85rem] border-0 border-b border-solid border-line text-left cursor-pointer transition-[background] duration-300 ${
                      thread.unreadCount > 0 ? "bg-[rgba(0,107,50,0.06)]" : "bg-white"
                    }`}
                    onClick={() => handleSelect(thread.jobId)}
                  >
                    <span className="grid place-items-center w-[2.35rem] h-[2.35rem] rounded-xl bg-[linear-gradient(135deg,var(--green),var(--green2))] text-white shrink-0">
                      <User size={18} weight="bold" />
                    </span>
                    <span className="flex-1 min-w-0 grid gap-[0.12rem]">
                      <strong className="inline-flex items-center gap-[0.4rem] text-green text-[0.88rem]">
                        {thread.clientName}
                        {thread.unreadCount > 0 && (
                          <span className="inline-grid place-items-center min-w-[1.1rem] h-[1.1rem] px-[0.3rem] rounded-full bg-green2 text-white text-[0.65rem] font-extrabold">
                            {thread.unreadCount}
                          </span>
                        )}
                      </strong>
                      <span className="text-[0.78rem] font-bold text-muted">{thread.jobTitle}</span>
                      {thread.lastMessage && (
                        <span className="text-[0.8rem] text-text whitespace-nowrap overflow-hidden text-ellipsis">
                          {thread.lastMessage}
                        </span>
                      )}
                    </span>
                    {thread.lastMessageAt && (
                      <span className="shrink-0 text-[0.68rem] font-bold text-muted">
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
