"use client";

import { useEffect, useRef } from "react";
import { Bell, X } from "phosphor-react";
import type { ArtisanNotification } from "./types";
import {
  adashIconBadge,
  adashIconBtn,
  adashIconBtnActive,
  adashIconBtnInactive,
} from "./ui";

type ArtisanNotificationsDropdownProps = {
  notifications: ArtisanNotification[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDismiss: (id: string) => void;
  onAction: (notification: ArtisanNotification) => void;
};

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export default function ArtisanNotificationsDropdown({
  notifications,
  open,
  onToggle,
  onClose,
  onDismiss,
  onAction,
}: ArtisanNotificationsDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((item) => !item.read).length;

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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className={`${adashIconBtn} ${open ? adashIconBtnActive : adashIconBtnInactive}`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
      >
        <Bell size={20} weight="bold" />
        {unreadCount > 0 && (
          <span className={adashIconBadge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(22rem,calc(100vw-2rem))] border border-solid border-line rounded-2xl bg-white shadow-[0_16px_40px_rgba(15,118,110,0.14)] overflow-hidden"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-[0.85rem] border-b border-solid border-line bg-soft">
            <strong>Notifications</strong>
            <span>{unreadCount} unread</span>
          </div>

          {notifications.length === 0 ? (
            <p className="m-0 px-4 py-5 text-muted text-[0.88rem]">You&apos;re all caught up.</p>
          ) : (
            <ul className="list-none m-0 p-0 max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`flex items-start justify-between gap-3 px-4 py-[0.9rem] border-b border-solid border-line${notification.read ? " opacity-[0.72]" : ""}`}
                >
                  <div>
                    <strong className="block text-green text-[0.86rem]">{notification.title}</strong>
                    <p className="mt-[0.2rem] mb-[0.35rem] text-muted text-[0.82rem] leading-[1.45]">{notification.message}</p>
                    <span className="text-muted text-[0.72rem] font-bold">{formatNotificationTime(notification.createdAt)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-[0.35rem] shrink-0">
                    {notification.actionLabel && (
                      <button
                        type="button"
                        className="border-0 bg-transparent text-green2 text-[0.78rem] font-extrabold cursor-pointer whitespace-nowrap"
                        onClick={() => onAction(notification)}
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      className="grid place-items-center w-6 h-6 border border-solid border-line rounded-lg bg-white text-muted cursor-pointer"
                      onClick={() => onDismiss(notification.id)}
                      aria-label="Dismiss notification"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
