"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CaretDown, DownloadSimple, Plus } from "phosphor-react";
import { useArchitectProfile } from "./ArchitectProfileProvider";
import { getGreeting, getInitials } from "./portal-utils";
import { formatRelativeTime } from "./utils";

type ArchitectPortalHeaderProps = {
  onNewProject: () => void;
  onDownloadReport: () => void;
};

export default function ArchitectPortalHeader({
  onNewProject,
  onDownloadReport,
}: ArchitectPortalHeaderProps) {
  const { profile, notifications, markNotificationRead, openProfileSettings } =
    useArchitectProfile();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) setNotificationsOpen(false);
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  return (
    <header className="ap-header">
      <div className="ap-header-top">
        <span className="ap-header-portal-tag">ARCHITECT PORTAL</span>
        <div className="ap-header-actions">
          <div className="ap-header-icon-wrap" ref={notifRef}>
            <button
              type="button"
              className="ap-header-icon-btn"
              onClick={() => setNotificationsOpen((p) => !p)}
              aria-label="Notifications"
            >
              <Bell size={20} weight="bold" />
              {unreadCount > 0 && <span className="ap-header-badge">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="ap-dropdown ap-dropdown--notifications">
                {notifications.length === 0 ? (
                  <p className="ap-empty-inline">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className={`ap-notif-item${n.read ? "" : " ap-notif-item--unread"}`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <strong>{n.title}</strong>
                      <span>{n.body}</span>
                      <time>{formatRelativeTime(n.createdAt)}</time>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="ap-header-profile" ref={profileRef}>
            <button
              type="button"
              className="ap-header-profile-btn"
              onClick={() => setProfileOpen((p) => !p)}
            >
              <span className="ap-avatar">{getInitials(profile.studioName)}</span>
              <span className="ap-header-profile-label">
                <strong>{profile.studioName.split(" ")[0]}</strong>
                <small>Architect Plan</small>
              </span>
              <CaretDown size={14} weight="bold" />
            </button>
            {profileOpen && (
              <div className="ap-dropdown">
                <button type="button" onClick={openProfileSettings}>
                  Profile Settings
                </button>
                <button type="button" onClick={openProfileSettings}>
                  Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ap-header-main">
        <div className="ap-header-greeting">
          <h1>Good {getGreeting()}, {profile.studioName}! 👋</h1>
          <p>Manage your designs, proposals, and vault-protected earnings.</p>
        </div>
        <div className="ap-header-cta">
          <button type="button" className="ap-btn-outline" onClick={onDownloadReport}>
            <DownloadSimple size={18} weight="bold" />
            Download Report
          </button>
          <button type="button" className="ap-btn-primary" onClick={onNewProject}>
            <Plus size={18} weight="bold" />
            New Project
          </button>
        </div>
      </div>
    </header>
  );
}
