"use client";

import Link from "next/link";
import { CheckCircle, EnvelopeSimple } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";

type WaitlistSuccessProps = {
  fullName: string;
  email: string;
  position: number;
  alreadyJoined: boolean;
  onAddAnother: () => void;
};

export default function WaitlistSuccess({
  fullName,
  email,
  position,
  alreadyJoined,
  onAddAnother,
}: WaitlistSuccessProps) {
  const firstName = fullName.trim().split(/\s+/)[0];

  return (
    <div className="wl-success">
      <div className="wl-success-icon">
        <CheckCircle size={48} weight="fill" />
      </div>

      <h2>{alreadyJoined ? "You're already on the list" : "You're on the list!"}</h2>

      <p>
        {alreadyJoined ? (
          <>
            Good news, <strong>{firstName}</strong> — <strong>{email}</strong> was
            already registered, so your place is safe. We&apos;ll be in touch
            before launch.
          </>
        ) : (
          <>
            Thanks, <strong>{firstName}</strong>. We&apos;ve saved your spot and
            sent nothing to your inbox yet — watch <strong>{email}</strong> for
            your early-access invite.
          </>
        )}
      </p>

      {position > 0 && (
        <div className="wl-position">
          <span className="wl-position-label">Your place in line</span>
          <strong className="wl-position-value">
            #{position.toLocaleString("en-NG")}
          </strong>
        </div>
      )}

      <div className="wl-success-note">
        <EnvelopeSimple size={18} weight="fill" />
        <span>
          Invites go out in batches. Founding members get verified first and pay
          no platform fee on their first project.
        </span>
      </div>

      <Button type="button" className="wl-submit" onClick={onAddAnother}>
        Add someone else
      </Button>

      <Link href="/" className="wl-back-home">
        Back to homepage
      </Link>
    </div>
  );
}
