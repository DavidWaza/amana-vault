"use client";

import {
  Compass,
  Wrench,
  Buildings,
  FileText,
  ShieldCheck,
  Sparkle,
  ArrowRight,
  Lightbulb,
  PencilSimple,
  Wallet,
} from "phosphor-react";
import type { ClientProject, ProjectLifecycleStage } from "./types";
import VaultIcon from "../artisan-dashboard/VaultIcon";

type ClientDashboardGridFillProps = {
  activeProject: ClientProject | null;
  onNavigate: (view: string) => void;
};

const ROADMAP: {
  key: ProjectLifecycleStage;
  label: string;
  short: string;
}[] = [
  { key: "vision", label: "Share your vision", short: "Vision" },
  { key: "architect_selection", label: "Choose an architect", short: "Architect" },
  { key: "design", label: "Approve designs", short: "Design" },
  { key: "contractor_bidding", label: "Select a builder", short: "Contractor" },
  { key: "vault_setup", label: "Fund your vault", short: "Vault" },
  { key: "construction", label: "Watch it rise", short: "Build" },
];

const ROADMAP_ICONS = [
  Lightbulb,
  Compass,
  PencilSimple,
  Wrench,
  Wallet,
  Buildings,
] as const;

const TIPS = [
  "Funds stay protected until you approve each milestone release.",
  "Every professional on Amana completes identity verification.",
  "Your vault is held by our CBN-licensed escrow partner.",
];

const QUICK_ACTIONS = [
  {
    id: "architects",
    label: "Browse architects",
    desc: "Verified designers for your vision",
    icon: Compass,
    tone: "green",
  },
  {
    id: "documents",
    label: "Document center",
    desc: "Plans, contracts & receipts",
    icon: FileText,
    tone: "teal",
  },
  {
    id: "vault",
    label: "Activate vault",
    desc: "Secure funds before build starts",
    icon: Wallet,
    tone: "gold",
  },
  {
    id: "proposals",
    label: "Contractor bids",
    desc: "Compare prices & timelines",
    icon: Wrench,
    tone: "purple",
  },
] as const;

function getRoadmapIndex(stage: ProjectLifecycleStage | undefined): number {
  if (!stage) return 0;
  const idx = ROADMAP.findIndex((step) => step.key === stage);
  return idx >= 0 ? idx : 0;
}

export default function ClientDashboardGridFill({
  activeProject,
  onNavigate,
}: ClientDashboardGridFillProps) {
  const currentIdx = getRoadmapIndex(activeProject?.lifecycleStage);
  const currentStep = ROADMAP[currentIdx];
  const tip = TIPS[currentIdx % TIPS.length];
  const progressPct = Math.round(((currentIdx + 0.35) / (ROADMAP.length - 1)) * 100);

  return (
    <article className="cp-grid-fill">
      <div className="cp-grid-fill-bg" aria-hidden>
        <svg className="cp-grid-fill-pattern" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <pattern id="cpBlueprint" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M24 0H0V24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.35"
              />
            </pattern>
          </defs>
          <rect width="400" height="120" fill="url(#cpBlueprint)" />
        </svg>
      </div>

      <div className="cp-grid-fill-main">
        <header className="cp-grid-fill-header">
          <div>
            <span className="cp-grid-fill-eyebrow">
              <Sparkle size={14} weight="fill" />
              {activeProject ? "Your build journey" : "Ready when you are"}
            </span>
            <h3>
              {activeProject
                ? `Next up: ${currentStep.label}`
                : "Every great build starts with a single step"}
            </h3>
            {activeProject && (
              <p className="cp-grid-fill-sub">
                <strong>{activeProject.title}</strong> is at the{" "}
                <em>{currentStep.short}</em> stage — here&apos;s the path ahead.
              </p>
            )}
          </div>
          <div className="cp-grid-fill-progress-ring" aria-hidden>
            <svg viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#e8f0ec" strokeWidth="5" />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="var(--client)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${progressPct * 1.51} 151`}
                transform="rotate(-90 28 28)"
              />
            </svg>
            <span>{Math.min(progressPct, 100)}%</span>
          </div>
        </header>

        <ol className="cp-roadmap" aria-label="Build journey roadmap">
          {ROADMAP.map((step, index) => {
            const Icon = ROADMAP_ICONS[index];
            const state =
              index < currentIdx ? "done" : index === currentIdx ? "current" : "upcoming";
            return (
              <li key={step.key} className={`cp-roadmap-step cp-roadmap-step--${state}`}>
                <span className="cp-roadmap-node">
                  <Icon size={16} weight={state === "current" ? "fill" : "bold"} />
                </span>
                <span className="cp-roadmap-label">{step.short}</span>
                {index < ROADMAP.length - 1 && <span className="cp-roadmap-connector" />}
              </li>
            );
          })}
        </ol>

        <p className="cp-grid-fill-tip">
          <ShieldCheck size={16} weight="fill" />
          {tip}
        </p>
      </div>

      <div className="cp-grid-fill-actions">
        <p className="cp-grid-fill-actions-title">Quick actions</p>
        <div className="cp-quick-grid">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className={`cp-quick-tile cp-quick-tile--${action.tone}`}
                onClick={() => onNavigate(action.id)}
              >
                <span className="cp-quick-tile-icon">
                  {action.id === "vault" ? <VaultIcon size={20} /> : <Icon size={20} weight="bold" />}
                </span>
                <span className="cp-quick-tile-text">
                  <strong>{action.label}</strong>
                  <small>{action.desc}</small>
                </span>
                <ArrowRight size={16} weight="bold" className="cp-quick-tile-arrow" />
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
