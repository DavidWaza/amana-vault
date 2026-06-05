"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle, Money } from "phosphor-react";
import ArtisanNotificationsDropdown from "./ArtisanNotificationsDropdown";
import ArtisanChatInbox from "./ArtisanChatInbox";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import type { ArtisanNotification } from "./types";
import VaultIcon from "./VaultIcon";

type ArtisanDashboardNavProps = {
  currentPage?: "dashboard" | "pro";
};

export default function ArtisanDashboardNav({
  currentPage,
}: ArtisanDashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    profile,
    notifications,
    dismissNotification,
    markNotificationRead,
    openProfileSettings,
  } = useArtisanProfile();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const page =
    currentPage ?? (pathname.startsWith("/artisan/pro") ? "pro" : "dashboard");

  const handleNotificationAction = (notification: ArtisanNotification) => {
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
      router.push(`/artisan/dashboard?${params.toString()}`);
      return;
    }

    if (notification.actionHref?.startsWith("#")) {
      const target = `/artisan/dashboard${notification.actionHref}`;
      if (pathname === "/artisan/dashboard") {
        document
          .querySelector(notification.actionHref)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      router.push(target);
    }
  };

  const openSettings = () => openProfileSettings("profile");

  return (
    <header className="adash-nav">
      <div className="adash-nav-inner">
        <Link href="/artisan/dashboard" className="adash-nav-brand">
        <div className="adash-nav-brand-logo">
        <VaultIcon size={50} variant="green"/>
          <span className="adash-nav-logo">Amana</span>
        </div>
        </Link>

        <nav className="adash-nav-links" aria-label="Dashboard navigation">
          <Link
            href="/artisan/dashboard#jobs"
            className={`adash-nav-link${page === "dashboard" ? " adash-nav-link--active" : ""}`}
          >
            Jobs
          </Link>
          <Link href="/artisan/dashboard#wallet" className="adash-nav-link">
            Vault
          </Link>
          <Link href="/artisan/dashboard#reviews" className="adash-nav-link">
            Reviews
          </Link>
        </nav>

        <div className="adash-nav-actions">
          <Link
            href="/artisan/pro"
            className={`adash-nav-pro${page === "pro" ? " adash-nav-pro--active" : ""}`}
          >
            <Money size={16} weight="fill" />
            <span>Amana Pro</span>
          </Link>

          <ArtisanChatInbox
            open={chatOpen}
            onToggle={() => {
              setChatOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            onClose={() => setChatOpen(false)}
          />

          <ArtisanNotificationsDropdown
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
            onClick={openSettings}
          >
            <UserCircle size={22} weight="bold" />
            <span>{profile.fullName.split(" ")[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
