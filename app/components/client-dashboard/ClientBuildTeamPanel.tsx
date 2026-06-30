"use client";

import "./build-team.css";
import { useEffect, useRef } from "react";
import {
  CheckCircle,
  Compass,
  EnvelopeSimple,
  Phone,
  UserPlus,
  UsersThree,
  Wrench,
  X,
} from "phosphor-react";
import type { BuildTeamMember, BuildTeamRole, ClientProject } from "./types";
import ClientPanelEmptyState from "./ClientPanelEmptyState";
import { getInitials } from "./portal-utils";
import {
  BUILD_TEAM_ROLE_LABELS,
  BUILD_TEAM_ROLE_ORDER,
  mergeBuildTeamView,
} from "./build-team-utils";

type ClientBuildTeamPanelProps = {
  projects: ClientProject[];
  shortlisted: BuildTeamMember[];
  highlightMemberId?: string | null;
  onRemove: (memberId: string) => void;
  onFindArchitects: () => void;
  onFindContractors: () => void;
  onFindArtisans: () => void;
};

const ROLE_META: Record<
  BuildTeamRole,
  { icon: typeof Compass; accent: string; label: string }
> = {
  architect: { icon: Compass, accent: "architect", label: "Design lead" },
  contractor: { icon: UsersThree, accent: "contractor", label: "General builder" },
  artisan: { icon: Wrench, accent: "artisan", label: "Trade specialist" },
};

const FIND_ACTION: Record<
  BuildTeamRole,
  keyof Pick<
    ClientBuildTeamPanelProps,
    "onFindArchitects" | "onFindContractors" | "onFindArtisans"
  >
> = {
  architect: "onFindArchitects",
  contractor: "onFindContractors",
  artisan: "onFindArtisans",
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

function TeamMemberCard({
  member,
  isNew,
  onRemove,
}: {
  member: BuildTeamMember;
  isNew?: boolean;
  onRemove?: (id: string) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const meta = ROLE_META[member.role];
  const RoleIcon = meta.icon;

  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isNew]);

  return (
    <article
      ref={cardRef}
      className={`cp-team-card cp-team-card--${meta.accent}${isNew ? " cp-team-card--new" : ""}`}
    >
      <div className="cp-team-card-glow" aria-hidden />
      <header className="cp-team-card-top">
        <div className={`cp-team-card-avatar cp-team-card-avatar--${meta.accent}`}>
          {getInitials(member.name)}
          <span className="cp-team-card-avatar-icon">
            <RoleIcon size={14} weight="bold" />
          </span>
        </div>
        <div className="cp-team-card-heading">
          <div className="cp-team-card-title-row">
            <h4>{member.name}</h4>
            {member.status === "assigned" ? (
              <span className="cp-team-badge cp-team-badge--assigned">On project</span>
            ) : (
              <span className="cp-team-badge cp-team-badge--shortlisted">Shortlisted</span>
            )}
          </div>
          <p className="cp-team-card-subtitle">{member.subtitle}</p>
          {member.detail && (
            <p className="cp-team-card-detail">{member.detail}</p>
          )}
        </div>
        {member.status === "shortlisted" && onRemove && (
          <button
            type="button"
            className="cp-team-card-remove"
            onClick={() => onRemove(member.id)}
            aria-label={`Remove ${member.name} from build team`}
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </header>

      <ul className="cp-team-card-contacts">
        <li>
          <a href={`tel:${member.phone}`} className="cp-team-contact">
            <span className="cp-team-contact-icon">
              <Phone size={15} weight="bold" />
            </span>
            <span>
              <small>Phone</small>
              <strong>{formatPhone(member.phone)}</strong>
            </span>
          </a>
        </li>
        <li>
          <a href={`mailto:${member.email}`} className="cp-team-contact">
            <span className="cp-team-contact-icon">
              <EnvelopeSimple size={15} weight="bold" />
            </span>
            <span>
              <small>Email</small>
              <strong>{member.email}</strong>
            </span>
          </a>
        </li>
      </ul>

      <footer className="cp-team-card-footer">
        <span className={`cp-role-tag cp-role-tag--${member.role}`}>
          {member.role.toUpperCase()}
        </span>
        <span className="cp-team-card-role-label">{meta.label}</span>
      </footer>
    </article>
  );
}

export default function ClientBuildTeamPanel({
  projects,
  shortlisted,
  highlightMemberId,
  onRemove,
  onFindArchitects,
  onFindContractors,
  onFindArtisans,
}: ClientBuildTeamPanelProps) {
  const grouped = mergeBuildTeamView(shortlisted, projects);
  const totalCount = BUILD_TEAM_ROLE_ORDER.reduce(
    (sum, role) => sum + grouped[role].length,
    0,
  );

  const highlightName = highlightMemberId
    ? BUILD_TEAM_ROLE_ORDER.map((role) =>
        grouped[role].find((m) => m.id === highlightMemberId),
      ).find(Boolean)?.name
    : null;

  const findHandlers = {
    onFindArchitects,
    onFindContractors,
    onFindArtisans,
  };

  return (
    <section className="cp-subpage cp-team-page">
      <header className="cp-team-hero">
        <div className="cp-team-hero-copy">
          <p className="adash-eyebrow">Build Team</p>
          <h2>Your dream team, in one place</h2>
          <p>
            Shortlist architects, contractors, and artisans — with direct contact
            details ready when you are.
          </p>
        </div>
        {totalCount > 0 && (
          <div className="cp-team-stats">
            {BUILD_TEAM_ROLE_ORDER.map((role) => {
              const Icon = ROLE_META[role].icon;
              return (
                <div
                  key={role}
                  className={`cp-team-stat cp-team-stat--${ROLE_META[role].accent}`}
                >
                  <Icon size={20} weight="bold" />
                  <strong>{grouped[role].length}</strong>
                  <span>{BUILD_TEAM_ROLE_LABELS[role]}</span>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {highlightName && (
        <div className="cp-team-toast cp-team-toast--enter" role="status">
          <CheckCircle size={20} weight="fill" />
          <span>
            <strong>{highlightName}</strong> was added to your build team
          </span>
        </div>
      )}

      {totalCount === 0 ? (
        <ClientPanelEmptyState
          variant="build-team"
          title="No build team yet"
          message="Browse professionals and add architects, contractors, and artisans to your shortlist."
          action={
            <button
              type="button"
              className="adash-btn adash-btn--primary"
              onClick={onFindArchitects}
            >
              Find Professionals
            </button>
          }
        />
      ) : (
        <div className="cp-team-sections">
          {BUILD_TEAM_ROLE_ORDER.map((role) => {
            const members = grouped[role];
            const findKey = FIND_ACTION[role];
            const onFind = findHandlers[findKey];
            const meta = ROLE_META[role];
            const SectionIcon = meta.icon;

            return (
              <section
                key={role}
                className={`cp-team-section cp-team-section--${meta.accent}`}
              >
                <header className="cp-team-section-head">
                  <div className={`cp-team-section-icon cp-team-section-icon--${meta.accent}`}>
                    <SectionIcon size={22} weight="bold" />
                  </div>
                  <div>
                    <h3>{BUILD_TEAM_ROLE_LABELS[role]}</h3>
                    <p>
                      {members.length === 0
                        ? "No one added yet"
                        : `${members.length} professional${members.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <button type="button" className="cp-team-section-add" onClick={onFind}>
                    <UserPlus size={16} weight="bold" />
                    Add
                  </button>
                </header>

                {members.length === 0 ? (
                  <div className="cp-team-section-empty-card">
                    <p>
                      Shortlist {BUILD_TEAM_ROLE_LABELS[role].toLowerCase()} from Find
                      Professionals to plan your build team.
                    </p>
                    <button type="button" className="cp-link-btn" onClick={onFind}>
                      Browse {role === "artisan" ? "artisans" : `${role}s`}
                    </button>
                  </div>
                ) : (
                  <div className="cp-team-card-grid">
                    {members.map((member) => (
                      <TeamMemberCard
                        key={member.id}
                        member={member}
                        isNew={member.id === highlightMemberId}
                        onRemove={
                          member.status === "shortlisted" ? onRemove : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
