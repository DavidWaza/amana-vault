import Link from "next/link";
import { CaretRight } from "phosphor-react";
import AmanaLogo from "./AmanaLogo";
import { TRUST_POINTS } from "./constants";

type JoinAmanaHeroProps = {
  started: boolean;
  onStart: () => void;
  onJoinAsClient: () => void;
};

export default function JoinAmanaHero({
  started,
  onStart,
  onJoinAsClient,
}: JoinAmanaHeroProps) {
  return (
    <aside className="join-amana-hero">
      <Link href="/" className="join-amana-brand">
        <AmanaLogo size={80} variant="white" />
        <span className="join-amana-brand-name">Amana</span>
      </Link>

      <div className="join-amana-hero-content">
        <h1>
          Why <br /> trust a handshake,
          <br />
          When you can trust <span>VAULT</span> .
        </h1>
        <p>The verified marketplace for Nigeria&apos;s most reliable artisans.</p>

        <ul className="join-amana-trust-list">
          {TRUST_POINTS.map((item) => (
            <li key={item.label}>
              <span className="join-amana-trust-icon">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {!started && (
        <div className="join-amana-hero-cta">
          <div className="join-amana-hero-cta-content">
            <button type="button" className="join-btn-primary" onClick={onStart}>
              Join as Artisan
              <CaretRight size={18} weight="bold" />
            </button>
            <button
              type="button"
              className="join-btn-secondary"
              onClick={onJoinAsClient}
            >
              Join as Client
              <CaretRight size={18} weight="bold" />
            </button>
          </div>

          <p className="join-amana-login">
            Already have an account? <Link href="/auth/artisan">Login</Link>
          </p>
        </div>
      )}
    </aside>
  );
}
