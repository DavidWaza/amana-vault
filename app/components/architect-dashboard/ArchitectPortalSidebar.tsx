"use client";

import Link from "next/link";
import {
  SquaresFour,
  Buildings,
  EnvelopeSimple,
  FileText,
  PenNib,
  Folder,
  ChatsCircle,
  Star,
  Gear,
  CaretRight,
  CaretLeft,
  ShieldCheck,
  MapPin,
} from "phosphor-react";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import { useArchitectProfile } from "./ArchitectProfileProvider";
import { getInitials } from "./portal-utils";
import type { ArchitectDashboardView } from "./types";

type NavItem = {
  id: ArchitectDashboardView | "messages" | "settings";
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

type ArchitectPortalSidebarProps = {
  activeView: ArchitectDashboardView;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (view: ArchitectDashboardView) => void;
  onOpenSettings: () => void;
  onOpenMessages: () => void;
  designRequestCount: number;
  proposalCount: number;
  activeDesignCount: number;
  unreadMessages: number;
};

export default function ArchitectPortalSidebar({
  activeView,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onOpenSettings,
  onOpenMessages,
  designRequestCount,
  proposalCount,
  activeDesignCount,
  unreadMessages,
}: ArchitectPortalSidebarProps) {
  const { profile } = useArchitectProfile();

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <SquaresFour size={20} weight="bold" /> },
    { id: "projects", label: "Projects", icon: <Buildings size={20} weight="bold" /> },
    {
      id: "design-requests",
      label: "Design Requests",
      icon: <EnvelopeSimple size={20} weight="bold" />,
      badge: designRequestCount > 0 ? designRequestCount : undefined,
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: <FileText size={20} weight="bold" />,
      badge: proposalCount > 0 ? proposalCount : undefined,
    },
    {
      id: "active-designs",
      label: "Active Designs",
      icon: <PenNib size={20} weight="bold" />,
      badge: activeDesignCount > 0 ? activeDesignCount : undefined,
    },
    { id: "vault", label: "Vault", icon: <VaultIcon size={20} variant="white" /> },
    { id: "documents", label: "Documents", icon: <Folder size={20} weight="bold" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <ChatsCircle size={20} weight="bold" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    { id: "reviews", label: "Reviews", icon: <Star size={20} weight="bold" /> },
    { id: "settings", label: "Settings", icon: <Gear size={20} weight="bold" /> },
  ];

  const resolveActive = (id: NavItem["id"]): boolean => {
    if (id === "messages" || id === "settings") return false;
    return activeView === id;
  };

  const handleClick = (id: NavItem["id"]) => {
    if (id === "settings") {
      onOpenSettings();
      return;
    }
    if (id === "messages") {
      onOpenMessages();
      return;
    }
    onNavigate(id);
  };

  return (
    <aside
      className={`ap-sidebar${collapsed ? " ap-sidebar--collapsed" : ""}`}
      aria-label="Architect portal navigation"
      aria-expanded={!collapsed}
    >
      <div className="ap-sidebar-top">
        <Link
          href="/architect/dashboard"
          className="ap-sidebar-brand"
          onClick={() => onNavigate("dashboard")}
          title="Amana Architect Portal"
        >
          <VaultIcon size={collapsed ? 28 : 32} variant="white" />
          {!collapsed && (
            <div className="ap-sidebar-brand-text">
              <strong>Amana Vault</strong>
            </div>
          )}
        </Link>
        <button
          type="button"
          className="ap-sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <CaretRight size={16} weight="bold" />
          ) : (
            <CaretLeft size={16} weight="bold" />
          )}
        </button>
      </div>

      <nav className="ap-sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ap-sidebar-link${resolveActive(item.id) ? " ap-sidebar-link--active" : ""}`}
            onClick={() => handleClick(item.id)}
            title={collapsed ? item.label : undefined}
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
      </nav>

      {!collapsed && profile.subscriptionPlan === "pro" && (
        <div className="ap-sidebar-subscription">
          <div className="ap-sidebar-subscription-head">
            <strong>Architect Pro</strong>
            <span className="ap-sidebar-subscription-badge">Active</span>
          </div>
          {profile.subscriptionRenewal && (
            <p>Renews {new Date(profile.subscriptionRenewal).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</p>
          )}
          <div className="ap-sidebar-subscription-bar">
            <span style={{ width: "72%" }} />
          </div>
        </div>
      )}

      <div className="ap-sidebar-profile">
        <span className="ap-sidebar-avatar">{getInitials(profile.studioName)}</span>
        {!collapsed && (
          <div className="ap-sidebar-profile-text">
            <strong>
              {profile.studioName}
              {profile.verificationStatus === "verified" && (
                <ShieldCheck size={14} weight="fill" className="ap-verified-icon" />
              )}
            </strong>
            <span>Amana Verified Architect</span>
            <span className="ap-sidebar-profile-meta">
              <MapPin size={12} weight="bold" />
              {profile.location}
              {profile.rating != null && ` · ★ ${profile.rating}`}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
