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

function AmanaLogo({
  size = 180,
  variant = "green",
}: {
  size?: number;
  variant?: "green" | "white";
}) {
  const scale = size / 108;
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
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <a
        href="#home"
        className="logo-link"
        onClick={() => setMobileOpen(false)}
      >
        <AmanaLogo size={60} />

        <div className="amana-brand-name-container">
        <h1 className="amana-brand-name">Amana</h1>

        <div className="logo-tag">Secure am, relax</div>
        </div>
      </a>

      <button
        className="nav-toggle"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? "X" : "MENU"}
      </button>

      <div className={`nav-links${mobileOpen ? " open" : ""}`}>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="nav-link"
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
                    <small>Processing to your bank</small>
                  </div>
                  <div>
                    <span>
                      <ArrowUp size={12} weight="bold" />
                      Pending withdrawal
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
      <div className="page-container hero-content">
        <div>
          <div className="hero-tag">
            <LockSimple size={18} weight="bold" /> PROUDLY ABUJA-BASED
          </div>
          <h1 className="hero-title">
            Payment Protection
            <br />
            <span>You Can Trust.</span>
          </h1>
          <p className="hero-text">
            Amana keeps money safe until the agreed work is completed, approved,
            or fairly resolved. No more broken promises.
          </p>

          <div className="hero-actions">
            <Link href="/auth/client" className="cta-button">
              I&apos;m paying for work
            </Link>
            <Link href="/join-amana" className="btn-secondary">
              I&apos;m doing the work
            </Link>
          </div>

          <div className="regulatory-badge">
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
              <strong>Regulatory Notice:</strong> Amana is a technology
              platform, not a bank or financial institution. All protected funds
              are secured in escrow by our licensed partner financial
              institutions.
            </span>
          </div>

          <div className="hero-stats">
            {[
              { icon: <ShieldCheck size={24} />, label: "Secure" },
              { icon: <CheckCircle size={24} />, label: "Verified" },
              { icon: <Handshake size={24} />, label: "Resolved" },
            ].map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-text">{stat.label}</span>
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

        <div className="steps-grid">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1}>
              <div className="step-card">
                <div className="step-index">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
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

        <div className="features-grid">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08}>
              <div className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
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

        <div className="trust-grid">
          {trustSignals.map((item, index) => (
            <Reveal key={item.text} delay={index * 0.1}>
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

        <div className="use-cases-grid">
          {cases.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <div className="use-case-card">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
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

        <div className="faq-list">
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
        <div className="hero-actions" style={{ justifyContent: "center" }}>
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
