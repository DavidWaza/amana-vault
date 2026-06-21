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

  const navLink =
    "px-[0.9rem] py-[0.55rem] rounded-full text-[0.9rem] font-bold text-muted transition-[background,color] duration-300";
  const navPro =
    "inline-flex items-center gap-[0.4rem] px-4 py-[0.55rem] rounded-full border border-solid text-[0.82rem] font-black whitespace-nowrap transition-[transform,box-shadow] duration-300";

  return (
    <header className="adash-nav">
      <div className="adash-nav-inner">
        <Link href="/artisan/dashboard" className="flex flex-col gap-[0.1rem] shrink-0">
        <div className="flex items-center">
        <VaultIcon size={50} variant="green"/>
          <span className="text-[1.2rem] font-black tracking-[-0.04em] text-green">Amana</span>
        </div>
        </Link>

        <nav className="flex gap-[0.35rem] flex-1 max-[768px]:hidden" aria-label="Dashboard navigation">
          <Link
            href="/artisan/dashboard#jobs"
            className={`${navLink}${page === "dashboard" ? " text-green bg-soft" : ""}`}
          >
            Jobs
          </Link>
          <Link href="/artisan/dashboard#wallet" className={navLink}>
            Vault
          </Link>
          <Link href="/artisan/dashboard#reviews" className={navLink}>
            Reviews
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/artisan/pro"
            className={`${navPro} ${
              page === "pro"
                ? "bg-[linear-gradient(135deg,var(--green),var(--green2))] border-green2 text-white"
                : "bg-[linear-gradient(135deg,#fef3c7,#fde68a)] border-[rgba(244,163,0,0.35)] text-[#92400e]"
            }`}
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
            className="inline-flex items-center gap-[0.4rem] pl-[0.55rem] pr-[0.85rem] py-[0.45rem] rounded-full border border-solid border-line bg-white text-green text-[0.88rem] font-extrabold cursor-pointer"
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
