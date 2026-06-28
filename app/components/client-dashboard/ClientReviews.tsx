import { Star } from "phosphor-react";
import type { ClientReview } from "./types";
import ClientPanelEmptyState from "./ClientPanelEmptyState";

type ClientReviewsProps = {
  reviews: ClientReview[];
};

export default function ClientReviews({ reviews }: ClientReviewsProps) {
  return (
    <section className="adash-reviews" id="reviews">
      <div className="adash-reviews-header">
        <div>
          <h2>Reviews you&apos;ve left</h2>
          <p>Rate artisans after funds are released from escrow.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <ClientPanelEmptyState
          variant="reviews"
          title="No reviews yet"
          message="Complete a job to rate your artisan and share feedback."
        />
      ) : (
        <div className="adash-review-list">
          {reviews.map((review) => (
            <article key={review.id} className="adash-review-card">
              <div className="adash-review-card-top">
                <div>
                  <h3>{review.artisanName}</h3>
                  <p>{review.jobTitle}</p>
                </div>
                <div className="adash-star-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      weight={i < review.rating ? "fill" : "regular"}
                    />
                  ))}
                </div>
              </div>
              <p>{review.comment}</p>
              <span>
                {new Date(review.createdAt).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
