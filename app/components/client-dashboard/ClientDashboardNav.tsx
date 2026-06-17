"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle, Gear } from "phosphor-react";
import ClientNotificationsDropdown from "./ClientNotificationsDropdown";
import ClientChatInbox from "./ClientChatInbox";
import { useClientProfile } from "./ClientProfileProvider";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import type { ClientDashboardView, ClientNotification } from "./types";

type ClientDashboardNavProps = {
  activeView: ClientDashboardView;
  onNavigate: (view: ClientDashboardView) => void;
  onStartProject: () => void;
};

const NAV_ITEMS: { id: ClientDashboardView | "start" | "messages" | "settings"; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "start", label: "Start Project" },
  { id: "projects", label: "My Projects" },
  { id: "architects", label: "Architects" },
  { id: "proposals", label: "Contractor Proposals" },
  { id: "vault", label: "Vault" },
  { id: "updates", label: "Updates" },
  { id: "documents", label: "Documents" },
  { id: "messages", label: "Messages" },
  { id: "settings", label: "Settings" },
];

export default function ClientDashboardNav({
  activeView,
  onNavigate,
  onStartProject,
}: ClientDashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    profile,
    notifications,
    dismissNotification,
    markNotificationRead,
    openProfileSettings,
  } = useClientProfile();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleNotificationAction = (notification: ClientNotification) => {
    markNotificationRead(notification.id);
    setNotificationsOpen(false);

    if (notification.dashboardView) {
      onNavigate(notification.dashboardView);
      return;
    }

    if (notification.actionType === "open_settings") {
      openProfileSettings(notification.settingsTab ?? "profile");
      return;
    }

    if (notification.actionType && notification.actionJobId) {
      const params = new URLSearchParams({
        job: notification.actionJobId,
        action: notification.actionType,
      });
      router.push(`/client/dashboard?${params.toString()}`);
      return;
    }

    if (notification.actionHref?.startsWith("#")) {
      if (pathname === "/client/dashboard") {
        document
          .querySelector(notification.actionHref)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      router.push(`/client/dashboard${notification.actionHref}`);
    }
  };

  const handleNavClick = (
    id: ClientDashboardView | "start" | "messages" | "settings",
  ) => {
    if (id === "start") {
      onStartProject();
      return;
    }
    if (id === "messages") {
      setChatOpen(true);
      setNotificationsOpen(false);
      return;
    }
    if (id === "settings") {
      openProfileSettings("profile");
      return;
    }
    onNavigate(id);
  };

  return (
    <header className="adash-nav cdash-nav">
      <div className="adash-nav-inner cdash-nav-inner">
        <Link
          href="/client/dashboard"
          className="adash-nav-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <div className="adash-nav-brand-logo">
            <VaultIcon size={50} variant="green" />
            <span className="adash-nav-logo">Amana</span>
          </div>
          <span className="adash-nav-portal">Client Portal</span>
        </Link>

        <nav className="cdash-nav-links" aria-label="Client dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.id !== "start" &&
              item.id !== "messages" &&
              item.id !== "settings" &&
              activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`adash-nav-link cdash-nav-link${isActive ? " adash-nav-link--active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="adash-nav-actions">
          <ClientChatInbox
            open={chatOpen}
            onToggle={() => {
              setChatOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            onClose={() => setChatOpen(false)}
          />
          <ClientNotificationsDropdown
            notifications={notifications}
            open={notificationsOpen}
            onToggle={() => {
              setNotificationsOpen((prev) => !prev);
              setChatOpen(false);
            }}
            onClose={() => setNotificationsOpen(false)}
            onDismiss={dismissNotification}
            onAction={handleNotificationAction}
          />
          <button
            type="button"
            className="adash-profile-chip"
            onClick={() => openProfileSettings("profile")}
          >
            <UserCircle size={22} weight="bold" />
            <span>{profile.fullName.split(" ")[0]}</span>
          </button>
          <button
            type="button"
            className="adash-icon-btn"
            aria-label="Settings"
            onClick={() => openProfileSettings("profile")}
          >
            <Gear size={20} weight="bold" />
          </button>
        </div>
      </div>
    </header>
  );
}
