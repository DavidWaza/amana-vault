"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Buildings,
  UsersThree,
  CreditCard,
  CheckCircle,
  Bell,
  Folder,
  ChatsCircle,
  Star,
  MagnifyingGlass,
  Gear,
  Plus,
  Headset,
  CaretRight,
  CaretLeft,
  SignOut,
} from "phosphor-react";
import { useClientProfile } from "./ClientProfileProvider";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import { getClientUnreadChatCount } from "./chat-utils";
import type { ClientDashboardView, ClientNotification } from "./types";

export type PortalNavId =
  | ClientDashboardView
  | "messages"
  | "settings"
  | "professionals";

type NavItem = {
  id: PortalNavId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

type ClientPortalSidebarProps = {
  activeView: ClientDashboardView;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (view: ClientDashboardView) => void;
  onStartProject: () => void;
  onOpenMessages: () => void;
  onOpenSettings: () => void;
  approvalCount: number;
  onNotificationAction?: (n: ClientNotification) => void;
};

export default function ClientPortalSidebar({
  activeView,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onStartProject,
  onOpenMessages,
  onOpenSettings,
  approvalCount,
}: ClientPortalSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { jobs, jobMessages, chatReadAt, logout } = useClientProfile();

  const unreadMessages = getClientUnreadChatCount(jobs, jobMessages, chatReadAt);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <SquaresFour size={20} weight="bold" /> },
    { id: "projects", label: "My Projects", icon: <Buildings size={20} weight="bold" /> },
    { id: "team", label: "Build Team", icon: <UsersThree size={20} weight="bold" /> },
    { id: "vault", label: "Vault", icon: <VaultIcon size={20} /> },
    { id: "payments", label: "Payments", icon: <CreditCard size={20} weight="bold" /> },
    {
      id: "approvals",
      label: "Approvals",
      icon: <CheckCircle size={20} weight="bold" />,
      badge: approvalCount > 0 ? approvalCount : undefined,
    },
    { id: "updates", label: "Updates", icon: <Bell size={20} weight="bold" /> },
    { id: "documents", label: "Documents", icon: <Folder size={20} weight="bold" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <ChatsCircle size={20} weight="bold" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    { id: "reviews", label: "Reviews", icon: <Star size={20} weight="bold" /> },
    {
      id: "professionals",
      label: "Find Professionals",
      icon: <MagnifyingGlass size={20} weight="bold" />,
    },
    { id: "settings", label: "Settings", icon: <Gear size={20} weight="bold" /> },
  ];

  const resolveActive = (id: PortalNavId): boolean => {
    if (id === "professionals") return activeView === "architects" || activeView === "proposals";
    if (id === "payments") return activeView === "payments" || activeView === "vault";
    if (id === "messages" || id === "settings") return false;
    return activeView === id;
  };

  const handleClick = (id: PortalNavId) => {
    if (id === "messages") {
      onOpenMessages();
      return;
    }
    if (id === "settings") {
      onOpenSettings();
      return;
    }
    if (id === "professionals") {
      onNavigate("architects");
      return;
    }
    if (id === "payments") {
      onNavigate("vault");
      return;
    }
    onNavigate(id);
  };

  return (
    <aside
      className={`cp-sidebar${collapsed ? " cp-sidebar--collapsed" : ""}`}
      aria-label="Client portal navigation"
      aria-expanded={!collapsed}
    >
      <div className="cp-sidebar-top">
        <Link
          href="/client/dashboard"
          className="cp-sidebar-brand"
          onClick={() => onNavigate("dashboard")}
          title="Amana Client Portal"
        >
          <VaultIcon size={collapsed ? 32 : 36} variant="green" />
          <div className="cp-sidebar-brand-text">
            <strong>Amana</strong>
            <span>CLIENT PORTAL</span>
          </div>
        </Link>
        <button
          type="button"
          className="cp-sidebar-toggle"
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

      <nav className="cp-sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`cp-sidebar-link${resolveActive(item.id) ? " cp-sidebar-link--active" : ""}`}
            onClick={() => handleClick(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span className="cp-sidebar-link-icon">
              {item.icon}
              {collapsed && item.badge != null && item.badge > 0 && (
                <span className="cp-sidebar-badge-dot" aria-hidden />
              )}
            </span>
            <span className="cp-sidebar-link-label">{item.label}</span>
            {!collapsed && item.badge != null && item.badge > 0 && (
              <span className="cp-sidebar-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="cp-sidebar-footer">
        <button
          type="button"
          className="cp-sidebar-cta"
          onClick={onStartProject}
          title={collapsed ? "Start New Build" : undefined}
        >
          <Plus size={18} weight="bold" />
          <span className="cp-sidebar-cta-label">Start New Build</span>
        </button>

        <div className="cp-sidebar-help">
          <Headset size={22} weight="bold" />
          <div className="cp-sidebar-help-text">
            <strong>Need Help?</strong>
            <button
              type="button"
              className="cp-sidebar-help-link"
              onClick={() => {
                const first = jobs[0];
                if (first) {
                  if (pathname === "/client/dashboard") {
                    onOpenMessages();
                  } else {
                    router.push("/client/dashboard");
                  }
                }
              }}
            >
              Contact Support
              <CaretRight size={12} weight="bold" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="cp-sidebar-signout"
          onClick={logout}
          title={collapsed ? "Sign out" : undefined}
        >
          <SignOut size={18} weight="bold" />
          <span className="cp-sidebar-signout-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
