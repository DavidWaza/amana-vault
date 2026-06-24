"use client";

import { useMemo, useState } from "react";
import {
  MagnifyingGlass,
  MapPin,
  ShieldCheck,
  Star,
  Briefcase,
  Sparkle,
} from "phosphor-react";
import { AGREEMENT_CATEGORIES } from "../artisan-dashboard/agreement-templates";
import type { AgreementCategoryId } from "../artisan-dashboard/types";
import type { RecommendedArtisan } from "./types";
import { searchRecommendedArtisans } from "./artisan-search";
import { ThumbsUpIcon } from "@phosphor-icons/react";

type ClientArtisanWallProps = {
  artisans: RecommendedArtisan[];
  clientAreaLabel: string;
  onCreateJob: () => void;
  onViewArtisan: (artisan: RecommendedArtisan) => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientArtisanWall({
  artisans,

  clientAreaLabel,
  onCreateJob,
  onViewArtisan,
}: ClientArtisanWallProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    AgreementCategoryId | "all"
  >("all");

  const filteredArtisans = useMemo(
    () =>
      searchRecommendedArtisans(artisans, {
        query,
        categoryId: categoryFilter === "all" ? null : categoryFilter,
      }),
    [artisans, query, categoryFilter],
  );

  const recommendedCount = artisans.filter((item) => item.isRecommended).length;

  return (
    <section className="cdash-artisan-wall" id="artisans">
      <div className="cdash-artisan-wall-header">
        <div>
          <p className="adash-eyebrow">Find skilled pros</p>
          <h2>Recommended artisans near you</h2>
          <p>
            Browse verified artisans in Abuja. Create a job with your
            specifications and matching pros in that line of work appear first
            in search.
          </p>
        </div>
        <button
          type="button"
          className="adash-btn adash-btn--primary"
          onClick={() => onCreateJob()}
        >
          <Briefcase size={18} weight="bold" />
          Create a job
        </button>
      </div>

      <div className="cdash-artisan-wall-toolbar">
        <label className="cdash-artisan-search">
          <MagnifyingGlass size={18} weight="bold" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, trade, or area…"
            aria-label="Search artisans"
          />
        </label>
        <div
          className="cdash-artisan-filters"
          role="tablist"
          aria-label="Trade filters"
        >
          <button
            type="button"
            role="tab"
            aria-selected={categoryFilter === "all"}
            className={`cdash-artisan-filter${categoryFilter === "all" ? " cdash-artisan-filter--active" : ""}`}
            onClick={() => setCategoryFilter("all")}
          >
            All trades
            <span>{artisans.length}</span>
          </button>
          {AGREEMENT_CATEGORIES.slice(0, 6).map((category) => {
            const count = artisans.filter(
              (item) => item.categoryId === category.id,
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={categoryFilter === category.id}
                className={`cdash-artisan-filter${categoryFilter === category.id ? " cdash-artisan-filter--active" : ""}`}
                onClick={() => setCategoryFilter(category.id)}
              >
                {category.emoji} {category.label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="cdash-artisan-wall-note">
        <Sparkle size={16} weight="fill" />
        {recommendedCount} recommended artisans visible in {clientAreaLabel} and
        nearby areas. Paid visibility helps clients find trusted pros faster.
      </p>

      {filteredArtisans.length === 0 ? (
        <div className="adash-empty adash-empty--compact">
          <h3>No artisans match your search</h3>
          <p>
            Try another trade or create a job and we will surface matching pros
            first.
          </p>
          <button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={() => onCreateJob()}
          >
            Create a job
          </button>
        </div>
      ) : (
        <div className="cdash-artisan-grid">
          {filteredArtisans.map((artisan) => (
            <article key={artisan.id} className="cdash-artisan-card">
              <div className="cdash-artisan-card-top">
                <div className="cdash-artisan-avatar">
                  {getInitials(artisan.fullName)}
                </div>
                <div className="cdash-artisan-card-heading">
                  <div className="cdash-artisan-name-row">
                    <h3>{artisan.fullName}</h3>
                    {artisan.isRecommended && (
                      <span className="adash-profile-recommended">
                        <ThumbsUpIcon size={12} weight="fill" />
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="cdash-artisan-card-trade-area">
              <p className="cdash-artisan-trade">
                {artisan.categoryEmoji} {artisan.categoryLabel}
              </p>
              <p className="cdash-artisan-area">
                <MapPin size={14} weight="bold" />
                {artisan.areaLabel}, Abuja
              </p>
              </div>
            
              <p className="cdash-artisan-bio">{artisan.bio}</p>

              <div className="cdash-artisan-meta">
                {artisan.rating !== null && (
                  <span>
                    <Star size={14} weight="fill" />
                    {artisan.rating.toFixed(1)}
                  </span>
                )}
                <span>{artisan.completedJobs} jobs done</span>
                {artisan.verified && (
                  <span className="cdash-artisan-verified">
                    <ShieldCheck size={14} weight="fill" />
                    Verified
                  </span>
                )}
              </div>

              <div className="cdash-artisan-card-actions">
                <button
                  type="button"
                  className="adash-btn adash-btn--secondary adash-btn--block"
                  onClick={() => onViewArtisan(artisan)}
                >
                  View profile
                </button>
                <button
                  type="button"
                  className="adash-btn adash-btn--primary adash-btn--block"
                  onClick={() => onViewArtisan(artisan)}
                >
                  Request for a job
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
