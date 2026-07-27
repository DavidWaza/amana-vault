"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CaretDown,
  ChatsCircle,
  DownloadSimple,
  List,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Star,
} from "phosphor-react";
import { useArchitectProfile } from "./ArchitectProfileProvider";
import { getGreeting, getInitials } from "./portal-utils";
import { formatRelativeTime } from "./utils";
import type { ArchitectDashboardView, ArchitectNotification } from "./types";

export type AddProjectMode = "invite_client" | "off_platform" | "import";

export type SearchHit = {
  id: string;
  label: string;
  sublabel: string;
  view: ArchitectDashboardView;
  projectId?: string;
};

type ArchitectPortalHeaderProps = {
  title: string;
  subtitle: string;
  showGreeting: boolean;
  unreadMessages: number;
  onAddClientProject: (mode: AddProjectMode) => void;
  onDownloadReport: () => void;
  onOpenMessages: () => void;
  onNotificationAction: (notification: ArchitectNotification) => void;
  onSearchSelect: (hit: SearchHit) => void;
  searchHits: (query: string) => SearchHit[];
  onOpenMobileNav: () => void;
};

export default function ArchitectPortalHeader({
  title,
  subtitle,
  showGreeting,
  unreadMessages,
  onAddClientProject,
  onDownloadReport,
  onOpenMessages,
  onNotificationAction,
  onSearchSelect,
  searchHits,
  onOpenMobileNav,
}: ArchitectPortalHeaderProps) {
  const { profile, notifications, markNotificationRead, markAllNotificationsRead, openProfileSettings } =
    useArchitectProfile();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hits = useMemo(() => (query.trim().length > 1 ? searchHits(query) : []), [query, searchHits]);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notifRef.current?.contains(target)) setNotificationsOpen(false);
      if (!profileRef.current?.contains(target)) setProfileOpen(false);
      if (!addRef.current?.contains(target)) setAddOpen(false);
      if (!searchRef.current?.contains(target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNotificationsOpen(false);
      setProfileOpen(false);
      setAddOpen(false);
      setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNotification = (notification: ArchitectNotification) => {
    markNotificationRead(notification.id);
    setNotificationsOpen(false);
    onNotificationAction(notification);
  };

  return (
    <header className="ap-header">
      <div className="ap-header-top">
        <button
          type="button"
          className="ap-header-menu-btn"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <List size={20} weight="bold" />
        </button>

        <div className="ap-header-search" ref={searchRef}>
          <MagnifyingGlass size={16} weight="bold" />
          <input
            type="search"
            value={query}
            placeholder="Search projects, clients, opportunities…"
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            aria-label="Search the architect portal"
          />
          {searchOpen && query.trim().length > 1 && (
            <div className="ap-dropdown ap-dropdown--search">
              {hits.length === 0 ? (
                <p className="ap-empty-inline">No matches for “{query.trim()}”.</p>
              ) : (
                hits.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    className="ap-search-hit"
                    onClick={() => {
                      onSearchSelect(hit);
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    <strong>{hit.label}</strong>
                    <span>{hit.sublabel}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="ap-header-actions">
          {profile.subscriptionPlan === "pro" && (
            <span className="ap-header-plan" title="Subscription status">
              <Star size={13} weight="fill" />
              Architect Pro
            </span>
          )}

          <button
            type="button"
            className="ap-header-icon-btn"
            onClick={onOpenMessages}
            aria-label="Messages"
          >
            <ChatsCircle size={20} weight="bold" />
            {unreadMessages > 0 && <span className="ap-header-badge">{unreadMessages}</span>}
          </button>

          <div className="ap-header-icon-wrap" ref={notifRef}>
            <button
              type="button"
              className="ap-header-icon-btn"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={20} weight="bold" />
              {unreadCount > 0 && <span className="ap-header-badge">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="ap-dropdown ap-dropdown--notifications">
                <div className="ap-dropdown-head">
                  <strong>Notifications</strong>
                  {unreadCount > 0 && (
                    <button type="button" onClick={markAllNotificationsRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="ap-empty-inline">You have no notifications.</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`ap-notif-item${notification.read ? "" : " ap-notif-item--unread"}`}
                      onClick={() => handleNotification(notification)}
                    >
                      <strong>{notification.title}</strong>
                      <span>{notification.body}</span>
                      <time>{formatRelativeTime(notification.createdAt)}</time>
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
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
            >
              <span className="ap-avatar">{getInitials(profile.studioName)}</span>
              <span className="ap-header-profile-label">
                <strong>
                  {profile.studioName}
                  {profile.verificationStatus === "verified" && (
                    <ShieldCheck size={13} weight="fill" className="ap-verified-icon" />
                  )}
                </strong>
                <small>
                  {profile.subscriptionPlan === "pro" ? "Architect Pro" : "Architect Free"}
                </small>
              </span>
              <CaretDown size={14} weight="bold" />
            </button>
            {profileOpen && (
              <div className="ap-dropdown">
                <button type="button" onClick={openProfileSettings}>
                  Studio settings
                </button>
                <button type="button" onClick={openProfileSettings}>
                  Subscription
                </button>
                <button type="button" onClick={onDownloadReport}>
                  <DownloadSimple size={15} weight="bold" /> Download workload report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ap-header-main">
        <div className="ap-header-greeting">
          <h1>
            {showGreeting ? `Good ${getGreeting()}, ${profile.contactName.split(" ")[0]}` : title}
          </h1>
          <p>{showGreeting ? subtitle : subtitle}</p>
        </div>

        <div className="ap-header-cta" ref={addRef}>
          <button
            type="button"
            className="ap-btn-primary"
            onClick={() => setAddOpen((prev) => !prev)}
            aria-expanded={addOpen}
          >
            <Plus size={18} weight="bold" />
            Add Client Project
          </button>
          {addOpen && (
            <div className="ap-dropdown ap-dropdown--add">
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  onAddClientProject("invite_client");
                }}
              >
                <strong>Invite a client</strong>
                <span>Send an invitation so the client joins on Amana.</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  onAddClientProject("off_platform");
                }}
              >
                <strong>Add an existing off-platform client</strong>
                <span>Record a client you already work with outside Amana.</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  onAddClientProject("import");
                }}
              >
                <strong>Import an existing design project</strong>
                <span>Bring a project already underway into the portal.</span>
              </button>
              <p className="ap-dropdown-note">
                Marketplace projects normally arrive from a client’s Build Your Dream Home
                submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
