"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  CalendarBlank,
  FileText,
  FilePlus,
  BookmarkSimple,
  CheckCircle,
  Circle,
  CircleNotch,
  Vault,
  ShieldCheck,
  Image as ImageIcon,
  Receipt,
  FileDoc,
  FilmSlate,
  Medal,
  Star,
  UploadSimple,
  ChatCircleDots,
  Phone,
  Plus,
  LockSimple,
  Storefront,
  UsersThree,
  MagnifyingGlass,
  Wrench,
  Briefcase,
  UserPlus,
} from "phosphor-react";
import {
  CONSTRUCTION_STAGES,
  stageIndex,
  STAGE_LABELS,
  MILESTONE_STATUS_META,
  TEAM_ROLE_LABELS,
  TEAM_PERMISSION_LABELS,
  ARTISAN_FIELDS,
  ARTISAN_FIELD_LABELS,
  ARTISAN_AVAILABILITY_META,
  getInitials,
} from "./portal-utils";
import { formatNaira, formatRelativeTime, formatDeadline, formatShortDate } from "./utils";
import {
  ctBtn,
  ctBtnPrimary,
  ctBtnSecondary,
  ctBtnSm,
  ctBadge,
  ctInput,
  ctTabs,
  ctTab,
  ctTabSm,
  ctTabActive,
  ctTabInactive,
  BADGE_TONE_CLASS,
} from "./ui";
import type {
  ContractorDocument,
  ContractorMilestone,
  ContractorProject,
  ContractorReview,
  ContractorUpdate,
  ContractorVault,
  DocumentKind,
  MarketplaceArtisan,
  MarketplaceProject,
  TeamMember,
} from "./types";

/* ── shared pieces ─────────────────────────────────────────────────── */

function StageStepper({ stage }: { stage: ContractorProject["currentStage"] }) {
  const current = stageIndex(stage);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {CONSTRUCTION_STAGES.map((s, i) => {
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
              {done ? <CheckCircle size={13} weight="fill" /> : isCurrent ? <CircleNotch size={13} weight="bold" /> : <Circle size={13} />}
              {s.label}
            </div>
            {i < CONSTRUCTION_STAGES.length - 1 && <span className="w-3 h-px bg-line shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function MilestoneRow({ m }: { m: ContractorMilestone }) {
  const meta = MILESTONE_STATUS_META[m.status];
  return (
    <li className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] border border-solid border-line">
      <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-contractor-soft text-contractor2 text-[0.72rem] font-black">
        {STAGE_LABELS[m.stage].slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <strong className="block text-[0.85rem] text-green truncate">{m.label}</strong>
        <span className="text-[0.74rem] text-muted">
          {formatNaira(m.amount)}
          {m.inspectorName ? ` · Inspector: ${m.inspectorName}` : ""}
          {m.dueDate ? ` · Due ${formatShortDate(m.dueDate)}` : ""}
        </span>
      </div>
      <span className={`${ctBadge} ${BADGE_TONE_CLASS[meta.tone]} shrink-0`}>{meta.label}</span>
    </li>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-brand bg-white border border-solid border-line p-10 text-center grid place-items-center gap-2">
      <span className="grid place-items-center w-14 h-14 rounded-full bg-contractor-soft text-contractor2">{icon}</span>
      <h3 className="m-0 text-[1.05rem] font-black text-green">{title}</h3>
      <p className="m-0 text-[0.88rem] text-muted max-w-sm">{body}</p>
    </div>
  );
}

const CLIENT_TYPE_LABEL: Record<MarketplaceProject["clientType"], string> = {
  individual: "Individual",
  diaspora: "Diaspora",
  company: "Company",
  religious: "Religious",
  community: "Community",
};

/* ── Marketplace (PRD §4) ──────────────────────────────────────────── */
// The marketplace hosts two storefronts behind a tab switcher: projects open
// for bidding, and artisans a contractor can search by trade and invite.

type MarketplaceTab = "projects" | "artisans";

export function MarketplacePanel({
  projects,
  artisans,
  onBid,
  onToggleSave,
  onInviteArtisan,
  onToggleSaveArtisan,
}: {
  projects: MarketplaceProject[];
  artisans: MarketplaceArtisan[];
  onBid: (project: MarketplaceProject) => void;
  onToggleSave: (id: string) => void;
  onInviteArtisan: (artisan: MarketplaceArtisan) => void;
  onToggleSaveArtisan: (id: string) => void;
}) {
  const [tab, setTab] = useState<MarketplaceTab>("projects");

  const tabs: { id: MarketplaceTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "projects", label: "Projects", icon: <Storefront size={16} weight="bold" />, count: projects.filter((p) => p.bidStatus === "open").length },
    { id: "artisans", label: "Artisans", icon: <UsersThree size={16} weight="bold" />, count: artisans.length },
  ];

  return (
    <div className="grid gap-4">
      <div className={ctTabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`${ctTab} ${tab === t.id ? ctTabActive : ctTabInactive}`}
          >
            {t.icon}
            {t.id === "projects" ? "Project Marketplace" : "Artisan Marketplace"}
            <span className={tab === t.id ? "text-white/80" : "text-contractor2"}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "projects" ? (
        <ProjectMarketplace projects={projects} onBid={onBid} onToggleSave={onToggleSave} />
      ) : (
        <ArtisanMarketplace artisans={artisans} onInvite={onInviteArtisan} onToggleSave={onToggleSaveArtisan} />
      )}
    </div>
  );
}

function ProjectMarketplace({
  projects,
  onBid,
  onToggleSave,
}: {
  projects: MarketplaceProject[];
  onBid: (project: MarketplaceProject) => void;
  onToggleSave: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (projects.length === 0) {
    return <EmptyState icon={<FileText size={28} weight="bold" />} title="No open projects" body="New projects open for bidding will appear here." />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {projects.map((p) => {
        const bidMeta =
          p.bidStatus === "submitted"
            ? { label: "Bid Submitted", tone: "secure" as const }
            : p.bidStatus === "shortlisted"
              ? { label: "Shortlisted", tone: "success" as const }
              : p.bidStatus === "saved"
                ? { label: "Saved", tone: "progress" as const }
                : p.bidStatus === "lost"
                  ? { label: "Closed", tone: "muted" as const }
                  : { label: "Open for Bids", tone: "warning" as const };
        const open = expanded === p.id;
        return (
          <article key={p.id} className="rounded-brand bg-white border border-solid border-line shadow-brand-sm overflow-hidden flex flex-col">
            <div className="h-36 bg-cover bg-center relative" style={{ backgroundImage: `url(${p.imageUrl})` }}>
              <span className={`${ctBadge} ${BADGE_TONE_CLASS[bidMeta.tone]} absolute top-3 left-3 bg-white/90`}>{bidMeta.label}</span>
              {p.designDocsAvailable && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-[0.66rem] font-extrabold text-green2">
                  <FileText size={12} weight="bold" /> Design docs
                </span>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
              <h3 className="m-0 text-[1.02rem] font-black text-green leading-tight">{p.name}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.78rem] text-muted">
                <span className="inline-flex items-center gap-1"><MapPin size={12} weight="bold" /> {p.location}</span>
                <span className="inline-flex items-center gap-1"><CalendarBlank size={12} weight="bold" /> {p.timelineWeeks} wks</span>
                <span className="inline-flex items-center gap-1"><ShieldCheck size={12} weight="bold" /> {CLIENT_TYPE_LABEL[p.clientType]}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-muted">Budget</span>
                <strong className="text-[1.05rem] font-black text-green">{formatNaira(p.budget)}</strong>
              </div>

              <p className="m-0 text-[0.82rem] text-muted leading-[1.5]">{p.description}</p>

              {open && (
                <div className="rounded-[12px] bg-contractor-soft border border-solid border-contractor-line p-3 mt-1">
                  <strong className="block text-[0.76rem] font-extrabold uppercase tracking-[0.06em] text-contractor mb-1.5">Build Package</strong>
                  <ul className="m-0 pl-4 grid gap-1 list-disc text-[0.8rem] text-green">
                    {p.scope.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="m-0 mt-2 text-[0.74rem] text-muted">
                    Design documents: {p.designDocsAvailable ? "available on request" : "contractor to advise"}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                <button
                  type="button"
                  className={`${ctBtn} ${ctBtnPrimary} ${ctBtnSm}`}
                  onClick={() => onBid(p)}
                  disabled={p.bidStatus === "submitted" || p.bidStatus === "lost"}
                >
                  <FilePlus size={15} weight="bold" /> {p.bidStatus === "submitted" ? "Bid Sent" : "Submit Bid"}
                </button>
                <button type="button" className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`} onClick={() => setExpanded(open ? null : p.id)}>
                  {open ? "Hide Package" : "View Package"}
                </button>
                <button
                  type="button"
                  className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`}
                  onClick={() => onToggleSave(p.id)}
                  aria-pressed={p.bidStatus === "saved"}
                >
                  <BookmarkSimple size={15} weight={p.bidStatus === "saved" ? "fill" : "bold"} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ── Artisan Marketplace (PRD §4b) ─────────────────────────────────── */
// Search artisans by trade/field, review their history and project overview,
// then invite the right person onto a build.

function ArtisanMarketplace({
  artisans,
  onInvite,
  onToggleSave,
}: {
  artisans: MarketplaceArtisan[];
  onInvite: (artisan: MarketplaceArtisan) => void;
  onToggleSave: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState<MarketplaceArtisan["field"] | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Only show field chips that actually have artisans behind them.
  const availableFields = useMemo(
    () => ARTISAN_FIELDS.filter((f) => artisans.some((a) => a.field === f.field)),
    [artisans],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artisans.filter((a) => {
      if (field !== "all" && a.field !== field) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        ARTISAN_FIELD_LABELS[a.field].toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [artisans, query, field]);

  return (
    <div className="grid gap-4">
      {/* Search by field */}
      <div className="grid gap-3">
        <label className="relative flex items-center">
          <MagnifyingGlass size={18} weight="bold" className="absolute left-4 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artisans by trade, skill, name or location…"
            className={`${ctInput} pl-11`}
            aria-label="Search artisans"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setField("all")}
            className={`${ctTab} ${ctTabSm} ${field === "all" ? ctTabActive : ctTabInactive}`}
          >
            All trades
            <span className={field === "all" ? "text-white/80" : "text-contractor2"}>{artisans.length}</span>
          </button>
          {availableFields.map((f) => {
            const count = artisans.filter((a) => a.field === f.field).length;
            const active = field === f.field;
            return (
              <button
                key={f.field}
                type="button"
                onClick={() => setField(active ? "all" : f.field)}
                className={`${ctTab} ${ctTabSm} ${active ? ctTabActive : ctTabInactive}`}
              >
                {f.label}
                <span className={active ? "text-white/80" : "text-contractor2"}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={28} weight="bold" />}
          title="No artisans found"
          body="Try a different trade or clear your search to see everyone."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const open = expanded === a.id;
            const avail = ARTISAN_AVAILABILITY_META[a.availability];
            return (
              <article key={a.id} className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-4 flex flex-col gap-3">
                {/* Identity */}
                <div className="flex items-start gap-3">
                  <span className="shrink-0 grid place-items-center w-12 h-12 rounded-full bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white text-[0.92rem] font-black overflow-hidden">
                    {a.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(a.name)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="m-0 text-[1rem] font-black text-green leading-tight">{a.name}</h3>
                      {a.verified && (
                        <span className="inline-flex items-center gap-1 text-green2" title="Verified artisan">
                          <ShieldCheck size={15} weight="fill" />
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[0.78rem] font-bold text-contractor2">
                      <Wrench size={13} weight="bold" /> {ARTISAN_FIELD_LABELS[a.field]}
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-[0.76rem] text-muted">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} weight="bold" /> {a.location}</span>
                      <span className="inline-flex items-center gap-1 text-gold"><Star size={12} weight="fill" /> {a.rating} ({a.reviewCount})</span>
                    </div>
                  </div>
                  <span className={`${ctBadge} ${BADGE_TONE_CLASS[avail.tone]} shrink-0`}>{avail.label}</span>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[12px] bg-contractor-soft border border-solid border-contractor-line py-2">
                    <strong className="block text-[0.95rem] font-black text-green">{a.completedProjects}</strong>
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.05em] text-muted">Projects</span>
                  </div>
                  <div className="rounded-[12px] bg-contractor-soft border border-solid border-contractor-line py-2">
                    <strong className="block text-[0.95rem] font-black text-green">{a.yearsExperience}y</strong>
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.05em] text-muted">Experience</span>
                  </div>
                  <div className="rounded-[12px] bg-contractor-soft border border-solid border-contractor-line py-2">
                    <strong className="block text-[0.95rem] font-black text-green">{formatNaira(a.dayRate)}</strong>
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.05em] text-muted">Day rate</span>
                  </div>
                </div>

                <p className="m-0 text-[0.82rem] text-muted leading-[1.5]">{a.bio}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {a.skills.map((s) => (
                    <span key={s} className="px-2 py-[0.2rem] rounded-full bg-contractor-soft text-contractor text-[0.72rem] font-bold">
                      {s}
                    </span>
                  ))}
                </div>

                {/* History / project overview */}
                {open && (
                  <div className="rounded-[12px] bg-contractor-soft border border-solid border-contractor-line p-3">
                    <strong className="flex items-center gap-1.5 text-[0.76rem] font-extrabold uppercase tracking-[0.06em] text-contractor mb-2">
                      <Briefcase size={14} weight="bold" /> Project Overview
                    </strong>
                    <ul className="m-0 p-0 list-none grid gap-2">
                      {a.history.map((h, i) => (
                        <li key={i} className="grid gap-0.5">
                          <strong className="text-[0.83rem] text-green leading-tight">{h.title}</strong>
                          <span className="text-[0.76rem] text-muted">{h.role}</span>
                          <span className="text-[0.72rem] text-muted">{h.location} · {h.year}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  <button type="button" className={`${ctBtn} ${ctBtnPrimary} ${ctBtnSm}`} onClick={() => onInvite(a)}>
                    <UserPlus size={15} weight="bold" /> Invite to Project
                  </button>
                  <button type="button" className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`} onClick={() => setExpanded(open ? null : a.id)}>
                    {open ? "Hide History" : "View History"}
                  </button>
                  <button
                    type="button"
                    className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`}
                    onClick={() => onToggleSave(a.id)}
                    aria-pressed={a.saved}
                    aria-label={a.saved ? "Remove from saved" : "Save artisan"}
                  >
                    <BookmarkSimple size={15} weight={a.saved ? "fill" : "bold"} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Project Center (PRD §7) ───────────────────────────────────────── */

export function ProjectCenterPanel({
  projects,
  onSubmitMilestone,
  onMessage,
}: {
  projects: ContractorProject[];
  onSubmitMilestone: (projectId: string) => void;
  onMessage: () => void;
}) {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const filtered = projects.filter((p) => (tab === "active" ? p.status !== "completed" : p.status === "completed"));

  return (
    <div className="grid gap-4">
      <div className={ctTabs}>
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`${ctTab} ${tab === t ? ctTabActive : ctTabInactive}`}
          >
            {t === "active" ? "Active Builds" : "Completed"}
            <span className={tab === t ? "text-white/80" : "text-contractor2"}>
              {projects.filter((p) => (t === "active" ? p.status !== "completed" : p.status === "completed")).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Vault size={28} weight="bold" />} title={tab === "active" ? "No active builds" : "No completed builds yet"} body="Win a bid on the marketplace to start managing a build here." />
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <article key={p.id} className="rounded-brand bg-white border border-solid border-line shadow-brand-sm overflow-hidden">
              <div className="grid md:grid-cols-[200px_1fr]">
                <div className="h-40 md:h-full bg-cover bg-center" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                <div className="p-5 grid gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="m-0 text-[1.1rem] font-black text-green">{p.title}</h3>
                      <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-muted">
                        <span className="inline-flex items-center gap-1"><MapPin size={12} weight="bold" /> {p.location}</span>
                        <span>Client: <span className="text-green font-semibold">{p.clientName}</span></span>
                        {p.deadline && <span className="inline-flex items-center gap-1"><CalendarBlank size={12} weight="bold" /> {formatDeadline(p.deadline)}</span>}
                      </p>
                    </div>
                    <strong className="text-[1rem] font-black text-green">{formatNaira(p.contractValue)}</strong>
                  </div>

                  <StageStepper stage={p.currentStage} />

                  <div>
                    <div className="h-2 rounded-full bg-contractor-soft overflow-hidden">
                      <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--contractor2),var(--contractor3))]" style={{ width: `${p.progress}%` }} />
                    </div>
                    <p className="m-0 mt-1.5 text-[0.76rem] font-bold text-muted">{p.progress}% complete · {p.teamMemberIds.length} team members</p>
                  </div>

                  <ul className="m-0 p-0 list-none grid gap-2">
                    {p.milestones.map((m) => (
                      <MilestoneRow key={m.id} m={m} />
                    ))}
                  </ul>

                  {p.status !== "completed" && (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={`${ctBtn} ${ctBtnPrimary} ${ctBtnSm}`} onClick={() => onSubmitMilestone(p.id)}>
                        <UploadSimple size={15} weight="bold" /> Submit Milestone
                      </button>
                      <button type="button" className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`} onClick={onMessage}>
                        <ChatCircleDots size={15} weight="bold" /> Message Client
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Build Team (PRD §6) ───────────────────────────────────────────── */

export function TeamPanel({
  members,
  projects,
  onAddMember,
}: {
  members: TeamMember[];
  projects: ContractorProject[];
  onAddMember: () => void;
}) {
  const projectName = (id?: string) => projects.find((p) => p.id === id)?.title ?? "Unassigned";

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="m-0 text-[0.88rem] text-muted">
          {members.length} members · you control who uploads proof, updates progress, and sees financials.
        </p>
        <button type="button" className={`${ctBtn} ${ctBtnPrimary} ${ctBtnSm}`} onClick={onAddMember}>
          <Plus size={15} weight="bold" /> Add Team Member
        </button>
      </div>

      {members.length === 0 ? (
        <EmptyState icon={<Plus size={28} weight="bold" />} title="No team members yet" body="Add engineers, electricians, masons and supervisors as scoped sub-accounts." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {members.map((m) => (
            <article key={m.id} className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-4 grid gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] text-white text-[0.8rem] font-black">
                    {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-[0.92rem] text-green truncate">{m.name}</strong>
                    <span className="text-[0.76rem] text-muted">{TEAM_ROLE_LABELS[m.role]}</span>
                  </div>
                </div>
                <span className={`${ctBadge} ${m.status === "active" ? BADGE_TONE_CLASS.success : BADGE_TONE_CLASS.warning}`}>
                  {m.status === "active" ? "Active" : "Invited"}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {m.permissions.map((perm) => (
                  <span key={perm} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-contractor-soft text-contractor2 text-[0.68rem] font-bold">
                    <LockSimple size={10} weight="bold" /> {TEAM_PERMISSION_LABELS[perm]}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 text-[0.76rem] text-muted pt-2">
                <span className="truncate">{projectName(m.assignedProjectId)}</span>
                <span className="inline-flex items-center gap-1"><Phone size={12} weight="bold" /> {m.phone}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Vault & Milestones (PRD §8) ───────────────────────────────────── */

export function VaultPanel({
  vault,
  projects,
  canRequestRelease,
  releaseBlockedReason,
  onRequestRelease,
}: {
  vault: ContractorVault;
  projects: ContractorProject[];
  canRequestRelease: boolean;
  releaseBlockedReason?: string;
  onRequestRelease: () => void;
}) {
  const active = projects.filter((p) => p.status !== "completed");
  const stats = [
    { label: "Contract Value", value: vault.contractValue },
    { label: "Protected Funds", value: vault.protectedFunds },
    { label: "Released Funds", value: vault.releasedFunds },
    { label: "Pending Milestone", value: vault.pendingMilestoneAmount },
  ];

  return (
    <div className="grid gap-5">
      <div className="rounded-brand p-5 text-white bg-[linear-gradient(150deg,var(--vault-dark),#3b2410_60%,var(--contractor))] shadow-brand-md">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Vault size={22} weight="bold" className="text-[var(--gold-soft)]" />
            <h3 className="m-0 text-[1.1rem] font-black">Amana Vault</h3>
          </div>
          <button
            type="button"
            onClick={onRequestRelease}
            disabled={!canRequestRelease}
            title={releaseBlockedReason}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-white text-contractor text-[0.85rem] font-extrabold border-0 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:-translate-y-px transition-transform"
          >
            Request Release
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[14px] bg-white/10 px-3 py-2.5">
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.06em] text-white/65">{s.label}</span>
              <strong className="block mt-1 text-[0.98rem] font-black">{formatNaira(s.value)}</strong>
            </div>
          ))}
        </div>
        {!canRequestRelease && releaseBlockedReason && (
          <p className="m-0 mt-3 text-[0.78rem] text-white/75">{releaseBlockedReason}</p>
        )}
        <p className="m-0 mt-3 flex items-start gap-2 text-[0.74rem] leading-[1.5] text-white/70">
          <LockSimple size={13} weight="bold" className="shrink-0 mt-[2px]" />
          Funds are held by a CBN-licensed partner and released milestone-by-milestone after independent inspection and client approval.
        </p>
      </div>

      {active.map((p) => (
        <section key={p.id} className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h3 className="m-0 text-[1rem] font-black text-green">{p.title}</h3>
            <span className="text-[0.82rem] font-bold text-muted">{formatNaira(p.contractValue)}</span>
          </div>
          <ul className="m-0 p-0 list-none grid gap-2">
            {p.milestones.map((m) => (
              <MilestoneRow key={m.id} m={m} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ── Documents (PRD §9) ────────────────────────────────────────────── */

const DOC_FILTERS: { id: DocumentKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photo", label: "Photos" },
  { id: "video", label: "Videos" },
  { id: "receipt", label: "Receipts" },
  { id: "boq", label: "BOQ" },
  { id: "report", label: "Reports" },
  { id: "drawing", label: "Drawings" },
  { id: "completion", label: "Completion" },
];

const DOC_ICON: Record<DocumentKind, React.ReactNode> = {
  photo: <ImageIcon size={18} weight="bold" />,
  video: <FilmSlate size={18} weight="bold" />,
  receipt: <Receipt size={18} weight="bold" />,
  boq: <FileDoc size={18} weight="bold" />,
  report: <FileText size={18} weight="bold" />,
  drawing: <FileDoc size={18} weight="bold" />,
  completion: <Medal size={18} weight="bold" />,
};

export function DocumentsPanel({ documents, onUpload }: { documents: ContractorDocument[]; onUpload: () => void }) {
  const [filter, setFilter] = useState<DocumentKind | "all">("all");
  const filtered = filter === "all" ? documents : documents.filter((d) => d.kind === filter);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className={ctTabs}>
          {DOC_FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`${ctTab} ${filter === f.id ? ctTabActive : ctTabInactive}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button type="button" className={`${ctBtn} ${ctBtnPrimary} ${ctBtnSm}`} onClick={onUpload}>
          <UploadSimple size={15} weight="bold" /> Upload
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText size={28} weight="bold" />} title="No documents" body="Site photos, receipts, BOQ, drawings and reports will appear here." />
      ) : (
        <ul className="m-0 p-0 list-none grid gap-2">
          {filtered.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-brand bg-white border border-solid border-line shadow-brand-sm">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-contractor-soft text-contractor2 shrink-0">{DOC_ICON[d.kind]}</span>
              <div className="min-w-0 flex-1">
                <strong className="block text-[0.88rem] text-green truncate">{d.name}</strong>
                <span className="text-[0.76rem] text-muted">{d.projectName} · {d.sizeLabel} · {formatShortDate(d.uploadedAt)}</span>
              </div>
              <button type="button" className={`${ctBtn} ${ctBtnSecondary} ${ctBtnSm}`}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Updates timeline ──────────────────────────────────────────────── */

export function UpdatesPanel({ updates }: { updates: ContractorUpdate[] }) {
  if (updates.length === 0) {
    return <EmptyState icon={<ChatCircleDots size={28} weight="bold" />} title="No updates yet" body="Site updates from your team will appear here." />;
  }
  return (
    <div className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-5">
      <ul className="m-0 p-0 list-none grid gap-4">
        {updates.map((u) => (
          <li key={u.id} className="flex gap-3">
            <span className={`shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${u.tone === "success" ? "bg-green2" : u.tone === "info" ? "bg-contractor2" : "bg-line"}`} />
            <div className="min-w-0 border-b border-solid border-line pb-4 w-full last:border-0 last:pb-0">
              <p className="m-0 text-[0.88rem] text-green leading-[1.5]">{u.text}</p>
              <p className="m-0 mt-1 text-[0.76rem] text-muted">
                {u.authorName} · {u.authorRole} · {u.projectName}
                {u.photoCount ? ` · ${u.photoCount} photos` : ""} · {formatRelativeTime(u.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Reviews ───────────────────────────────────────────────────────── */

export function ReviewsPanel({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: ContractorReview[];
  rating: number | null;
  reviewCount: number;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-5 flex items-center gap-5 flex-wrap">
        <div className="text-center">
          <strong className="block text-[2.4rem] font-black text-green leading-none">{rating ?? "—"}</strong>
          <div className="flex items-center gap-0.5 mt-1 text-gold justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} weight={rating != null && i <= Math.round(rating) ? "fill" : "regular"} />
            ))}
          </div>
          <span className="block mt-1 text-[0.76rem] text-muted">{reviewCount} reviews</span>
        </div>
        <p className="m-0 text-[0.88rem] text-muted flex-1 min-w-[200px]">
          Clients rate your company after each milestone is released. A strong record wins more diaspora bids.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon={<Star size={28} weight="bold" />} title="No reviews yet" body="Completed, vault-released projects earn client reviews." />
      ) : (
        <ul className="m-0 p-0 list-none grid gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-brand bg-white border border-solid border-line shadow-brand-sm p-4">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-[0.9rem] text-green">{r.clientName}</strong>
                <span className="flex items-center gap-0.5 text-gold">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={13} weight={i <= r.rating ? "fill" : "regular"} />
                  ))}
                </span>
              </div>
              <span className="block text-[0.74rem] text-muted">{r.projectTitle} · {formatShortDate(r.createdAt)}</span>
              <p className="m-0 mt-2 text-[0.85rem] text-text leading-[1.6]">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
