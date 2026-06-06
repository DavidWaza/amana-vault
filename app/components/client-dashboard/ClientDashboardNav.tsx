"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle } from "phosphor-react";
import ClientNotificationsDropdown from "./ClientNotificationsDropdown";
import ClientChatInbox from "./ClientChatInbox";
import { useClientProfile } from "./ClientProfileProvider";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import type { ClientNotification } from "./types";

export default function ClientDashboardNav() {
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

  return (
    <header className="adash-nav">
      <div className="adash-nav-inner">
        <Link href="/client/dashboard" className="adash-nav-brand">
          <div className="adash-nav-brand-logo">
            <VaultIcon size={50} variant="green" />
            <span className="adash-nav-logo">Amana</span>
          </div>
          <span className="adash-nav-portal">Client Portal</span>
        </Link>

        <nav className="adash-nav-links" aria-label="Client dashboard navigation">
          <Link href="/client/dashboard#artisans" className="adash-nav-link">
            Artisans
          </Link>
          <Link
            href="/client/dashboard#jobs"
            className={`adash-nav-link${pathname.startsWith("/client/dashboard") ? " adash-nav-link--active" : ""}`}
          >
            Jobs
          </Link>
          <Link href="/client/dashboard#escrow" className="adash-nav-link">
            Vault
          </Link>
          <Link href="/client/dashboard#reviews" className="adash-nav-link">
            Reviews
          </Link>
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
        </div>
      </div>
    </header>
  );
}
