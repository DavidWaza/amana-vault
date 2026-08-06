import Link from "next/link";
import AmanaLogo from "@/app/components/join-amana/AmanaLogo";
import { WAITLIST_TRUST_POINTS } from "./ui-options";

export default function WaitlistHero() {
  return (
    <aside className="wl-hero">
      <Link href="/" className="wl-brand">
        <AmanaLogo size={72} variant="white" />
        <span className="wl-brand-name">Amana</span>
      </Link>

      <div className="wl-hero-content">
        <span className="wl-hero-eyebrow">Launching soon</span>
        <h1>
          Be first through
          <br />
          the <span>Vault</span> doors.
        </h1>
        <p>
          Amana is opening to a small founding group before public launch. Join
          the waitlist and we&apos;ll bring you in early.
        </p>

        <ul className="wl-trust-list">
          {WAITLIST_TRUST_POINTS.map((item) => (
            <li key={item.label}>
              <span className="wl-trust-icon">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <p className="wl-hero-login">
        Already have an account?{" "}
        <Link href="/auth/client">Client</Link>
        {" · "}
        <Link href="/auth/architect">Architect</Link>
        {" · "}
        <Link href="/auth/artisan">Artisan</Link>
        {" · "}
        <Link href="/auth/contractor">Contractor</Link>
      </p>
    </aside>
  );
}
