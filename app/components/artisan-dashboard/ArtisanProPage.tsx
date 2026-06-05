"use client";

import Link from "next/link";
import {
  Money,
  ShieldCheck,
  TrendUp,
  UsersThree,
  ArrowRight,
} from "phosphor-react";
import ArtisanDashboardNav from "./ArtisanDashboardNav";
import ArtisanGrowthPricing from "./ArtisanGrowthPricing";
import { GROWTH_FEATURES } from "./growth-constants";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import { formatNaira } from "./utils";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pay for verification checks",
    text: "Cover NIN matching, selfie review, and duplicate account screening.",
  },
  {
    step: "02",
    title: "Get your verified badge",
    text: "Unlock secured job invites and escrow-protected work on Amana.",
  },
  {
    step: "03",
    title: "Boost your visibility",
    text: "Once verified, pay to appear as a recommended artisan to clients.",
  },
];

const FAQ = [
  {
    q: "Do I need to pay for both checks and verification?",
    a: "Yes. Verification checks must be paid first. The verified badge fee queues your priority identity review.",
  },
  {
    q: "When can I buy the recommendation boost?",
    a: "Only verified artisans can purchase visibility boosts. Your profile is highlighted to clients for 7 days.",
  },
  {
    q: "How do I pay?",
    a: "Pay securely by card or bank transfer through our payment partner. This is separate from your escrow wallet.",
  },
];

export default function ArtisanProPage() {
  const { profile, purchaseGrowthFeature } = useArtisanProfile();

  const verificationBundle =
    GROWTH_FEATURES.verification_checks.price +
    GROWTH_FEATURES.verification_badge.price;

  return (
    <div className="adash-page adash-pro-page">
      <ArtisanDashboardNav currentPage="pro" />

      <main className="adash-main">
        <div className="adash-container">
          <section className="apro-hero">
            <div className="apro-hero-copy">
              <p className="adash-eyebrow">
                <Money size={14} weight="fill" />
                Amana Pro
              </p>
              <h1>Pay for visibility. Get recommended to clients.</h1>
              <p>
                Stand out with paid verification and a recommendation boost
                that puts your profile in front of clients searching for trusted
                artisans in {profile.areaLabel}.
              </p>
              <div className="apro-hero-actions">
                <a href="#pricing" className="adash-btn adash-btn--primary">
                  View price plans
                  <ArrowRight size={16} weight="bold" />
                </a>
                <Link href="/artisan/dashboard" className="adash-btn adash-btn--ghost">
                  Back to dashboard
                </Link>
              </div>
            </div>

            <div className="apro-hero-stats">
              <div>
                <TrendUp size={22} weight="bold" />
                <strong>3×</strong>
                <span>More profile views with boost</span>
              </div>
              <div>
                <UsersThree size={22} weight="bold" />
                <strong>Verified</strong>
                <span>Trust signal clients look for</span>
              </div>
              <div>
                <ShieldCheck size={22} weight="bold" />
                <strong>Escrow</strong>
                <span>Unlock secured job invites</span>
              </div>
            </div>
          </section>

          <section className="apro-steps">
            <h2>How Amana Pro works</h2>
            <div className="apro-steps-grid">
              {HOW_IT_WORKS.map((item) => (
                <article key={item.step}>
                  <span className="apro-step-num">{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="apro-bundle">
            <div>
              <h2>Full verification path</h2>
              <p>
                New artisans typically pay for checks, then the verified badge,
                before purchasing weekly visibility boosts.
              </p>
            </div>
            <div className="apro-bundle-price">
              <span>Checks + badge from</span>
              <strong>{formatNaira(verificationBundle)}</strong>
            </div>
          </section>

          <section className="apro-pricing" id="pricing">
            <div className="apro-pricing-header">
              <div>
                <p className="adash-eyebrow">Price plans</p>
                <h2>Choose what you need</h2>
                <p>
                  Pay only for the features you want. Boost renews every 7 days
                  while you stay verified.
                </p>
              </div>
              {profile.isRecommended && (
                <span className="adash-growth-recommended-pill">
                  <Money size={14} weight="fill" />
                  Boost active
                </span>
              )}
            </div>

            <ArtisanGrowthPricing
              profile={profile}
              onPurchase={purchaseGrowthFeature}
              variant="page"
            />

            <p className="adash-growth-note">
              Payments are processed securely. Verification checks must be paid
              before the verified badge. Only verified artisans can purchase
              recommendation boosts.
            </p>
          </section>

          <section className="apro-faq">
            <h2>Common questions</h2>
            <div className="apro-faq-list">
              {FAQ.map((item) => (
                <article key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </section>

          <footer className="adash-disclaimer">
            Amana Pro fees are for verification and visibility services only.
            Job payments remain secured in escrow by our CBN-licensed partner.
          </footer>
        </div>
      </main>
    </div>
  );
}
