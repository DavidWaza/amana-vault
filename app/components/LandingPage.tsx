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
  // Sofa,
  Wrench,
  CaretDown,
} from "phosphor-react";
import { ArmchairIcon, HandshakeIcon, HardHatIcon, TargetIcon } from "@phosphor-icons/react";

function AmanaLogo({ size = 48 }: { size?: number }) {
  const scale = size / 48;
  return (
    <div
      className="logo"
      style={{
        width: size,
        height: size,
        borderWidth: 4 * scale,
        borderColor: "var(--green2)",
      }}
    >
      <div
        className="logo-mark"
        style={{
          width: 24 * scale,
          height: 24 * scale,
          borderWidth: 4 * scale,
          borderColor: "var(--green2)",
        }}
      >
        <div className="logo-cross logo-cross-first" />
        <div className="logo-cross logo-cross-second" />
        <div
          className="logo-dot"
          style={{ width: 6 * scale, height: 6 * scale }}
        />
      </div>
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
    { label: "Features", href: "#features" },
    { label: "Trust", href: "#trust" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <a href="#home" className="logo-link" onClick={() => setMobileOpen(false)}>
        <AmanaLogo size={42} />
        <div>
          <div className="logo-text">Amana</div>
          <div className="logo-tag">Your money. Safe. Until it&apos;s time.</div>
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
        <Link href="/auth/client" className="cta-button" onClick={() => setMobileOpen(false)}>
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

function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="page-container hero-content">
        <div>
          <div className="hero-tag">
            <LockSimple size={18} weight="bold" /> PROUDLY ABUJA-BASED
          </div>
          <h1 className="hero-title">
            Payment Protection<br />
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
            <Link href="/auth/artisan" className="btn-secondary">
              I&apos;m doing the work
            </Link>
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

        <div className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-card-top">
              <small className="card-label">Total Protected</small>
              <span className="hero-card-pill">2 Active Jobs</span>
            </div>
            <div className="hero-card-value-box">
              <div className="hero-card-value">₦250,000</div>
            </div>
            <div className="hero-card-meta">
              <span className="hero-card-note">Funds held until completion</span>
            </div>

            <div className="job-card">
              <div className="job-card-header">
                <h3>Kitchen Installation</h3>
                <span className="job-badge job-badge-secure">
                  <ShieldCheck size={14} weight="fill" /> Funds Secured
                </span>
              </div>
              <p>Gwarinpa, Abuja</p>
            </div>
            <div className="job-card">
              <div className="job-card-header">
                <h3>POP Ceiling</h3>
                <span className="job-badge job-badge-progress">
                  <Lightning size={14} weight="fill" /> Work In Progress
                </span>
              </div>
              <p>Wuse 2, Abuja</p>
            </div>
          </div>
        </div>
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
      desc: "Client deposits payment into Amana protection. Money is held safely until work is done.",
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
          <p>Whether you&apos;re hiring an artisan or doing the work, Amana makes the process transparent and safe.</p>
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
          <p>Amana is purpose-built for the way Nigerians hire and pay for services.</p>
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
  const trustItems = [
    { value: "₦8.7M+", label: "Protected" },
    { value: "150+", label: "Jobs Secured" },
    { value: "98%", label: "Resolved" },
  ];

  return (
    <section className="section" id="trust">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">🤝 BUILT ON TRUST</span>
          <h2>The bridge between promise and delivery.</h2>
          <p>In Abuja&apos;s service economy, trust is everything. Amana eliminates the risk of unpaid work and unfinished jobs by holding funds safely until everyone is satisfied.</p>
        </div>

        <div className="trust-grid">
          {trustItems.map((item) => (
            <div key={item.label} className="trust-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
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
      icon:<ArmchairIcon size={28} />,
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
          <p>From home renovations to commercial projects, Amana protects every type of service transaction.</p>
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

function TestimonialsSection() {
  const testimonials = [
    {
      stars: "★★★★★",
      quote:
        "I used to pay artisans upfront and pray they'd finish the job. With Amana, my ₦4M kitchen renovation was protected from day one. Never going back.",
      name: "Adaeze O.",
      role: "Homeowner, Maitama",
      initials: "AO",
    },
    {
      stars: "★★★★★",
      quote:
        "As an artisan, Amana gives me confidence. I know the money is there before I start buying materials. It changed how I run my business.",
      name: "Musa B.",
      role: "Borehole Specialist, Gwarinpa",
      initials: "MB",
    },
    {
      stars: "★★★★★",
      quote:
        "We had a small dispute on a solar installation. Amana's resolution process was fair, fast, and based on our original agreement. Professional.",
      name: "Chinedu K.",
      role: "Property Developer, Wuse",
      initials: "CK",
    },
  ];

  return (
    <section className="section" id="testimonials">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">💬 TESTIMONIALS</span>
          <h2>Trusted by clients and artisans across Abuja.</h2>
          <p>Real stories from real people who use Amana to protect their payments and their work.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.12}>
              <div className="testimonial-card">
                <div className="stars">{item.stars}</div>
                <blockquote>{item.quote}</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{item.initials}</div>
                  <div>
                    <div>{item.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{item.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Amana?",
      a: "Amana is a payment protection platform that holds funds securely in escrow until work is completed and approved. We're built specifically for Nigeria's service economy — connecting clients with artisans through transparent, trust-based transactions.",
    },
    {
      q: "How does the escrow work?",
      a: "When a client creates a protected payment, the funds are held by Amana in a secure account. The artisan can see that the money is available but can't access it until the client approves the completed work. If there's a dispute, Amana reviews the evidence and makes a fair decision.",
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
      a: "Absolutely. All funds are held in regulated, insured accounts. Amana never invests or uses your money. It sits safely until it's time to release — either to the artisan upon completion or back to the client if needed.",
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
          <p>Everything you need to know about using Amana for your next project.</p>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <div key={faq.q} className="faq-card">
              <button className="faq-question" onClick={() => toggle(index)}>
                {faq.q}
                <span>
                  <CaretDown
                    size={18}
                    style={{ transform: openIndex === index ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
                  />
                </span>
              </button>
              <div className={`faq-answer${openIndex === index ? " open" : ""}`}>
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
        <p>Join hundreds of clients and artisans across Abuja who trust Amana for safe, transparent payments.</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/auth/client" className="cta-button">
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
            <AmanaLogo size={42} />
            <div>
              <h1>Amana</h1>
            </div>
          </div>
          <p>Your money. Safe. Until it&apos;s time. Amana is Nigeria&apos;s first payment protection platform built for the service economy.</p>
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
        <p>© 2026 Amana. All rights reserved. Proudly built in Abuja, Nigeria.</p>
        <div>
          <a href="#home">Privacy Policy</a>
          <a href="#home">Terms of Service</a>
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
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
