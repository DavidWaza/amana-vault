"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LockSimple,
  ShieldCheck,
  CheckCircle,
  Handshake,
  MapPin,
  ClipboardText,
  Gear,
  // Scale,
  CurrencyCircleDollar,
  WhatsappLogo,
  FileText,
  ChartLineUp,
  Star,
  // HardHatIcon,
  Lightning,
  Wrench,
  CaretDown,
  User,
  ArrowDown,
  ArrowUp,
} from "phosphor-react";
import {
  MOCK_ARTISAN,
  MOCK_JOBS,
  MOCK_WALLET,
  buildDashboardStats,
} from "./artisan-dashboard/mock-data";
import {
  formatNaira,
  JOB_STATUS_META,
} from "./artisan-dashboard/utils";
import VaultIcon from "./artisan-dashboard/VaultIcon";
import {
  ArmchairIcon,
  HandshakeIcon,
  HardHatIcon,
  TargetIcon,
} from "@phosphor-icons/react";

/*
 * Tailwind migration note (hybrid approach):
 * Layout, spacing, colour and typography are expressed as Tailwind utilities.
 * Genuinely bespoke styling is intentionally KEPT as CSS classes in globals.css
 * and referenced here unchanged — the phone mockup (`hero-phone-*`), scroll
 * reveal animations (`reveal`), multi-layer gradients + pseudo-elements
 * (`hero`, `section-alt`, `cta-section`, `trust-card`), shared design-system
 * primitives (`cta-button`, `btn-secondary`, `page-container`, `eyebrow`,
 * `section-header`) and the descendant-heavy footer.
 */

// Shared card primitives (Steps / Features / Use cases share one visual style).
const CARD =
  "w-full h-full flex flex-col items-center rounded-brand-lg bg-white text-center border border-solid border-line px-7 py-8 shadow-brand-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-[3px] hover:shadow-brand-md hover:border-green2";
const CARD_H3 = "mb-3 text-green text-[1.125rem] font-extrabold leading-[1.25]";
const CARD_P = "m-0 text-muted text-[0.975rem] leading-[1.7] flex-1";
const CARD_ICON =
  "w-14 h-14 shrink-0 rounded-[20px] bg-[linear-gradient(145deg,var(--soft),#fff)] border border-solid border-line text-green2 flex items-center justify-center mx-auto mb-4 text-[1.6rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";
// Stretch the scroll-reveal wrapper so cards in a grid stay equal height
// (replaces the old `.steps-grid > .reveal { … }` rule).
const REVEAL_STRETCH = "w-full h-full flex";

function AmanaLogo({
  size = 180,
  variant = "green",
}: {
  size?: number;
  variant?: "green" | "white";
}) {
  return (
    <img
      src={variant === "green" ? "/logo-main.png" : "/logo-white.png"}
      alt="Amana Logo"
      width={size}
      height="auto"
    />
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Trust", href: "#trust" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 w-full flex items-center justify-between px-6 max-[768px]:px-4 backdrop-blur-[18px] border-b border-solid border-[rgba(211,234,219,0.7)] transition-all duration-300 ${
        scrolled
          ? "py-3 bg-[rgba(247,251,248,0.98)] shadow-brand-sm"
          : "py-[0.57rem] bg-[rgba(247,251,248,0.9)]"
      }`}
    >
      <a
        href="#home"
        className="inline-flex items-center flex-nowrap"
        onClick={() => setMobileOpen(false)}
      >
        <AmanaLogo size={60} />

        <div className="flex flex-col gap-[0.1rem]">
          <h1 className="m-0 text-[1.6rem] font-black tracking-[-0.03em] leading-[1.1] text-green">
            Amana
          </h1>

          <div className="text-[0.72rem] font-extrabold text-green2 uppercase tracking-[0.15em]">
            Secure am, relax
          </div>
        </div>
      </a>

      <button
        className="hidden max-[768px]:flex w-10 h-10 rounded-2xl items-center justify-center text-[1.2rem] text-green bg-[rgba(255,255,255,0.95)] border border-solid border-[rgba(211,234,219,0.85)]"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? "X" : "MENU"}
      </button>

      <div
        className={`flex items-center gap-3 ${
          mobileOpen
            ? "max-[768px]:flex max-[768px]:flex-col max-[768px]:w-full max-[768px]:absolute max-[768px]:top-full max-[768px]:left-0 max-[768px]:right-0 max-[768px]:bg-white max-[768px]:p-4 max-[768px]:border-b max-[768px]:border-solid max-[768px]:border-[rgba(211,234,219,0.7)] max-[768px]:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
            : "max-[768px]:hidden"
        }`}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-muted font-bold text-[0.95rem] px-[0.9rem] py-[0.65rem] rounded-full transition-colors duration-300 hover:text-green hover:bg-[rgba(238,248,241,0.8)]"
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <Link
          href="/join-amana"
          className="cta-button"
          onClick={() => setMobileOpen(false)}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}) {
  const ref = useReveal();
  const dirClass =
    direction === "left"
      ? " translate-left"
      : direction === "right"
        ? " translate-right"
        : "";

  return (
    <div
      ref={ref}
      className={`reveal${dirClass} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

const HERO_PREVIEW_JOBS = MOCK_JOBS.filter((job) =>
  ["job-101", "job-102"].includes(job.id),
);

function HeroPhonePreview() {
  const stats = buildDashboardStats(MOCK_JOBS);
  const firstName = MOCK_ARTISAN.fullName.split(" ")[0];

  return (
    <div className="hero-phone" aria-hidden>
      <div className="hero-phone-frame">
        <div className="hero-phone-notch" />
        <div className="hero-phone-screen">
          <div className="hero-phone-status">
            <span>9:41</span>
            <span className="hero-phone-status-icons">
              <span />
              <span />
              <span />
            </span>
          </div>

          <div className="hero-phone-dash">
            <p className="hero-phone-eyebrow">Artisan Dashboard</p>
            <h3 className="hero-phone-greeting">Good morning, {firstName}</h3>

            <div className="hero-phone-wallet">
              <div className="hero-phone-wallet-head">
                <p className="hero-phone-eyebrow">amana vault</p>
                <VaultIcon size={28} variant="green" />
              </div>
              <div className="hero-phone-wallet-card">
                <div className="hero-phone-wallet-title">
                  <VaultIcon size={18} variant="white" />
                  <span>Secured in Escrow</span>
                </div>
                <p className="hero-phone-wallet-value">
                  {formatNaira(MOCK_WALLET.availableBalance)}
                </p>
                <div className="hero-phone-wallet-breakdown">
                  <div>
                    <span>
                      <ArrowDown size={12} weight="bold" />
                      Incoming
                    </span>
                    <strong>{formatNaira(MOCK_WALLET.incomingBalance)}</strong>
                    <small>On secured jobs awaiting release</small>
                  </div>
                  <div>
                    <span>
                      <ArrowUp size={12} weight="bold" />
                      Pending release
                    </span>
                    <strong>{formatNaira(MOCK_WALLET.pendingWithdrawal)}</strong>
                    <small>Awaiting client approval</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-phone-stats">
              <div>
                <span>Active jobs</span>
                <strong>{stats.activeCount}</strong>
              </div>
              <div>
                <span>In escrow</span>
                <strong>{formatNaira(stats.secured)}</strong>
              </div>
            </div>

            <div className="hero-phone-jobs">
              <div className="hero-phone-jobs-head">
                <h4>Your jobs</h4>
                <span>{stats.activeCount} active</span>
              </div>
              {HERO_PREVIEW_JOBS.map((job) => {
                const status = JOB_STATUS_META[job.status];
                return (
                  <article key={job.id} className="hero-phone-job">
                    <div className="hero-phone-job-top">
                      <div>
                        <h5>{job.title}</h5>
                        <p>
                          <User size={12} weight="bold" />
                          {job.clientName}
                          {job.clientVerified && (
                            <span className="hero-phone-job-verified">
                              <ShieldCheck size={10} weight="fill" />
                              Verified
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`hero-phone-job-badge hero-phone-job-badge--${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="hero-phone-job-meta">
                      <span>
                        <MapPin size={12} weight="bold" />
                        {job.location}
                      </span>
                    </div>
                    <div className="hero-phone-job-amount">
                      <span>Protected amount</span>
                      <strong>{formatNaira(job.amount)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div className="hero-phone-home-indicator" />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="page-container grid gap-12 grid-cols-[1.2fr_1fr] items-center max-[960px]:grid-cols-1">
        <div>
          <div className="inline-flex items-center gap-3 bg-[rgba(255,255,255,0.85)] text-green2 border border-solid border-line px-5 py-3 rounded-full font-black text-[0.78rem] uppercase tracking-[0.1em] shadow-brand-sm">
            <LockSimple size={18} weight="bold" /> PROUDLY ABUJA-BASED
          </div>
          <h1 className="hero-title">
            Payment Protection
            <br />
            <span>You Can Trust.</span>
          </h1>
          <p className="text-[1.15rem] text-muted max-w-[35rem]">
            Amana keeps money safe until the agreed work is completed, approved,
            or fairly resolved. No more broken promises.
          </p>

          <div className="flex flex-wrap gap-4 mt-8 max-[768px]:flex-col">
            <Link href="/auth/client" className="cta-button">
              I&apos;m paying for work
            </Link>
            <Link href="/join-amana" className="btn-secondary">
              I&apos;m doing the work
            </Link>
          </div>

          <div className="flex items-start gap-3 bg-[rgba(238,248,241,0.65)] border border-solid border-line px-5 py-[0.95rem] rounded-[20px] text-[0.88rem] leading-[1.5] text-muted mt-8 max-w-[38rem] shadow-brand-sm backdrop-blur-[8px]">
            <LockSimple
              size={20}
              weight="bold"
              style={{
                color: "var(--green2)",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <span style={{ textAlign: "left" }}>
              <strong className="text-green font-extrabold">
                Regulatory Notice:
              </strong>{" "}
              Amana is a technology platform, not a bank or financial
              institution. All protected funds are secured in escrow by our
              licensed partner financial institutions.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-[38rem] max-[768px]:grid-cols-1">
            {[
              { icon: <ShieldCheck size={24} />, label: "Secure" },
              { icon: <CheckCircle size={24} />, label: "Verified" },
              { icon: <Handshake size={24} />, label: "Resolved" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center gap-2 min-h-[7.5rem] bg-white border border-solid border-line rounded-3xl p-5 text-center shadow-brand-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-[3px] hover:shadow-brand-md hover:border-green2"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 text-[1.75rem]">
                  {stat.icon}
                </span>
                <span className="block text-[0.78rem] tracking-[0.08em] uppercase text-muted font-extrabold">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <HeroPhonePreview />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <ClipboardText size={28} />,
      title: "Create Agreement",
      desc: "Define the scope, price, and deadline. Both parties review before anything moves.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Secure Funds",
      desc: "Client deposits payment. Funds are secured by our licensed partner financial institution until the work is approved.",
    },
    {
      icon: <Gear size={28} />,
      title: "Work Begins",
      desc: "Artisan starts with confidence, knowing funds are available and secured in escrow.",
    },
    {
      icon: <HandshakeIcon size={28} />,
      title: "Release or Resolve",
      desc: "Approve and release payment, or open a fair resolution if something isn't right.",
    },
  ];

  return (
    <section className="section" id="how-it-works">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">🔄 HOW IT WORKS</span>
          <h2>Four simple steps to protect every naira.</h2>
          <p>
            Whether you&apos;re hiring an artisan or doing the work, Amana makes
            the process transparent and safe.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-4 items-stretch max-[1100px]:grid-cols-2 max-[768px]:grid-cols-1">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1} className={REVEAL_STRETCH}>
              <div className={CARD}>
                <div className="w-12 h-12 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--green),var(--green2))] text-white flex items-center justify-center font-black tabular-nums mx-auto mb-4 shadow-[0_8px_20px_rgba(0,75,36,0.2)]">
                  {index + 1}
                </div>
                <div className={CARD_ICON}>{step.icon}</div>
                <h3 className={CARD_H3}>{step.title}</h3>
                <p className={CARD_P}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <CurrencyCircleDollar size={28} />,
      title: "Payment Escrow",
      desc: "Funds are held securely until both parties are satisfied. No more paying upfront and hoping for the best.",
    },
    {
      icon: <WhatsappLogo size={28} />,
      title: "WhatsApp Invites",
      desc: "Invite artisans or clients directly via WhatsApp. Getting started is as simple as sending a message.",
    },
    {
      icon: <TargetIcon size={28} />,
      title: "Fair Resolution",
      desc: "Disputes are reviewed against the original agreement. Evidence-based, transparent, and fair for everyone.",
    },
    {
      icon: <FileText size={28} />,
      title: "Proof of Work",
      desc: "Artisans upload photos, videos, and receipts as completion proof. Everything documented, nothing forgotten.",
    },
    {
      icon: <ChartLineUp size={28} />,
      title: "Live Dashboard",
      desc: "Track all your protected payments, active jobs, and resolved issues in one beautiful real-time dashboard.",
    },
    {
      icon: <Star size={28} />,
      title: "Trust Ratings",
      desc: "Build your reputation over time. Verified ratings help clients choose reliable artisans with confidence.",
    },
  ];

  return (
    <section className="section section-alt" id="features">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">⚡ FEATURES</span>
          <h2>Everything you need for trusted transactions.</h2>
          <p>
            Amana is purpose-built for the way Nigerians hire and pay for
            services.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-3 items-stretch max-[1100px]:grid-cols-2 max-[768px]:grid-cols-1">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={index * 0.08}
              className={REVEAL_STRETCH}
            >
              <div className={CARD}>
                <div className={CARD_ICON}>{feature.icon}</div>
                <h3 className={CARD_H3}>{feature.title}</h3>
                <p className={CARD_P}>{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const trustSignals = [
    {
      icon: <MapPin size={28} />,
      text: "Launching with Abuja businesses",
      subtext:
        "Starting locally in FCT to ensure hands-on support for businesses, clients, and skilled pros.",
    },
    {
      icon: <Handshake size={28} />,
      text: "Built for Nigerians tired of failed agreements",
      subtext:
        "Designed to end the cycle of unpaid work and unfinished projects with reliable payment protection.",
    },
    {
      icon: <CheckCircle size={28} />,
      text: "Join early access",
      subtext:
        "Secure your next project today as one of our early pilot users and experience absolute peace of mind.",
    },
  ];

  return (
    <section className="section" id="trust">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">🤝 BUILT ON TRUST</span>
          <h2>The bridge between promise and delivery.</h2>
          <p>
            In Abuja&apos;s service economy, trust is everything. Amana
            eliminates the risk of unpaid work and unfinished jobs by holding
            funds safely until everyone is satisfied.
          </p>
        </div>

        {/* trust-card kept as CSS — it carries a radial-gradient ::before */}
        <div className="grid gap-6 grid-cols-3 items-stretch max-[768px]:grid-cols-1">
          {trustSignals.map((item, index) => (
            <Reveal key={item.text} delay={index * 0.1} className={REVEAL_STRETCH}>
              <div className="trust-card">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.text}</h3>
                <p>{item.subtext}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const cases = [
    {
      icon: <HardHatIcon size={28} />,
      title: "Construction & Renovation",
      desc: "Protect borehole drilling, POP ceilings, tiling, plumbing and all building projects from deposit to completion.",
    },
    {
      icon: <Lightning size={28} />,
      title: "Solar & Electrical",
      desc: "Secure payments for solar installations, inverter setups, and electrical work across Abuja homes and offices.",
    },
    {
      icon: <ArmchairIcon size={28} />,
      title: "Furniture & Interiors",
      desc: "From custom kitchen cabinets to full interior fitouts – protect every naira until the furniture is delivered.",
    },
    {
      icon: <Wrench size={28} />,
      title: "General Artisan Services",
      desc: "AC installation, carpentry, painting, welding – any skilled trade can be protected with Amana.",
    },
  ];

  return (
    <section className="section section-alt" id="use-cases">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">🎯 USE CASES</span>
          <h2>Built for Abuja&apos;s service economy.</h2>
          <p>
            From home renovations to commercial projects, Amana protects every
            type of service transaction.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-2 items-stretch max-[768px]:grid-cols-1">
          {cases.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1} className={REVEAL_STRETCH}>
              <div className={CARD}>
                <div className={CARD_ICON}>{item.icon}</div>
                <h3 className={CARD_H3}>{item.title}</h3>
                <p className={CARD_P}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials section removed to ensure all trust signals remain 100% real.

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Amana?",
      a: "Amana is a payment protection platform built specifically for Nigeria's service economy. We connect clients with artisans through transparent, trust-based transactions. Please note that Amana is a technology provider; all funds are held in secure escrow custody by our CBN-licensed partner financial institutions.",
    },
    {
      q: "How does the escrow work?",
      a: "When a client creates a protected payment, the funds are held securely in custody by our CBN-licensed partner financial institution. The artisan can see that the money is available but can't access it until the client approves the completed work. If there's a dispute, Amana reviews the evidence and makes a fair decision.",
    },
    {
      q: "What if there's a dispute?",
      a: "Both parties submit evidence — photos, videos, receipts, and messages. Amana reviews everything against the original agreement and makes a fair decision. Outcomes can include full release, partial release, a correction period, or a refund.",
    },
    {
      q: "How much does Amana charge?",
      a: "During our MVP pilot, Amana charges a flat 2% fee on protected payments. This covers escrow holding, dispute resolution, and platform access. No hidden fees, no surprises.",
    },
    {
      q: "Is my money safe?",
      a: "Absolutely. All funds are held securely in escrow by our regulated, CBN-licensed partner bank. Amana is a software platform and does not hold or custody your funds directly. Your money sits safely with our partner institution until it's time to release — either to the artisan upon completion or back to the client if needed.",
    },
    {
      q: "How do I invite an artisan?",
      a: "After creating a protected payment, you can send an invite link via WhatsApp, SMS, or email. The artisan simply clicks the link, reviews the agreement, and accepts. It's that simple.",
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section section-alt" id="faq">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">❓ FAQ</span>
          <h2>Common questions, clear answers.</h2>
          <p>
            Everything you need to know about using Amana for your next project.
          </p>
        </div>

        <div className="max-w-[760px] mx-auto">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="faq-card">
              <button className="faq-question" onClick={() => toggle(index)}>
                {faq.q}
                <span>
                  <CaretDown
                    size={18}
                    style={{
                      transform:
                        openIndex === index ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </span>
              </button>
              <div
                className={`faq-answer${openIndex === index ? " open" : ""}`}
              >
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="cta-section" id="cta">
      <div className="page-container cta-inner">
        <h2>Ready to protect your next project?</h2>
        <p>
          Join early access and secure your next agreement with absolute peace
          of mind.
        </p>
        <div className="flex flex-wrap gap-4 mt-8 max-[768px]:flex-col justify-center">
          <Link href="/join-amana" className="cta-button">
            Get Started — It&apos;s Free
          </Link>
          <a href="#how-it-works" className="btn-secondary">
            Learn How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="page-container footer-grid">
        <div className="footer-brand">
          <div className="logo-link">
            <AmanaLogo size={60} variant="white" />
            <h1 className="amana-brand-name">Amana</h1>
          </div>
          <p>
            Your money. Safe. Until it&apos;s time. Amana is Nigeria&apos;s
            first payment protection platform built for the service economy.
          </p>
        </div>

        <div>
          <h4>Product</h4>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#use-cases">Use Cases</a>
          <a href="#faq">FAQ</a>
        </div>

        <div>
          <h4>Company</h4>
          <a href="#home">About</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#home">Careers</a>
          <a href="#home">Blog</a>
        </div>

        <div>
          <h4>Support</h4>
          <a href="#home">Help Center</a>
          <a href="#home">Contact Us</a>
          <a href="#home">WhatsApp</a>
          <a href="#home">Report Issue</a>
        </div>
      </div>

      <div className="page-container footer-bottom">
        <div className="footer-disclaimer">
          Amana is a technology platform, not a bank, escrow agent, or financial
          institution. Payment protection and escrow custody services are
          provided by our Central Bank of Nigeria (CBN) licensed partner
          financial institution. All escrowed funds are held securely in custody
          accounts at our licensed partner bank.
        </div>
        <div className="footer-bottom-row">
          <p>
            © 2026 Amana. All rights reserved. Proudly built in Abuja, Nigeria.
          </p>
          <div className="footer-bottom-links">
            <a href="#home">Privacy Policy</a>
            <a href="#home">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <TrustSection />
        <UseCasesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
