"use client";

import { useMemo, useState } from "react";
import { Star, ShieldCheck, ChatCircleText } from "phosphor-react";
import type { ArtisanReview, ReviewFilter } from "./types";
import { buildReviewSummary } from "./mock-data";
import { adashTab, adashTabActive, adashTabCount, adashTabInactive, adashTabs } from "./ui";

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
    <span className="inline-flex items-center gap-[0.15rem] text-gold" aria-label={`${rating} out of 5 stars`}>
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
    <section className="grid gap-5 mt-6" id="reviews">
      <div>
        <div>
          <p className="m-0 text-[0.92rem] font-extrabold tracking-[0.14em] uppercase text-muted">Client feedback</p>
          <h2 className="mt-1 mb-[0.35rem] text-[1.35rem] text-green">Your reviews</h2>
          <p className="m-0 text-muted text-[0.92rem]">See what clients say after funds are released from escrow.</p>
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-5 items-start max-[900px]:grid-cols-1">
        <aside className="p-5 rounded-[22px] border border-solid border-line bg-white grid gap-[1.15rem]">
          <div className="text-center pb-4 border-b border-solid border-line">
            <span className="block text-[2.75rem] font-black tracking-[-0.04em] text-green leading-none">
              {summary.average > 0 ? summary.average.toFixed(1) : "—"}
            </span>
            <StarRating rating={summary.average} />
            <p className="mt-2 mb-0 text-[0.85rem] text-muted font-bold">{summary.total} review{summary.total === 1 ? "" : "s"}</p>
          </div>

          <ul className="list-none m-0 p-0 grid gap-[0.55rem]" aria-label="Rating breakdown">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = summary.breakdown[star];
              const percent =
                summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;

              return (
                <li key={star} className="grid grid-cols-[2.5rem_1fr_1.5rem] items-center gap-2">
                  <span className="inline-flex items-center gap-[0.2rem] text-[0.78rem] font-extrabold text-muted">
                    {star}
                    <Star size={12} weight="fill" className="text-gold" />
                  </span>
                  <span className="h-[0.45rem] rounded-full bg-soft overflow-hidden">
                    <span className="block h-full rounded-[inherit] bg-[linear-gradient(90deg,#f4a300,#fbbf24)]" style={{ width: `${percent}%` }} />
                  </span>
                  <span className="text-[0.78rem] font-extrabold text-muted text-right">{count}</span>
                </li>
              );
            })}
          </ul>

          <p className="m-0 text-[0.8rem] leading-[1.55] text-muted">
            Reviews are left by clients after a job is completed and payment is
            released from the vault.
          </p>
        </aside>

        <div className="grid gap-4">
          <div className={adashTabs} role="tablist" aria-label="Review filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`${adashTab} ${filter === item.id ? adashTabActive : adashTabInactive}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                <span className={adashTabCount}>{filterCounts[item.id]}</span>
              </button>
            ))}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="text-center px-5 py-8 rounded-[22px] border border-dashed border-line bg-white/70">
              <span className="inline-grid place-items-center w-18 h-18 mb-4 rounded-full bg-soft text-green2">
                <ChatCircleText size={36} weight="bold" />
              </span>
              <h3 className="mt-0 mb-2 text-green">No reviews in this filter</h3>
              <p className="mx-auto mb-4 max-w-[24rem] text-muted leading-[1.6] text-[0.92rem]">Try another tab or complete more jobs to collect client feedback.</p>
            </div>
          ) : (
            <ul className="list-none m-0 p-0 grid gap-[0.85rem]">
              {filteredReviews.map((review) => (
                <li key={review.id} className="px-5 py-[1.15rem] rounded-[20px] border border-solid border-line bg-white">
                  <div className="flex justify-between items-start gap-4 mb-[0.85rem] max-[640px]:flex-col">
                    <div className="flex items-center gap-[0.85rem] min-w-0">
                      <span className="w-11 h-11 rounded-[14px] grid place-items-center bg-soft text-green2 text-[0.82rem] font-black shrink-0">
                        {getInitials(review.clientName)}
                      </span>
                      <div>
                        <div className="flex items-center gap-[0.35rem]">
                          <strong className="text-text text-[0.95rem]">{review.clientName}</strong>
                          {review.clientVerified && (
                            <span
                              className="inline-flex text-green2"
                              title="Verified client"
                            >
                              <ShieldCheck size={14} weight="fill" />
                            </span>
                          )}
                        </div>
                        <p className="mt-[0.15rem] mb-0 text-[0.82rem] text-muted">{review.jobTitle}</p>
                      </div>
                    </div>
                    <div className="grid justify-items-end gap-[0.35rem] shrink-0">
                      <StarRating rating={review.rating} />
                      <time dateTime={review.createdAt} className="text-[0.78rem] text-muted font-semibold">
                        {new Date(review.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                  <blockquote className="m-0 text-[0.92rem] leading-[1.65] text-text">
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
