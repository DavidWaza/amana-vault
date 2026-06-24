"use client";

import {
  Buildings,
  Vault,
  Receipt,
  ClipboardText,
  MapPin,
  CalendarBlank,
  CheckCircle,
  Circle,
  CircleNotch,
  CaretRight,
  LockSimple,
  UsersThree,
  UploadSimple,
  Warning,
  Info,
} from "phosphor-react";
import { CONSTRUCTION_STAGES, stageIndex } from "./portal-utils";
import { formatNaira, formatRelativeTime, formatDeadline } from "./utils";
import { ctBtn, ctBtnPrimary, ctBtnSecondary, ctBtnSm, ctBadge, BADGE_TONE_CLASS } from "./ui";
import type {
  ContractorDashboardView,
  ContractorProject,
  ContractorUpdate,
  ContractorVault,
} from "./types";

export type HomeAlert = {
  id: string;
  tone: "warning" | "info" | "success";
  text: string;
  actionLabel: string;
  view: ContractorDashboardView;
};

type ContractorDashboardHomeProps = {
  activeProject: ContractorProject | null;
  vault: ContractorVault;
  updates: ContractorUpdate[];
  metrics: {
    activeBuilds: number;
    openBids: number;
    marketplaceOpen: number;
    teamSize: number;
  };
  alerts: HomeAlert[];
  onNavigate: (view: ContractorDashboardView) => void;
  onSubmitMilestone: (projectId: string) => void;
};

const ALERT_ICON = {
  warning: <Warning size={18} weight="fill" className="text-[#b7791f]" />,
  info: <Info size={18} weight="fill" className="text-contractor2" />,
  success: <CheckCircle size={18} weight="fill" className="text-green2" />,
};

function MetricCard({
  icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-brand bg-white border border-solid border-line shadow-brand-sm transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-contractor2"
    >
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-contractor-soft text-contractor2">
        {icon}
      </span>
      <p className="m-0 mt-3 text-[0.74rem] font-extrabold tracking-[0.08em] uppercase text-muted">
        {label}
      </p>
      <strong className="block mt-1 text-[1.45rem] font-black text-green leading-none">{value}</strong>
      {hint && <em className="block mt-1 not-italic text-[0.74rem] font-bold text-contractor2">{hint}</em>}
    </button>
  );
}

export default function ContractorDashboardHome({
  activeProject,
  vault,
  updates,
  metrics,
  alerts,
  onNavigate,
  onSubmitMilestone,
}: ContractorDashboardHomeProps) {
  return (
    <div className="grid gap-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<Buildings size={20} weight="bold" />}
          label="Active Builds"
          value={String(metrics.activeBuilds)}
          onClick={() => onNavigate("projects")}
        />
        <MetricCard
          icon={<Vault size={20} weight="bold" />}
          label="Protected in Vault"
          value={formatNaira(vault.protectedFunds)}
          onClick={() => onNavigate("vault")}
        />
        <MetricCard
          icon={<Receipt size={20} weight="bold" />}
          label="Open Bids"
          value={String(metrics.openBids)}
          hint={metrics.marketplaceOpen > 0 ? `${metrics.marketplaceOpen} projects open` : undefined}
          onClick={() => onNavigate("marketplace")}
        />
        <MetricCard
          icon={<ClipboardText size={20} weight="bold" />}
          label="Pending Release"
          value={formatNaira(vault.pendingMilestoneAmount)}
          onClick={() => onNavigate("vault")}
        />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* Active project card */}
        {activeProject ? (
          <article className="rounded-brand bg-white border border-solid border-line shadow-brand-sm overflow-hidden">
            <div
              className="h-40 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${activeProject.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(7,20,12,0.78))]" />
              <span className={`${ctBadge} ${BADGE_TONE_CLASS.progress} absolute top-3 left-3 bg-white/90`}>
                In Progress
              </span>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h2 className="m-0 text-[1.2rem] font-black leading-tight">{activeProject.title}</h2>
                <p className="m-0 mt-0.5 flex items-center gap-3 text-[0.8rem] text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} weight="bold" /> {activeProject.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarBlank size={13} weight="bold" />
                    {activeProject.deadline ? formatDeadline(activeProject.deadline) : "On track"}
                  </span>
                </p>
              </div>
            </div>

            <div className="p-5 grid gap-4">
              <div className="flex items-center justify-between gap-3 text-[0.82rem]">
                <span className="font-bold text-muted">
                  Client: <span className="text-green">{activeProject.clientName}</span>
                </span>
                <span className="font-black text-green">{formatNaira(activeProject.contractValue)}</span>
              </div>

              {/* Progress */}
              <div>
                <div className="h-2 rounded-full bg-contractor-soft overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,var(--contractor2),var(--contractor3))]"
                    style={{ width: `${activeProject.progress}%` }}
                  />
                </div>
                <p className="m-0 mt-1.5 text-[0.78rem] font-bold text-muted">
                  {activeProject.progress}% complete
                </p>
              </div>

              {/* Stage stepper (PRD §7) */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {CONSTRUCTION_STAGES.map((s, i) => {
                  const current = stageIndex(activeProject.currentStage);
                  const done = i < current;
                  const isCurrent = i === current;
                  return (
                    <div key={s.stage} className="flex items-center gap-1 shrink-0">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[0.7rem] font-extrabold ${
                          done
                            ? "bg-[rgba(0,107,50,0.1)] text-green2"
                            : isCurrent
                              ? "bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white"
                              : "bg-[#f4f6f5] text-muted"
                        }`}
                      >
                        {done ? (
                          <CheckCircle size={13} weight="fill" />
                        ) : isCurrent ? (
                          <CircleNotch size={13} weight="bold" />
                        ) : (
                          <Circle size={13} />
                        )}
                        {s.label}
                      </div>
                      {i < CONSTRUCTION_STAGES.length - 1 && (
                        <span className="w-3 h-px bg-line shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {activeProject.nextActionNote && (
                <p className="m-0 px-3 py-2.5 rounded-[12px] bg-contractor-soft border border-solid border-contractor-line text-[0.82rem] text-contractor font-semibold">
                  Next: {activeProject.nextActionNote}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${ctBtn} ${ctBtnPrimary} ${ctBtnSm}`}
                  onClick={() => onSubmitMilestone(activeProject.id)}
                >
                  <UploadSimple size={15} weight="bold" /> Submit Milestone
                </button>
                <button
                  type="button"
                  className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`}
                  onClick={() => onNavigate("projects")}
                >
                  View Build <CaretRight size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`}
                  onClick={() => onNavigate("team")}
                >
                  <UsersThree size={15} weight="bold" /> Team
                </button>
              </div>
            </div>
          </article>
        ) : (
          <article className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-8 text-center grid gap-3 place-items-center">
            <span className="grid place-items-center w-14 h-14 rounded-full bg-contractor-soft text-contractor2">
              <Buildings size={28} weight="bold" />
            </span>
            <h2 className="m-0 text-[1.15rem] font-black text-green">No active build yet</h2>
            <p className="m-0 text-[0.9rem] text-muted max-w-sm">
              Browse the marketplace and submit a bid to win your first vault-protected project.
            </p>
            <button
              type="button"
              className={`${ctBtn} ${ctBtnPrimary}`}
              onClick={() => onNavigate("marketplace")}
            >
              Browse Marketplace
            </button>
          </article>
        )}

        {/* Vault summary (PRD §8) */}
        <aside className="rounded-brand p-5 text-white bg-[linear-gradient(150deg,var(--vault-dark),#3b2410_60%,var(--contractor))] shadow-brand-md grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-[1rem] font-black">Vault Summary</h3>
            <LockSimple size={18} weight="bold" className="text-[var(--gold-soft)]" />
          </div>
          <div>
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-white/65">
              Total Contract Value
            </p>
            <p className="m-0 mt-1 text-[1.7rem] font-black leading-none">
              {formatNaira(vault.contractValue)}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Protected", value: vault.protectedFunds },
              { label: "Released", value: vault.releasedFunds },
              { label: "Pending", value: vault.pendingMilestoneAmount },
            ].map((b) => (
              <div key={b.label} className="rounded-[12px] bg-white/10 px-2.5 py-2">
                <span className="block text-[0.66rem] font-bold uppercase tracking-[0.06em] text-white/65">
                  {b.label}
                </span>
                <strong className="block mt-1 text-[0.82rem] font-black">{formatNaira(b.value)}</strong>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate("vault")}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-white text-contractor text-[0.85rem] font-extrabold border-0 hover:-translate-y-px transition-transform"
          >
            Open Vault & Milestones <CaretRight size={14} weight="bold" />
          </button>
          <p className="m-0 flex items-start gap-2 text-[0.72rem] leading-[1.5] text-white/70">
            <LockSimple size={13} weight="bold" className="shrink-0 mt-[2px]" />
            Funds are secured by a CBN-licensed partner and released as milestones are approved.
          </p>
        </aside>
      </div>

      {/* Alerts + updates */}
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <section className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-5">
          <h3 className="m-0 mb-3 text-[1rem] font-black text-green">Pending Actions</h3>
          {alerts.length === 0 ? (
            <p className="m-0 flex items-center gap-2 text-[0.85rem] text-muted">
              <CheckCircle size={18} weight="fill" className="text-green2" /> All caught up — nothing
              needs your attention.
            </p>
          ) : (
            <ul className="m-0 p-0 list-none grid gap-2">
              {alerts.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(a.view)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] border border-solid border-line text-left hover:border-contractor2 hover:bg-contractor-soft transition-colors"
                  >
                    <span className="shrink-0">{ALERT_ICON[a.tone]}</span>
                    <span className="flex-1 text-[0.84rem] text-green font-semibold">{a.text}</span>
                    <span className="shrink-0 text-[0.74rem] font-extrabold text-contractor2 inline-flex items-center gap-1">
                      {a.actionLabel} <CaretRight size={12} weight="bold" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="m-0 text-[1rem] font-black text-green">Team Activity & Updates</h3>
            <button
              type="button"
              onClick={() => onNavigate("updates")}
              className="text-[0.78rem] font-extrabold text-contractor2"
            >
              View all
            </button>
          </div>
          {updates.length === 0 ? (
            <p className="m-0 text-[0.85rem] text-muted">No recent updates.</p>
          ) : (
            <ul className="m-0 p-0 list-none grid gap-3">
              {updates.slice(0, 4).map((u) => (
                <li key={u.id} className="flex gap-3">
                  <span
                    className={`shrink-0 mt-1 w-2 h-2 rounded-full ${
                      u.tone === "success"
                        ? "bg-green2"
                        : u.tone === "info"
                          ? "bg-contractor2"
                          : "bg-line"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="m-0 text-[0.84rem] text-green leading-[1.45]">{u.text}</p>
                    <p className="m-0 mt-0.5 text-[0.74rem] text-muted">
                      {u.authorName} · {u.authorRole} · {u.projectName}
                      {u.photoCount ? ` · ${u.photoCount} photos` : ""} ·{" "}
                      {formatRelativeTime(u.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
