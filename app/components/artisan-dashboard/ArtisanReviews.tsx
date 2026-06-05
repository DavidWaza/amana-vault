"use client";

import { useMemo, useState } from "react";
import { Star, ShieldCheck, ChatCircleText } from "phosphor-react";
import type { ArtisanReview, ReviewFilter } from "./types";
import { buildReviewSummary } from "./mock-data";

type ArtisanReviewsProps = {
  reviews: ArtisanReview[];
};

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "five", label: "5 stars" },
  { id: "four", label: "4 stars" },
  { id: "critical", label: "Needs attention" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="adash-star-rating" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          weight={index < Math.round(rating) ? "fill" : "regular"}
        />
      ))}
    </span>
  );
}

function filterReviews(reviews: ArtisanReview[], filter: ReviewFilter): ArtisanReview[] {
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  switch (filter) {
    case "five":
      return sorted.filter((review) => review.rating >= 4.5);
    case "four":
      return sorted.filter((review) => review.rating >= 3.5 && review.rating < 4.5);
    case "critical":
      return sorted.filter((review) => review.rating < 3.5);
    default:
      return sorted;
  }
}

export default function ArtisanReviews({ reviews }: ArtisanReviewsProps) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const summary = useMemo(() => buildReviewSummary(reviews), [reviews]);

  const filteredReviews = useMemo(
    () => filterReviews(reviews, filter),
    [reviews, filter],
  );

  const filterCounts = useMemo(
    () => ({
      all: reviews.length,
      five: filterReviews(reviews, "five").length,
      four: filterReviews(reviews, "four").length,
      critical: filterReviews(reviews, "critical").length,
    }),
    [reviews],
  );

  return (
    <section className="adash-reviews" id="reviews">
      <div className="adash-reviews-header">
        <div>
          <p className="adash-eyebrow">Client feedback</p>
          <h2>Your reviews</h2>
          <p>See what clients say after funds are released from escrow.</p>
        </div>
      </div>

      <div className="adash-reviews-layout">
        <aside className="adash-reviews-summary">
          <div className="adash-reviews-score">
            <span className="adash-reviews-score-value">
              {summary.average > 0 ? summary.average.toFixed(1) : "—"}
            </span>
            <StarRating rating={summary.average} />
            <p>{summary.total} review{summary.total === 1 ? "" : "s"}</p>
          </div>

          <ul className="adash-reviews-breakdown" aria-label="Rating breakdown">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = summary.breakdown[star];
              const percent =
                summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;

              return (
                <li key={star}>
                  <span className="adash-reviews-breakdown-label">
                    {star}
                    <Star size={12} weight="fill" />
                  </span>
                  <span className="adash-reviews-breakdown-bar">
                    <span style={{ width: `${percent}%` }} />
                  </span>
                  <span className="adash-reviews-breakdown-count">{count}</span>
                </li>
              );
            })}
          </ul>

          <p className="adash-reviews-summary-note">
            Reviews are left by clients after a job is completed and payment is
            released from the vault.
          </p>
        </aside>

        <div className="adash-reviews-main">
          <div className="adash-tabs" role="tablist" aria-label="Review filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`adash-tab${filter === item.id ? " adash-tab--active" : ""}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                <span className="adash-tab-count">{filterCounts[item.id]}</span>
              </button>
            ))}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="adash-empty adash-empty--compact">
              <span className="adash-empty-icon">
                <ChatCircleText size={36} weight="bold" />
              </span>
              <h3>No reviews in this filter</h3>
              <p>Try another tab or complete more jobs to collect client feedback.</p>
            </div>
          ) : (
            <ul className="adash-review-list">
              {filteredReviews.map((review) => (
                <li key={review.id} className="adash-review-card">
                  <div className="adash-review-card-top">
                    <div className="adash-review-client">
                      <span className="adash-review-avatar">
                        {getInitials(review.clientName)}
                      </span>
                      <div>
                        <div className="adash-review-client-name">
                          <strong>{review.clientName}</strong>
                          {review.clientVerified && (
                            <span
                              className="adash-review-verified"
                              title="Verified client"
                            >
                              <ShieldCheck size={14} weight="fill" />
                            </span>
                          )}
                        </div>
                        <p className="adash-review-job">{review.jobTitle}</p>
                      </div>
                    </div>
                    <div className="adash-review-meta">
                      <StarRating rating={review.rating} />
                      <time dateTime={review.createdAt}>
                        {new Date(review.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                  <blockquote className="adash-review-comment">
                    {review.comment}
                  </blockquote>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
