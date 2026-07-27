"use client";

import type { ReactNode } from "react";
import { Ruler, User, ShieldCheck } from "phosphor-react";
import { RESPONSIBLE_PARTY_LABELS } from "./constants";
import type { ResponsibleParty, StatusTone } from "./types";

/* ------------------------------------------------------------------ *
 * Status pill
 * ------------------------------------------------------------------ */

export function StatusPill({
  label,
  tone,
  title,
  size = "md",
}: {
  label: string;
  tone: StatusTone;
  title?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={`ap-pill ap-pill--${tone} ap-pill--${size}`} title={title}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Responsible party
 *
 * The single most important signal on the dashboard: who is expected to act.
 * ------------------------------------------------------------------ */

export function ResponsibleBadge({ party }: { party: ResponsibleParty }) {
  const icon =
    party === "architect" ? (
      <Ruler size={13} weight="bold" />
    ) : party === "client" ? (
      <User size={13} weight="bold" />
    ) : (
      <ShieldCheck size={13} weight="bold" />
    );

  return (
    <span className={`ap-responsible ap-responsible--${party}`}>
      {icon}
      {RESPONSIBLE_PARTY_LABELS[party]}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Section header
 * ------------------------------------------------------------------ */

export function SectionHeader({
  title,
  subtitle,
  action,
  count,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  count?: number;
}) {
  return (
    <header className="ap-section-head">
      <div>
        <h2>
          {title}
          {count != null && count > 0 && <span className="ap-section-count">{count}</span>}
        </h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * Empty state
 * ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  body,
  actions,
  tone = "neutral",
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  actions?: ReactNode;
  tone?: "neutral" | "success";
}) {
  return (
    <div className={`ap-empty ap-empty--${tone}`}>
      {icon && <span className="ap-empty-icon">{icon}</span>}
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {actions && <div className="ap-empty-actions">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Definition list used across the brief, agreement and overview tabs
 * ------------------------------------------------------------------ */

export function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="ap-detail-grid">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ *
 * Inline notice
 * ------------------------------------------------------------------ */

export function Notice({
  tone,
  icon,
  children,
}: {
  tone: "info" | "warning" | "danger" | "success";
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`ap-notice ap-notice--${tone}`}>
      {icon}
      <p>{children}</p>
    </div>
  );
}
