import Link from "next/link";
import { Sparkle, ArrowRight, Money } from "phosphor-react";
import type { ArtisanProfile } from "./types";

type ArtisanProPromoProps = {
  profile: ArtisanProfile;
};

export default function ArtisanProPromo({ profile }: ArtisanProPromoProps) {
  const needsVerification =
    profile.verificationStatus !== "verified" ||
    !profile.growth.checksPaid ||
    !profile.growth.verificationPaid;

  return (
    <section className="apro-promo">
      <div className="apro-promo-copy">
        <p className="adash-eyebrow">
          <Money size={14} weight="fill" />
          Amana Pro
        </p>
        <h2>
          {needsVerification
            ? "Get verified and unlock secured jobs"
            : "Boost your visibility to clients"}
        </h2>
        <p>
          {needsVerification
            ? "Pay for verification checks and your verified badge on the Amana Pro page."
            : "Pay for a recommendation boost and appear at the top of client searches."}
        </p>
      </div>
      <Link href="/artisan/pro" className="apro-promo-btn">
        {profile.isRecommended ? "Manage Pro plan" : "Pay for visibility"}
        <ArrowRight size={16} weight="bold" />
      </Link>
    </section>
  );
}
