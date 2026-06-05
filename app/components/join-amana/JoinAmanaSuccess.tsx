import Link from "next/link";
import { CheckCircle } from "phosphor-react";

type JoinAmanaSuccessProps = {
  fullName: string;
  phone: string;
  onGoToPortal: () => void;
};

export default function JoinAmanaSuccess({
  fullName,
  phone,
  onGoToPortal,
}: JoinAmanaSuccessProps) {
  return (
    <div className="join-amana-success">
      <div className="join-amana-success-icon">
        <CheckCircle size={48} weight="fill" />
      </div>
      <h2>Application submitted!</h2>
      <p>
        Welcome, <strong>{fullName}</strong>. We&apos;ve received your artisan
        application. Our team will review your profile and reach out via{" "}
        <strong>{phone}</strong> within 48 hours.
      </p>
      <button type="button" className="join-btn-form" onClick={onGoToPortal}>
        Go to Artisan Portal
      </button>
      <Link href="/" className="join-amana-back-home">
        Back to homepage
      </Link>
    </div>
  );
}
