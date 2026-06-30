"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Compass,
  Image,
  MagnifyingGlass,
  MapPin,
  ShieldCheck,
  Star,
  UsersThree,
  Wrench,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type {
  Architect,
  BuildTeamRole,
  MarketplaceContractor,
  RecommendedArtisan,
} from "./types";
import { BUILD_TEAM_ROLE_LABELS } from "./build-team-utils";
import { searchRecommendedArtisans } from "./artisan-search";
import ClientPanelEmptyState from "./ClientPanelEmptyState";
import "./professional-marketplace.css";

type RoleFilter = "all" | BuildTeamRole;

type MarketplaceEntry =
  | { role: "architect"; professional: Architect }
  | { role: "contractor"; professional: MarketplaceContractor }
  | { role: "artisan"; professional: RecommendedArtisan };

type ProfessionalMarketplaceProps = {
  architects: Architect[];
  contractors: MarketplaceContractor[];
  artisans: RecommendedArtisan[];
  clientAreaLabel: string;
  initialRole?: BuildTeamRole | "all";
  hasProjectBids?: boolean;
  onRequestArchitectProposal?: (architect: Architect) => void;
  onViewArchitect?: (architect: Architect) => void;
  onAddArchitect?: (architect: Architect) => void;
  onAddContractor?: (contractor: MarketplaceContractor) => void;
  onViewContractor?: (contractor: MarketplaceContractor) => void;
  onRequestContractorQuote?: (contractor: MarketplaceContractor) => void;
  onAddArtisan?: (artisan: RecommendedArtisan) => void;
  onViewArtisan?: (artisan: RecommendedArtisan) => void;
  onRequestArtisanJob?: (artisan: RecommendedArtisan) => void;
  onCreateJob?: () => void;
  onViewProposals?: () => void;
  isArchitectOnTeam?: (id: string) => boolean;
  isContractorOnTeam?: (id: string) => boolean;
  isArtisanOnTeam?: (id: string) => boolean;
};

const ROLE_TABS: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "All professionals" },
  { id: "architect", label: BUILD_TEAM_ROLE_LABELS.architect },
  { id: "contractor", label: BUILD_TEAM_ROLE_LABELS.contractor },
  { id: "artisan", label: BUILD_TEAM_ROLE_LABELS.artisan },
];

const ROLE_STAT_META: Record<
  BuildTeamRole,
  { icon: typeof Compass; accent: string }
> = {
  architect: { icon: Compass, accent: "architect" },
  contractor: { icon: UsersThree, accent: "contractor" },
  artisan: { icon: Wrench, accent: "artisan" },
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function matchesSearch(entry: MarketplaceEntry, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);

  if (entry.role === "architect") {
    const p = entry.professional;
    return normalize(
      [p.name, p.company, p.specialty, p.bio, ...p.services].join(" "),
    ).includes(q);
  }

  if (entry.role === "contractor") {
    const p = entry.professional;
    return normalize(
      [p.name, p.company, p.specialty, p.bio, ...p.services].join(" "),
    ).includes(q);
  }

  const p = entry.professional;
  return normalize(
    [p.fullName, p.categoryLabel, p.bio, p.areaLabel].join(" "),
  ).includes(q);
}

function ProfessionalCard({
  entry,
  isOnTeam,
  onAddToTeam,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
}: {
  entry: MarketplaceEntry;
  isOnTeam?: boolean;
  onAddToTeam?: () => void;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const { role } = entry;

  if (role === "architect") {
    const architect = entry.professional;
    return (
      <article className={`cp-pro-market-card cp-pro-market-card--${role}`}>
        <div className="cp-pro-market-card-glow" aria-hidden />
        <header className="cp-pro-market-card-top">
          <div className="cp-pro-market-card-top-row">
            <span className={`cp-pro-market-role-tag cp-pro-market-role-tag--${role}`}>
              Architect
            </span>
            {architect.verified && (
              <span className="cp-pro-market-verified">
                <ShieldCheck size={14} weight="fill" /> Verified
              </span>
            )}
          </div>
          <h3 className="cp-pro-market-card-title">{architect.name}</h3>
          <p className="cp-pro-market-card-subtitle">{architect.company}</p>
        </header>
        <p className="cp-pro-market-card-bio">{architect.bio}</p>
        <div className="cp-pro-market-card-meta">
          <span>
            <Star size={14} weight="fill" />
            {architect.rating} ({architect.reviewCount})
          </span>
          <span>
            <Image size={14} weight="bold" />
            {architect.portfolioCount} portfolio
          </span>
        </div>
        <p className="cp-pro-market-card-specialty">
          <strong>Specialty:</strong> {architect.specialty}
        </p>
        <ul className="cp-pro-market-services">
          {architect.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
        <footer className="cp-pro-market-card-actions">
          {onSecondary && (
            <button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={onSecondary}
            >
              {secondaryLabel}
            </button>
          )}
          {isOnTeam ? (
            <button type="button" className="adash-btn adash-btn--secondary" disabled>
              On your build team
            </button>
          ) : (
            <Button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={onAddToTeam}
              loadingLabel="Adding…"
            >
              Add to Team
            </Button>
          )}
          <Button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={onPrimary}
            loadingLabel="Requesting…"
          >
            {primaryLabel}
            <ArrowRight size={16} weight="bold" />
          </Button>
        </footer>
      </article>
    );
  }

  if (role === "contractor") {
    const contractor = entry.professional;
    return (
      <article className={`cp-pro-market-card cp-pro-market-card--${role}`}>
        <div className="cp-pro-market-card-glow" aria-hidden />
        <header className="cp-pro-market-card-top">
          <div className="cp-pro-market-card-top-row">
            <span className={`cp-pro-market-role-tag cp-pro-market-role-tag--${role}`}>
              Contractor
            </span>
            {contractor.verified && (
              <span className="cp-pro-market-verified">
                <ShieldCheck size={14} weight="fill" /> Verified
              </span>
            )}
          </div>
          <h3 className="cp-pro-market-card-title">{contractor.name}</h3>
          <p className="cp-pro-market-card-subtitle">{contractor.company}</p>
        </header>
        <p className="cp-pro-market-card-bio">{contractor.bio}</p>
        <div className="cp-pro-market-card-meta">
          <span>
            <Star size={14} weight="fill" />
            {contractor.rating} ({contractor.reviewCount})
          </span>
          <span>{contractor.experienceYears} years experience</span>
        </div>
        <p className="cp-pro-market-card-specialty">
          <strong>Specialty:</strong> {contractor.specialty}
        </p>
        <ul className="cp-pro-market-services">
          {contractor.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
        <footer className="cp-pro-market-card-actions">
          {onSecondary && (
            <button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={onSecondary}
            >
              {secondaryLabel}
            </button>
          )}
          {isOnTeam ? (
            <button type="button" className="adash-btn adash-btn--secondary" disabled>
              On your build team
            </button>
          ) : (
            <Button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={onAddToTeam}
              loadingLabel="Adding…"
            >
              Add to Team
            </Button>
          )}
          <Button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={onPrimary}
          >
            {primaryLabel}
          </Button>
        </footer>
      </article>
    );
  }

  const artisan = entry.professional;
  return (
    <article className={`cp-pro-market-card cp-pro-market-card--${role}`}>
      <div className="cp-pro-market-card-glow" aria-hidden />
      <header className="cp-pro-market-card-top">
        <div className="cp-pro-market-card-top-row">
          <span className={`cp-pro-market-role-tag cp-pro-market-role-tag--${role}`}>
            Artisan
          </span>
          {artisan.verified && (
            <span className="cp-pro-market-verified">
              <ShieldCheck size={14} weight="fill" /> Verified
            </span>
          )}
        </div>
        <h3 className="cp-pro-market-card-title">{artisan.fullName}</h3>
        <p className="cp-pro-market-card-subtitle">
          {artisan.categoryEmoji} {artisan.categoryLabel}
        </p>
      </header>
      <p className="cp-pro-market-card-bio">{artisan.bio}</p>
      <div className="cp-pro-market-card-meta">
        {artisan.rating !== null && (
          <span>
            <Star size={14} weight="fill" />
            {artisan.rating.toFixed(1)}
          </span>
        )}
        <span>{artisan.completedJobs} jobs done</span>
        <span>
          <MapPin size={14} weight="bold" />
          {artisan.areaLabel}
        </span>
      </div>
      <footer className="cp-pro-market-card-actions">
        {onSecondary && (
          <button
            type="button"
            className="adash-btn adash-btn--secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
        {isOnTeam ? (
          <button type="button" className="adash-btn adash-btn--secondary" disabled>
            On your build team
          </button>
        ) : (
          <Button
            type="button"
            className="adash-btn adash-btn--secondary"
            onClick={onAddToTeam}
            loadingLabel="Adding…"
          >
            Add to Team
          </Button>
        )}
        <Button
          type="button"
          className="adash-btn adash-btn--primary"
          onClick={onPrimary}
        >
          {primaryLabel}
        </Button>
      </footer>
    </article>
  );
}

export default function ProfessionalMarketplace({
  architects,
  contractors,
  artisans,
  clientAreaLabel,
  initialRole = "all",
  hasProjectBids,
  onRequestArchitectProposal,
  onViewArchitect,
  onAddArchitect,
  onAddContractor,
  onViewContractor,
  onRequestContractorQuote,
  onAddArtisan,
  onViewArtisan,
  onRequestArtisanJob,
  onCreateJob,
  onViewProposals,
  isArchitectOnTeam,
  isContractorOnTeam,
  isArtisanOnTeam,
}: ProfessionalMarketplaceProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(initialRole);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setRoleFilter(initialRole);
  }, [initialRole]);

  const counts = useMemo(
    () => ({
      all: architects.length + contractors.length + artisans.length,
      architect: architects.length,
      contractor: contractors.length,
      artisan: artisans.length,
    }),
    [architects.length, contractors.length, artisans.length],
  );

  const entries = useMemo(() => {
    const artisanList =
      query && (roleFilter === "artisan" || roleFilter === "all")
        ? searchRecommendedArtisans(artisans, { query })
        : artisans;

    let combined: MarketplaceEntry[] = [
      ...architects.map((professional) => ({ role: "architect" as const, professional })),
      ...contractors.map((professional) => ({ role: "contractor" as const, professional })),
      ...artisanList.map((professional) => ({ role: "artisan" as const, professional })),
    ];

    if (roleFilter !== "all") {
      combined = combined.filter((entry) => entry.role === roleFilter);
    }

    if (query && roleFilter !== "artisan") {
      combined = combined.filter(
        (entry) => entry.role === "artisan" || matchesSearch(entry, query),
      );
    }

    return combined;
  }, [architects, contractors, artisans, roleFilter, query]);

  const emptyCopy =
    roleFilter === "all"
      ? {
          title: "No professionals match your search",
          message: "Try another name, trade, or specialty.",
        }
      : roleFilter === "architect"
        ? {
            title: "No architects match your search",
            message: "Browse verified design leads for your project vision.",
          }
        : roleFilter === "contractor"
          ? {
              title: "No contractors match your search",
              message: "Compare builders by experience, specialty, and reviews.",
            }
          : {
              title: "No artisans match your search",
              message: `Try another trade or create a job to surface pros in ${clientAreaLabel}.`,
            };

  return (
    <section className="cp-subpage cp-pro-market-page" id="professionals">
      <header className="cp-pro-market-hero">
        <div className="cp-pro-market-hero-copy">
          <p className="adash-eyebrow">Find Professionals</p>
          <h2>Build your dream team</h2>
          <p>
            Browse verified architects, contractors, and artisans — shortlist the
            people you want on your build and reach them when you are ready.
          </p>
        </div>
        <div className="cp-pro-market-stats" aria-label="Professional counts">
          {(["architect", "contractor", "artisan"] as BuildTeamRole[]).map((role) => {
            const Icon = ROLE_STAT_META[role].icon;
            return (
              <div
                key={role}
                className={`cp-pro-market-stat cp-pro-market-stat--${ROLE_STAT_META[role].accent}`}
              >
                <Icon size={20} weight="bold" />
                <strong>{counts[role]}</strong>
                <span>{BUILD_TEAM_ROLE_LABELS[role]}</span>
              </div>
            );
          })}
        </div>
      </header>

      <div className="cp-pro-market-toolbar">
        <label className="cp-pro-market-search">
          <MagnifyingGlass size={18} weight="bold" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, trade, or specialty…"
            aria-label="Search professionals"
          />
        </label>

        <div className="cp-pro-market-tabs" role="tablist" aria-label="Professional types">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={roleFilter === tab.id}
              className={`cp-pro-market-tab${roleFilter === tab.id ? " cp-pro-market-tab--active" : ""}`}
              onClick={() => setRoleFilter(tab.id)}
            >
              {tab.label}
              <span className="cp-pro-market-tab-count">{counts[tab.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {roleFilter === "contractor" && hasProjectBids && onViewProposals && (
        <div className="cp-pro-market-bid-banner">
          <span>You have open contractor bids on active projects.</span>
          <button type="button" className="cp-link-btn" onClick={onViewProposals}>
            Compare project bids
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <ClientPanelEmptyState
          variant={
            roleFilter === "artisan"
              ? "artisans"
              : roleFilter === "contractor"
                ? "proposals"
                : "build-team"
          }
          title={emptyCopy.title}
          message={emptyCopy.message}
          action={
            roleFilter === "artisan" && onCreateJob ? (
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={onCreateJob}
              >
                Create a job
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="cp-pro-market-grid">
          {entries.map((entry) => {
            if (entry.role === "architect") {
              const architect = entry.professional;
              return (
                <ProfessionalCard
                  key={`architect-${architect.id}`}
                  entry={entry}
                  isOnTeam={isArchitectOnTeam?.(architect.id)}
                  onAddToTeam={() => onAddArchitect?.(architect)}
                  onSecondary={() => onViewArchitect?.(architect)}
                  secondaryLabel="View profile"
                  onPrimary={() => onRequestArchitectProposal?.(architect)}
                  primaryLabel="Request proposal"
                />
              );
            }

            if (entry.role === "contractor") {
              const contractor = entry.professional;
              return (
                <ProfessionalCard
                  key={`contractor-${contractor.id}`}
                  entry={entry}
                  isOnTeam={isContractorOnTeam?.(contractor.id)}
                  onAddToTeam={() => onAddContractor?.(contractor)}
                  onSecondary={() => onViewContractor?.(contractor)}
                  secondaryLabel="View profile"
                  onPrimary={() => onRequestContractorQuote?.(contractor)}
                  primaryLabel="Request quote"
                />
              );
            }

            const artisan = entry.professional;
            return (
              <ProfessionalCard
                key={`artisan-${artisan.id}`}
                entry={entry}
                isOnTeam={isArtisanOnTeam?.(artisan.id)}
                onAddToTeam={() => onAddArtisan?.(artisan)}
                onSecondary={() => onViewArtisan?.(artisan)}
                secondaryLabel="View profile"
                onPrimary={() => onRequestArtisanJob?.(artisan)}
                primaryLabel="Request for a job"
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
