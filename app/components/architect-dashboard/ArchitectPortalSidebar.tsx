"use client";

import Link from "next/link";
import {
  SquaresFour,
  Compass,
  Buildings,
  FileText,
  Scroll,
  Wallet,
  ChatsCircle,
  ImageSquare,
  UsersThree,
  UserCircle,
  Gear,
  CaretRight,
  CaretLeft,
  ShieldCheck,
  MapPin,
} from "phosphor-react";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import { useArchitectProfile } from "./ArchitectProfileProvider";
import { getInitials } from "./portal-utils";
import { formatShortDate } from "./utils";
import type { ArchitectDashboardView } from "./types";

export type SidebarTarget = ArchitectDashboardView | "settings";

type NavItem = {
  id: SidebarTarget;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export type SidebarBadges = {
  opportunities: number;
  projects: number;
  proposals: number;
  agreements: number;
  payments: number;
  messages: number;
};

type ArchitectPortalSidebarProps = {
  activeView: ArchitectDashboardView;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate: (view: ArchitectDashboardView) => void;
  onOpenSettings: () => void;
  badges: SidebarBadges;
};

export default function ArchitectPortalSidebar({
  activeView,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
  onOpenSettings,
  badges,
}: ArchitectPortalSidebarProps) {
  const { profile } = useArchitectProfile();

  // Grouped exactly as PRD §20: file management lives inside a project, not here.
  const groups: NavGroup[] = [
    {
      id: "work",
      label: "Work",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <SquaresFour size={20} weight="bold" /> },
        {
          id: "opportunities",
          label: "Opportunities",
          icon: <Compass size={20} weight="bold" />,
          badge: badges.opportunities || undefined,
        },
        {
          id: "projects",
          label: "Projects",
          icon: <Buildings size={20} weight="bold" />,
          badge: badges.projects || undefined,
        },
        {
          id: "proposals",
          label: "Proposals",
          icon: <FileText size={20} weight="bold" />,
          badge: badges.proposals || undefined,
        },
      ],
    },
    {
      id: "administration",
      label: "Project Administration",
      items: [
        {
          id: "agreements",
          label: "Agreements",
          icon: <Scroll size={20} weight="bold" />,
          badge: badges.agreements || undefined,
        },
        {
          id: "payments",
          label: "Payments",
          icon: <Wallet size={20} weight="bold" />,
          badge: badges.payments || undefined,
        },
        {
          id: "messages",
          label: "Messages",
          icon: <ChatsCircle size={20} weight="bold" />,
          badge: badges.messages || undefined,
        },
      ],
    },
    {
      id: "business",
      label: "Business",
      items: [
        { id: "portfolio", label: "Portfolio", icon: <ImageSquare size={20} weight="bold" /> },
        { id: "team", label: "Team", icon: <UsersThree size={20} weight="bold" /> },
        { id: "profile", label: "Profile", icon: <UserCircle size={20} weight="bold" /> },
        { id: "settings", label: "Settings", icon: <Gear size={20} weight="bold" /> },
      ],
    },
  ];

  const handleClick = (id: SidebarTarget) => {
    if (id === "settings") {
      onOpenSettings();
      onCloseMobile();
      return;
    }
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div className="ap-sidebar-scrim" role="presentation" onClick={onCloseMobile} />
      )}
      <aside
        className={`ap-sidebar${collapsed ? " ap-sidebar--collapsed" : ""}${
          mobileOpen ? " ap-sidebar--mobile-open" : ""
        }`}
        aria-label="Architect portal navigation"
        data-collapsed={collapsed ? "true" : "false"}
      >
        <div className="ap-sidebar-top">
          <Link
            href="/architect/dashboard"
            className="ap-sidebar-brand"
            onClick={() => handleClick("dashboard")}
            title="Amana Architect Portal"
          >
            <VaultIcon size={collapsed ? 28 : 32} variant="white" />
            {!collapsed && (
              <div className="ap-sidebar-brand-text">
                <strong>Amana Vault</strong>
                <small>Architect</small>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="ap-sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={16} weight="bold" />}
          </button>
        </div>

        <nav className="ap-sidebar-nav">
          {groups.map((group) => (
            <div key={group.id} className="ap-sidebar-group">
              {!collapsed && <p className="ap-sidebar-group-label">{group.label}</p>}
              {collapsed && <span className="ap-sidebar-group-rule" aria-hidden />}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ap-sidebar-link${activeView === item.id ? " ap-sidebar-link--active" : ""}`}
                  onClick={() => handleClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-current={activeView === item.id ? "page" : undefined}
                >
                  <span className="ap-sidebar-link-icon">
                    {item.icon}
                    {collapsed && item.badge != null && item.badge > 0 && (
                      <span className="ap-sidebar-badge-dot" aria-hidden />
                    )}
                  </span>
                  {!collapsed && <span className="ap-sidebar-link-label">{item.label}</span>}
                  {!collapsed && item.badge != null && item.badge > 0 && (
                    <span className="ap-sidebar-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && profile.subscriptionPlan === "pro" && (
          <div className="ap-sidebar-subscription">
            <div className="ap-sidebar-subscription-head">
              <strong>Architect Pro</strong>
              <span className="ap-sidebar-subscription-badge">Active</span>
            </div>
            {profile.subscriptionRenewal && <p>Renews {formatShortDate(profile.subscriptionRenewal)}</p>}
            <div className="ap-sidebar-subscription-bar">
              <span style={{ width: "72%" }} />
            </div>
          </div>
        )}

        <button
          type="button"
          className="ap-sidebar-profile"
          onClick={() => handleClick("profile")}
        >
          <span className="ap-sidebar-avatar">{getInitials(profile.studioName)}</span>
          {!collapsed && (
            <span className="ap-sidebar-profile-text">
              <strong>
                {profile.studioName}
                {profile.verificationStatus === "verified" && (
                  <ShieldCheck size={14} weight="fill" className="ap-verified-icon" />
                )}
              </strong>
              <span>
                {profile.verificationStatus === "verified"
                  ? "Amana Verified Architect"
                  : "Verification pending"}
              </span>
              <span className="ap-sidebar-profile-meta">
                <MapPin size={12} weight="bold" />
                {profile.location}
                {profile.rating != null && ` · ★ ${profile.rating}`}
              </span>
            </span>
          )}
        </button>
      </aside>
    </>
  );
}
