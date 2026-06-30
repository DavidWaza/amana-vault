"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  UsersThree,
  ChartLineUp,
  Star,
  Headset,
  FolderOpen,
  LockSimple,
  Eye,
  GlobeHemisphereWest,
  Vault,
  Wallet,
  Plus,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TwitterLogo,
  YoutubeLogo,
  IdentificationBadge,
  Briefcase,
  SquaresFour,
  PenNib,
} from "phosphor-react";
import { HardHatIcon } from "@phosphor-icons/react";
import AmanaLogo from "./join-amana/AmanaLogo";
import "./landing-page.css";

const HERO_HOUSE =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80";

const ECOSYSTEM_AVATARS = {
  client:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  artisan:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  architect:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  contractor:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80",
};

const ECOSYSTEM_ORBIT_SIZE = 400;
const ECOSYSTEM_ORBIT_CENTER = ECOSYSTEM_ORBIT_SIZE / 2;
const ECOSYSTEM_PERSON_RADIUS = 148;
const ECOSYSTEM_ARROW_RADIUS = 172;
const ECOSYSTEM_INNER_RADIUS = 118;
const ECOSYSTEM_ANGLES = [0, 90, 180, 270] as const;

/** 0° = top (12 o'clock), increasing clockwise */
function ecosystemPoint(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function ecosystemArcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
) {
  const start = ecosystemPoint(cx, cy, radius, startDeg);
  const end = ecosystemPoint(cx, cy, radius, endDeg);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
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
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
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
    { label: "For Clients", href: "/auth/client" },
    { label: "For Professionals", href: "/join-amana" },
    { label: "Marketplace", href: "#ecosystem" },
    { label: "About Us", href: "#trust" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}>
      <a
        href="#home"
        className="lp-nav-brand"
        onClick={() => setMobileOpen(false)}
      >
        <AmanaLogo size={36} variant="white" />
        <div className="lp-nav-brand-text">
          <strong>Amana</strong>
          <span>Vault</span>
        </div>
      </a>

      <button
        className="lp-nav-toggle"
        onClick={() => setMobileOpen((p) => !p)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <div className={`lp-nav-links${mobileOpen ? " open" : ""}`}>
        {navItems.map((item) =>
          item.href.startsWith("/") ? (
            <Link
              key={item.href}
              href={item.href}
              className="lp-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.href}
              href={item.href}
              className="lp-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ),
        )}
        <Link
          href="/join-amana"
          className="lp-nav-cta"
          onClick={() => setMobileOpen(false)}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

function HeroPhonePreview() {
  return (
    <div className="lp-phone" aria-hidden>
      <div className="lp-phone-frame">
        <div className="lp-phone-notch" />
        <div className="lp-phone-screen">
          <div className="lp-phone-status">
            <span>9:41</span>
            <span>●●●</span>
          </div>
          <div className="lp-phone-body">
            <h3 className="lp-phone-project">Idemeto Residence</h3>

            <div>
              <div className="lp-phone-progress-label">
                <span>Project Progress</span>
                <span>60%</span>
              </div>
              <div className="lp-phone-progress-bar">
                <div className="lp-phone-progress-fill" style={{ width: "60%" }} />
              </div>
            </div>

            <div className="lp-phone-vault-card">
              <div className="lp-phone-vault-head">
                <span>Amana Vault</span>
                <Vault size={20} weight="fill" />
              </div>
              <div className="lp-phone-vault-amount">₦25,000,000</div>
            </div>

            <div className="lp-phone-activity">
              <h4>Recent Activity</h4>
              <div className="lp-phone-activity-item">
                <CheckCircle size={14} weight="fill" color="var(--green2)" />
                <div>
                  <strong>Foundation milestone approved</strong>
                  ₦5,000,000 released to contractor
                </div>
              </div>
              <div className="lp-phone-activity-item">
                <FileText size={14} weight="bold" color="var(--green2)" />
                <div>
                  <strong>Structural drawings uploaded</strong>
                  Architect submitted Phase 2 plans
                </div>
              </div>
              <div className="lp-phone-activity-item">
                <ShieldCheck size={14} weight="fill" color="var(--green2)" />
                <div>
                  <strong>Funds secured in Vault</strong>
                  ₦20,000,000 protected for remaining milestones
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lp-phone-home-bar" />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="lp-hero" id="home">
      <div
        className="lp-hero-house"
        style={{ backgroundImage: `url(${HERO_HOUSE})` }}
        role="img"
        aria-label="Modern luxury residence at dusk"
      />
      <div className="page-container lp-hero-inner">
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <CheckCircle size={16} weight="fill" />
            Built for Africa. Backed by Trust.
          </div>
          <h1 className="lp-hero-title">
            Build with <em>confidence.</em>
          </h1>
          <p className="lp-hero-sub">
            Amana connects you with verified professionals and protects your
            money in the Vault until milestones are completed.
          </p>
          <div className="lp-hero-actions">
            <Link href="/auth/client" className="lp-btn-primary">
              Start Your Project
            </Link>
            <Link href="/join-amana" className="lp-btn-outline">
              Join as Professional
            </Link>
          </div>
          <div className="lp-hero-trust">
            {[
              { icon: <ShieldCheck size={18} weight="bold" />, label: "Milestone Protection" },
              { icon: <IdentificationBadge size={18} weight="bold" />, label: "Verified Professionals" },
              { icon: <Eye size={18} weight="bold" />, label: "Transparent Process" },
              { icon: <GlobeHemisphereWest size={18} weight="bold" />, label: "Built for Africa" },
            ].map((item) => (
              <div key={item.label} className="lp-hero-trust-item">
                {item.icon}
                {item.label}
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
      icon: <FileText size={32} />,
      title: "Create Your Vision",
      desc: "Define your project scope, budget, and timeline. Document everything before work begins.",
    },
    {
      icon: <UsersThree size={32} />,
      title: "Choose Your Team",
      desc: "Browse verified architects, contractors, and artisans. Select the right professionals for your build.",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Protect Funds",
      desc: "Deposit payments into the Amana Vault. Funds are held securely until milestones are met.",
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Approve Progress",
      desc: "Review completed work, approve milestones, and release payments with full confidence.",
    },
  ];

  return (
    <section className="lp-section" id="how-it-works">
      <div className="page-container">
        <div className="lp-section-header-center">
          <span className="lp-eyebrow border border-green-500 flex items-center justify-center rounded-full px-4 py-2 bg-green-50 w-fit mx-auto">How It Works</span>
          <h2 className="lp-section-title lp-section-title--center">
            Four simple steps to bring your project home.
          </h2>
        </div>
        <div className="lp-steps-cards">
          {steps.map((step, i) => (
            <Fragment key={step.title}>
              <Reveal delay={i * 0.08} className="lp-step-card">
                <div className="lp-step-num">{i + 1}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </Reveal>
              {i < steps.length - 1 && (
                <div className="lp-step-arrow" aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  const people = [
    {
      role: "Client",
      bubble: "I commission it",
      angle: 0,
      src: ECOSYSTEM_AVATARS.client,
    },
    {
      role: "Architect",
      bubble: "I design it",
      angle: 90,
      src: ECOSYSTEM_AVATARS.architect,
    },
    {
      role: "Contractor",
      bubble: "I build it",
      angle: 180,
      src: ECOSYSTEM_AVATARS.contractor,
    },
    {
      role: "Artisan",
      bubble: "I craft it",
      angle: 270,
      src: ECOSYSTEM_AVATARS.artisan,
    },
  ];

  const features = [
    { icon: <IdentificationBadge size={22} />, label: "Verified Professionals" },
    { icon: <Briefcase size={22} />, label: "Projects Protected" },
    { icon: <LockSimple size={22} />, label: "Funds Secured" },
    { icon: <SquaresFour size={22} />, label: "Categories of Work" },
  ];

  const cx = ECOSYSTEM_ORBIT_CENTER;
  const cy = ECOSYSTEM_ORBIT_CENTER;

  return (
    <section className="lp-section lp-section--alt" id="ecosystem">
      <div className="page-container">
        <div className="lp-section-header-left">
          <span className="lp-eyebrow border border-green-500 flex items-center justify-center rounded-full px-4 py-2 bg-green-50 w-fit">Our Ecosystem</span>
          <h2 className="lp-section-title">
            One platform connecting everyone needed to build.
          </h2>
        </div>
        <div className="lp-ecosystem">
          <div className="lp-ecosystem-diagram">
            <div
              className="lp-ecosystem-orbit"
              style={{
                width: ECOSYSTEM_ORBIT_SIZE,
                height: ECOSYSTEM_ORBIT_SIZE,
              }}
            >
              <svg
                className="lp-ecosystem-arrows"
                viewBox={`0 0 ${ECOSYSTEM_ORBIT_SIZE} ${ECOSYSTEM_ORBIT_SIZE}`}
                aria-hidden
              >
                <defs>
                  <marker
                    id="lp-eco-arrowhead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L8,4 L0,8 Z"
                      fill="#9aada3"
                    />
                  </marker>
                </defs>
                <circle
                  cx={cx}
                  cy={cy}
                  r={ECOSYSTEM_INNER_RADIUS}
                  fill="none"
                  stroke="#b0beb5"
                  strokeWidth="1.5"
                  strokeDasharray="7 5"
                />
                {ECOSYSTEM_ANGLES.map((startAngle, index) => {
                  const endAngle = ECOSYSTEM_ANGLES[(index + 1) % 4];
                  return (
                    <path
                      key={startAngle}
                      d={ecosystemArcPath(
                        cx,
                        cy,
                        ECOSYSTEM_ARROW_RADIUS,
                        startAngle,
                        endAngle,
                      )}
                      fill="none"
                      stroke="#b0beb5"
                      strokeWidth="1.5"
                      strokeDasharray="7 5"
                      markerEnd="url(#lp-eco-arrowhead)"
                    />
                  );
                })}
              </svg>

              <div className="lp-ecosystem-vault">
                <AmanaLogo size={90} variant="green" />
              </div>

              {people.map((person) => {
                const point = ecosystemPoint(
                  cx,
                  cy,
                  ECOSYSTEM_PERSON_RADIUS,
                  person.angle,
                );

                return (
                  <div
                    key={person.role}
                    className="lp-ecosystem-person"
                    style={{
                      left: point.x,
                      top: point.y,
                    }}
                  >
                    <span className="lp-ecosystem-role">{person.role}</span>
                    <img
                      src={person.src}
                      alt={person.role}
                      className="lp-ecosystem-avatar"
                      width={64}
                      height={64}
                    />
                    <div className="lp-ecosystem-bubble">{person.bubble}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lp-ecosystem-features">
            {features.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.08}>
                <div className="lp-ecosystem-feature">
                  <div className="lp-ecosystem-feature-icon">{f.icon}</div>
                  <strong>{f.label}</strong>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Vault size={26} />,
      title: "Amana Vault",
      desc: "Funds are held securely in escrow until milestones are approved. Your money stays protected every step of the way.",
    },
    {
      icon: <IdentificationBadge size={26} />,
      title: "Verified Professionals",
      desc: "Every architect, contractor, and artisan is vetted and rated. Hire with confidence from our trusted network.",
    },
    {
      icon: <ChartLineUp size={26} />,
      title: "Project Tracking",
      desc: "Monitor progress in real time with milestone updates, photo proof, and transparent status dashboards.",
    },
    {
      icon: <FolderOpen size={26} />,
      title: "Documents",
      desc: "Store contracts, drawings, permits, and receipts in one secure document center for your entire project.",
    },
    {
      icon: <Star size={26} />,
      title: "Reputation",
      desc: "Build and browse verified ratings and reviews. Choose professionals with proven track records.",
    },
    {
      icon: <Headset size={26} />,
      title: "Resolution Support",
      desc: "If something goes wrong, our team reviews evidence fairly and helps resolve disputes transparently.",
    },
  ];

  return (
    <section className="lp-section" id="features">
      <div className="page-container">
        <div className="lp-section-header-left">
          <span className="lp-eyebrow">Features</span>
          <h2 className="lp-section-title">
            Everything you need to build with confidence.
          </h2>
        </div>
        <div className="lp-features-grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustAndFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const flow = [
    { icon: <PenNib size={24} />, label: "Agreement is signed" },
    { icon: <Vault size={24} />, label: "Funds secured in Vault" },
    { icon: <HardHatIcon size={24} />, label: "Work completed & approved" },
    { icon: <Wallet size={24} />, label: "Payment is released" },
  ];

  const faqs = [
    {
      q: "What is Amana?",
      a: "Amana is a construction project management and escrow platform built for Africa. We connect clients with verified professionals and protect funds in the Vault until milestones are completed.",
    },
    {
      q: "How does the escrow work?",
      a: "When you start a project, funds are deposited into the Amana Vault and held by our licensed partner financial institution. Money is only released when you approve completed milestones.",
    },
    {
      q: "What if there's a dispute?",
      a: "Both parties submit evidence — photos, documents, and messages. Amana reviews everything against the original agreement and makes a fair, transparent decision.",
    },
    {
      q: "Who can use Amana?",
      a: "Clients commissioning construction projects, architects, contractors, and artisans can all use Amana. Whether you're building a home or delivering skilled work, the platform protects everyone.",
    },
    {
      q: "Is my money safe?",
      a: "Yes. All funds are held in secure escrow by our CBN-licensed partner financial institution. Amana is a technology platform — your money sits safely until it's time to release.",
    },
  ];

  return (
    <section className="lp-section" id="trust">
      <div className="page-container">
        <div className="lp-trust">
          <div>
            <span className="lp-eyebrow">Built on Trust</span>
            <h2 className="lp-section-title">
              The bridge between promise and delivery.
            </h2>
            <p className="lp-trust-desc">
              In Africa&apos;s construction economy, trust is everything. Amana
              eliminates the risk of unfinished projects and unpaid professionals
              by holding funds safely until everyone is satisfied.
            </p>
            <ul className="lp-trust-checklist">
              {[
                "Clear agreements",
                "Milestone-based payments",
                "Transparency at every step",
              ].map((item) => (
                <li key={item}>
                  <CheckCircle size={20} weight="fill" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-trust-flow">
            {flow.map((step) => (
              <div key={step.label} className="lp-trust-flow-step">
                <div className="lp-trust-flow-icon">{step.icon}</div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-section-header-center" id="faq">
          <h2 className="lp-section-title lp-section-title--center">
            Common questions, clear answers.
          </h2>
        </div>
        <div className="lp-faq-list">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className={`lp-faq-item${openIndex === index ? " open" : ""}`}
            >
              <button
                className="lp-faq-question"
                onClick={() =>
                  setOpenIndex((prev) => (prev === index ? null : index))
                }
              >
                {faq.q}
                <span className="lp-faq-toggle">
                  <Plus size={16} weight="bold" />
                </span>
              </button>
              <div className="lp-faq-answer">
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
    <section className="lp-cta" id="cta">
      <div className="page-container lp-cta-inner">
        <div>
          <h2>Build with confidence.</h2>
          <p>
            Join thousands of clients and professionals building a better way.
          </p>
          <div className="lp-cta-actions">
            <Link href="/auth/client" className="lp-btn-primary">
              Start Your Project
            </Link>
            <Link href="/join-amana" className="lp-btn-outline">
              Join as Professional
            </Link>
          </div>
        </div>
        <div className="lp-cta-vault">
          <AmanaLogo size={160} variant="green" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer" id="footer">
      <div className="page-container lp-footer-grid">
        <div className="lp-footer-brand">
          <a href="#home" className="lp-nav-brand">
            <AmanaLogo size={48} variant="green" />
            <div className="lp-nav-brand-text">
              <strong style={{ color: "var(--green)" }}>Amana</strong>
              <span>Vault</span>
            </div>
          </a>
          <p>
            Your money. Safe. Until it&apos;s time. Amana Vault is Africa&apos;s
            construction escrow platform connecting clients and professionals.
          </p>
        </div>

        <div>
          <h4>Product</h4>
          <a href="#how-it-works">How It Works</a>
          <a href="/auth/client">For Clients</a>
          <a href="/join-amana">For Professionals</a>
          <a href="#ecosystem">Marketplace</a>
          <a href="#features">Features</a>
        </div>

        <div>
          <h4>Company</h4>
          <a href="#trust">About Us</a>
          <a href="#home">Careers</a>
          <a href="#home">Blog</a>
          <a href="#home">Contact Us</a>
        </div>

        <div>
          <h4>Support</h4>
          <a href="#home">Help Center</a>
          <a href="#faq">FAQs</a>
          <a href="#home">Terms</a>
          <a href="#home">Privacy</a>
        </div>

        <div>
          <h4>Follow Us</h4>
          <div className="lp-footer-social">
            <a href="#home" aria-label="Facebook">
              <FacebookLogo size={18} weight="fill" />
            </a>
            <a href="#home" aria-label="Instagram">
              <InstagramLogo size={18} weight="fill" />
            </a>
            <a href="#home" aria-label="LinkedIn">
              <LinkedinLogo size={18} weight="fill" />
            </a>
            <a href="#home" aria-label="Twitter">
              <TwitterLogo size={18} weight="fill" />
            </a>
            <a href="#home" aria-label="YouTube">
              <YoutubeLogo size={18} weight="fill" />
            </a>
          </div>
        </div>
      </div>

      <div className="page-container lp-footer-bottom">
        <p>© 2026 Amana Vault. All rights reserved.</p>
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
        <EcosystemSection />
        <FeaturesSection />
        <TrustAndFAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
