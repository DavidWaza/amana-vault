import Link from "next/link";
import { ArrowRight, Money } from "phosphor-react";
import type { ArtisanProfile } from "./types";
import { adashEyebrow } from "./ui";

type ArtisanProPromoProps = {
  profile: ArtisanProfile;
};

export default function ArtisanProPromo({ profile }: ArtisanProPromoProps) {
  const needsVerification =
    profile.verificationStatus !== "verified" ||
    !profile.growth.checksPaid ||
    !profile.growth.verificationPaid;

  return (
    <section className="flex justify-between items-center gap-4 px-[1.35rem] py-5 rounded-[22px] bg-[linear-gradient(135deg,rgba(0,107,50,0.08),rgba(254,243,199,0.55))] border border-solid border-line">
      <div>
        <p className={`${adashEyebrow} inline-flex items-center gap-[0.35rem]`}>
          <Money size={14} weight="fill" />
          Amana Pro
        </p>
        <h2 className="mt-1 mb-[0.35rem] text-[1.15rem] text-green">
          {needsVerification
            ? "Get verified and unlock secured jobs"
            : "Boost your visibility to clients"}
        </h2>
        <p className="m-0 text-[0.88rem] text-muted max-w-[34rem]">
          {needsVerification
            ? "Pay for verification checks and your verified badge on the Amana Pro page."
            : "Pay for a recommendation boost and appear at the top of client searches."}
        </p>
      </div>
      <Link
        href="/artisan/pro"
        className="inline-flex items-center gap-[0.45rem] shrink-0 px-[1.15rem] py-3 rounded-full bg-[linear-gradient(135deg,var(--green),var(--green2))] text-white text-[0.88rem] font-extrabold whitespace-nowrap"
      >
        {profile.isRecommended ? "Manage Pro plan" : "Pay for visibility"}
        <ArrowRight size={16} weight="bold" />
      </Link>
    </section>
  );
}
