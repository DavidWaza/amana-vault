"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  DownloadSimple,
  CheckCircle,
  Warning,
  Info,
  XCircle,
  Gear,
} from "phosphor-react";
import { useContractorProfile } from "./ContractorProfileProvider";
import { getGreeting, getInitials } from "./portal-utils";
import { formatRelativeTime } from "./utils";
import { ctIconBtn, ctIconBtnActive, ctIconBtnInactive, ctIconBadge } from "./ui";
import type { ContractorDashboardView, ContractorNotification } from "./types";

const TYPE_ICON: Record<ContractorNotification["type"], React.ReactNode> = {
  success: <CheckCircle size={18} weight="fill" className="text-green2" />,
  warning: <Warning size={18} weight="fill" className="text-[#b7791f]" />,
  info: <Info size={18} weight="fill" className="text-contractor2" />,
  error: <XCircle size={18} weight="fill" className="text-[#c53030]" />,
};

type ContractorPortalHeaderProps = {
  onDownloadReport: () => void;
  onOpenSettings: () => void;
  onNavigate: (view: ContractorDashboardView) => void;
};

export default function ContractorPortalHeader({
  onDownloadReport,
  onOpenSettings,
  onNavigate,
}: ContractorPortalHeaderProps) {
  const { profile, notifications, markNotificationRead } = useContractorProfile();
  const [notifOpen, setNotifOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  return (
    <header className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="m-0 text-[0.82rem] font-extrabold tracking-[0.14em] uppercase text-contractor2">
          Construction Command Center
        </p>
        <h1 className="m-0 mt-1 text-[clamp(1.4rem,2.5vw,1.85rem)] font-black text-green leading-tight">
          Good {getGreeting()}, {profile.contactName.split(" ")[0]}
        </h1>
        <p className="m-0 mt-0.5 text-[0.9rem] text-muted">
          Here&apos;s what&apos;s moving on your builds today.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onDownloadReport}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-white border border-solid border-line text-green text-[0.85rem] font-extrabold hover:border-contractor2 transition-colors"
        >
          <DownloadSimple size={18} weight="bold" />
          <span className="hidden sm:inline">Report</span>
        </button>

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((p) => !p)}
            aria-label="Notifications"
            className={`${ctIconBtn} ${notifOpen ? ctIconBtnActive : ctIconBtnInactive}`}
          >
            <Bell size={20} weight="bold" />
            {unreadCount > 0 && <span className={ctIconBadge}>{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[340px] max-w-[90vw] rounded-[18px] bg-white border border-solid border-line shadow-brand-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-solid border-line">
                <strong className="text-[0.95rem] text-green">Notifications</strong>
                <span className="text-[0.75rem] font-bold text-muted">{unreadCount} unread</span>
              </div>
              {notifications.length === 0 ? (
                <p className="m-0 px-4 py-6 text-center text-[0.85rem] text-muted">
                  You&apos;re all caught up.
                </p>
              ) : (
                <ul className="m-0 p-0 list-none max-h-[320px] overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="border-b border-solid border-line last:border-0">
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.actionView) {
                            onNavigate(n.actionView);
                            setNotifOpen(false);
                          }
                        }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-contractor-soft ${
                          n.read ? "bg-white" : "bg-contractor-soft/40"
                        }`}
                      >
                        <span className="shrink-0 mt-[2px]">{TYPE_ICON[n.type]}</span>
                        <span className="min-w-0">
                          <strong className="block text-[0.85rem] text-green">{n.title}</strong>
                          <span className="block text-[0.78rem] text-muted leading-[1.4]">{n.body}</span>
                          <span className="flex items-center gap-2 mt-1 text-[0.7rem] font-bold text-contractor2">
                            {n.actionLabel && <span>{n.actionLabel} →</span>}
                            <time className="text-muted font-semibold">{formatRelativeTime(n.createdAt)}</time>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Profile settings"
          className="flex items-center gap-2 pl-1 pr-3 h-10 rounded-full bg-white border border-solid border-line hover:border-contractor2 transition-colors"
        >
          <span className="grid place-items-center w-8 h-8 rounded-full bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white text-[0.75rem] font-black">
            {getInitials(profile.companyName)}
          </span>
          <Gear size={16} weight="bold" className="text-muted" />
        </button>
      </div>
    </header>
  );
}
