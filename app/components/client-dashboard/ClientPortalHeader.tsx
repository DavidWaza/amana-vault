"use client";

import { useState, useRef, useEffect } from "react";
import { CaretDown, UserCircle } from "phosphor-react";
import ClientNotificationsDropdown from "./ClientNotificationsDropdown";
import ClientChatInbox from "./ClientChatInbox";
import { useClientProfile } from "./ClientProfileProvider";
import { getGreeting, getInitials } from "./portal-utils";
import type { ClientNotification, ClientProject } from "./types";

type ClientPortalHeaderProps = {
  projects: ClientProject[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onNotificationAction: (notification: ClientNotification) => void;
};

export default function ClientPortalHeader({
  projects,
  selectedProjectId,
  onSelectProject,
  onNotificationAction,
}: ClientPortalHeaderProps) {
  const {
    profile,
    notifications,
    dismissNotification,
    markNotificationRead,
    openProfileSettings,
  } = useClientProfile();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const projectRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const firstName = profile.fullName.split(" ")[0];

  const selectedLabel =
    selectedProjectId === null
      ? "All Projects"
      : (projects.find((p) => p.id === selectedProjectId)?.title ?? "All Projects");

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (!projectRef.current?.contains(e.target as Node)) setProjectMenuOpen(false);
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const handleNotificationAction = (notification: ClientNotification) => {
    markNotificationRead(notification.id);
    setNotificationsOpen(false);
    onNotificationAction(notification);
  };

  return (
    <header className="cp-header">
      <div className="cp-header-greeting">
        <h1>Good {getGreeting()}, {firstName}</h1>
        <p>Your home in Nigeria is moving forward.</p>
      </div>

      <div className="cp-header-actions">
        <div className="cp-header-icon-wrap">
          <ClientChatInbox
            open={chatOpen}
            onToggle={() => {
              setChatOpen((p) => !p);
              setNotificationsOpen(false);
            }}
            onClose={() => setChatOpen(false)}
          />
        </div>

        <div className="cp-header-icon-wrap cp-notifications-wrap">
          <ClientNotificationsDropdown
            notifications={notifications}
            open={notificationsOpen}
            onToggle={() => {
              setNotificationsOpen((p) => !p);
              setChatOpen(false);
            }}
            onClose={() => setNotificationsOpen(false)}
            onDismiss={dismissNotification}
            onAction={handleNotificationAction}
          />
        </div>

        <div className="cp-header-profile" ref={profileRef}>
          <button
            type="button"
            className="cp-header-profile-btn"
            onClick={() => setProfileOpen((p) => !p)}
          >
            <span className="cp-avatar">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} />
              ) : (
                getInitials(profile.fullName)
              )}
            </span>
            <span>{firstName}</span>
            <CaretDown size={14} weight="bold" />
          </button>
          {profileOpen && (
            <div className="cp-dropdown">
              <button type="button" onClick={() => openProfileSettings("profile")}>
                <UserCircle size={18} weight="bold" />
                Profile Settings
              </button>
              <button type="button" onClick={() => openProfileSettings("payment")}>
                Payment Methods
              </button>
            </div>
          )}
        </div>

        <div className="cp-header-project-filter" ref={projectRef}>
          <button
            type="button"
            className="cp-project-filter-btn"
            onClick={() => setProjectMenuOpen((p) => !p)}
          >
            {selectedLabel}
            <CaretDown size={14} weight="bold" />
          </button>
          {projectMenuOpen && (
            <div className="cp-dropdown cp-dropdown--projects">
              <button type="button" onClick={() => onSelectProject(null)}>
                All Projects
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                >
                  {project.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
