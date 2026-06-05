"use client";

import { useEffect, useRef } from "react";
import { Bell, X } from "phosphor-react";
import type { ArtisanNotification } from "./types";

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
    <div className="adash-notifications" ref={panelRef}>
      <button
        type="button"
        className={`adash-icon-btn${open ? " adash-icon-btn--active" : ""}`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
      >
        <Bell size={20} weight="bold" />
        {unreadCount > 0 && (
          <span className="adash-icon-badge">{unreadCount}</span>
        )}
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
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`adash-notification-item adash-notification-item--${notification.type}${notification.read ? " adash-notification-item--read" : ""}`}
                >
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span>{formatNotificationTime(notification.createdAt)}</span>
                  </div>
                  <div className="adash-notification-actions">
                    {notification.actionLabel && (
                      <button
                        type="button"
                        className="adash-notification-action"
                        onClick={() => onAction(notification)}
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      className="adash-notification-dismiss"
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
