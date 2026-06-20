import Link from "next/link";
import AmanaLogo from "./AmanaLogo";
import { TRUST_POINTS } from "./constants";
import JoinRoleActions from "./JoinRoleActions";
import type { ProfessionalRole } from "./types";

type JoinAmanaHeroProps = {
  started: boolean;
  onJoinAsClient: () => void;
  onJoinAsProfessional: (role: ProfessionalRole) => void;
};

export default function JoinAmanaHero({
  started,
  onJoinAsClient,
  onJoinAsProfessional,
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
          when you can trust <span>VAULT</span>.
        </h1>
        <p>The verified marketplace for Nigeria&apos;s construction ecosystem.</p>

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
          <JoinRoleActions
            onJoinAsClient={onJoinAsClient}
            onJoinAsProfessional={onJoinAsProfessional}
            menuPlacement="up"
          />

          <p className="join-amana-login">
            Already have an account?{" "}
            <Link href="/auth/client">Client</Link>
            {" · "}
            <Link href="/auth/architect">Architect</Link>
            {" · "}
            <Link href="/auth/artisan">Artisan</Link>
            {" · "}
            <Link href="/auth/contractor">Contractor</Link>
          </p>
        </div>
      )}
    </aside>
  );
}
