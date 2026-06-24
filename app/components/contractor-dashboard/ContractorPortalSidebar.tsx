"use client";

import Link from "next/link";
import {
  SquaresFour,
  Storefront,
  Buildings,
  UsersThree,
  Vault,
  FileText,
  ChatsCircle,
  Star,
  Gear,
  CaretLeft,
  SignOut,
  ShieldCheck,
  MapPin,
  Wrench,
} from "phosphor-react";
import { useContractorProfile } from "./ContractorProfileProvider";
import { getInitials } from "./portal-utils";
import type { ContractorDashboardView } from "./types";

type NavItem = {
  view: ContractorDashboardView;
  label: string;
  icon: React.ReactNode;
  count?: number;
};

type ContractorPortalSidebarProps = {
  activeView: ContractorDashboardView;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (view: ContractorDashboardView) => void;
  onOpenSettings: () => void;
  onFindProjects: () => void;
  marketplaceOpenCount: number;
  activeProjectCount: number;
  teamCount: number;
  pendingMilestoneCount: number;
  unreadUpdates: number;
};

export default function ContractorPortalSidebar({
  activeView,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onOpenSettings,
  onFindProjects,
  marketplaceOpenCount,
  activeProjectCount,
  teamCount,
  pendingMilestoneCount,
  unreadUpdates,
}: ContractorPortalSidebarProps) {
  const { profile } = useContractorProfile();

  const navItems: NavItem[] = [
    { view: "dashboard", label: "Dashboard", icon: <SquaresFour size={20} weight="bold" /> },
    { view: "marketplace", label: "Marketplace", icon: <Storefront size={20} weight="bold" />, count: marketplaceOpenCount },
    { view: "projects", label: "Project Center", icon: <Buildings size={20} weight="bold" />, count: activeProjectCount },
    { view: "team", label: "Build Team", icon: <UsersThree size={20} weight="bold" />, count: teamCount },
    { view: "vault", label: "Vault", icon: <Vault size={20} weight="bold" />, count: pendingMilestoneCount },
    { view: "documents", label: "Documents", icon: <FileText size={20} weight="bold" /> },
    { view: "updates", label: "Updates", icon: <ChatsCircle size={20} weight="bold" />, count: unreadUpdates },
    { view: "reviews", label: "Reviews", icon: <Star size={20} weight="bold" /> },
  ];

  return (
    <aside
      className={`shrink-0 sticky top-0 h-screen flex flex-col bg-white border-r border-solid border-line transition-[width] duration-300 ${
        collapsed ? "w-[76px]" : "w-[264px]"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between gap-2 px-4 h-[68px] border-b border-solid border-line">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white">
            <Wrench size={20} weight="fill" />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight min-w-0">
              <strong className="text-[1.05rem] font-black text-green tracking-[-0.03em] truncate">Amana</strong>
              <span className="text-[0.6rem] font-extrabold tracking-[0.14em] uppercase text-contractor2">
                Contractor
              </span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid place-items-center w-8 h-8 shrink-0 rounded-lg border border-solid border-line bg-white text-muted hover:text-contractor transition-colors"
        >
          <CaretLeft size={16} weight="bold" className={collapsed ? "rotate-180" : ""} />
        </button>
      </div>

      {/* Company card */}
      {!collapsed && (
        <div className="m-3 p-3 rounded-[16px] bg-contractor-soft border border-solid border-contractor-line">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white text-[0.85rem] font-black">
              {getInitials(profile.companyName)}
            </span>
            <div className="min-w-0">
              <strong className="block text-[0.88rem] text-green truncate">{profile.companyName}</strong>
              <span className="flex items-center gap-1 text-[0.72rem] text-muted">
                <MapPin size={12} weight="bold" />
                <span className="truncate">{profile.location}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2.5 text-[0.72rem] font-bold">
            {profile.verificationStatus === "verified" ? (
              <span className="inline-flex items-center gap-1 px-2 py-[0.2rem] rounded-full bg-[rgba(0,107,50,0.1)] text-green2">
                <ShieldCheck size={13} weight="fill" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-[0.2rem] rounded-full bg-[rgba(244,163,0,0.16)] text-[#b7791f]">
                <ShieldCheck size={13} weight="bold" /> {profile.verificationStatus === "pending" ? "In review" : "Unverified"}
              </span>
            )}
            {profile.rating != null && (
              <span className="inline-flex items-center gap-1 text-gold">
                <Star size={13} weight="fill" /> {profile.rating}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 grid gap-1 content-start">
        {navItems.map((item) => {
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 px-3 h-11 rounded-[12px] text-[0.9rem] font-bold transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white shadow-brand-sm"
                  : "text-muted hover:bg-contractor-soft hover:text-contractor"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              {item.count != null && item.count > 0 && (
                <span
                  className={`min-w-[1.3rem] h-[1.3rem] px-1.5 rounded-full text-[0.7rem] font-extrabold grid place-items-center ${
                    collapsed ? "absolute top-1 right-1" : ""
                  } ${active ? "bg-white/25 text-white" : "bg-contractor-soft text-contractor2"}`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Find projects CTA + footer */}
      <div className="px-3 pb-3 grid gap-1 border-t border-solid border-line pt-3">
        {!collapsed && (
          <button
            type="button"
            onClick={onFindProjects}
            className="flex items-center justify-center gap-2 h-11 rounded-[12px] bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white text-[0.88rem] font-extrabold border-0 transition-transform duration-200 hover:-translate-y-px"
          >
            <Storefront size={18} weight="bold" /> Find Projects
          </button>
        )}
        <button
          type="button"
          onClick={onOpenSettings}
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 px-3 h-11 rounded-[12px] text-[0.9rem] font-bold text-muted hover:bg-contractor-soft hover:text-contractor transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Gear size={20} weight="bold" />
          {!collapsed && <span>Settings</span>}
        </button>
        <Link
          href="/"
          title={collapsed ? "Sign out" : undefined}
          className={`flex items-center gap-3 px-3 h-11 rounded-[12px] text-[0.9rem] font-bold text-muted hover:bg-contractor-soft hover:text-contractor transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <SignOut size={20} weight="bold" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}
