"use client";

import { useEffect, useRef } from "react";
import { Bell, X } from "phosphor-react";
import type { ClientNotification } from "./types";

type ClientNotificationsDropdownProps = {
  notifications: ClientNotification[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDismiss: (id: string) => void;
  onAction: (notification: ClientNotification) => void;
};

function formatNotificationTime(iso: string): string {
  const diffHours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export default function ClientNotificationsDropdown({
  notifications,
  open,
  onToggle,
  onClose,
  onDismiss,
  onAction,
}: ClientNotificationsDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((item) => !item.read).length;

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

  return (
    <div className="adash-notifications" ref={panelRef}>
      <button
        type="button"
        className={`adash-icon-btn${open ? " adash-icon-btn--active" : ""}`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={onToggle}
      >
        <Bell size={20} weight="bold" />
        {unreadCount > 0 && <span className="adash-icon-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="adash-notifications-panel" role="menu">
          <div className="adash-notifications-header">
            <strong>Notifications</strong>
            <span>{unreadCount} unread</span>
          </div>
          {notifications.length === 0 ? (
            <p className="adash-notifications-empty">You&apos;re all caught up.</p>
          ) : (
            <ul className="adash-notifications-list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={`adash-notification-item adash-notification-item--${item.type}${item.read ? "" : " adash-notification-item--unread"}`}
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <span>{formatNotificationTime(item.createdAt)}</span>
                  </div>
                  <div className="adash-notification-actions">
                    {item.actionLabel && (
                      <button
                        type="button"
                        className="adash-notification-action"
                        onClick={() => onAction(item)}
                      >
                        {item.actionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      className="adash-icon-btn"
                      aria-label="Dismiss notification"
                      onClick={() => onDismiss(item.id)}
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
