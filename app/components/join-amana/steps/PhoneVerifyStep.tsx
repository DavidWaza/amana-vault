import { LockSimple } from "phosphor-react";

type PhoneVerifyStepProps = {
  phone: string;
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
};

export default function PhoneVerifyStep({
  phone,
  otp,
  onOtpChange,
}: PhoneVerifyStepProps) {
  return (
    <>
      <div className="join-verify-banner">
        <LockSimple size={22} weight="bold" />
        <p>
          We sent a 4-digit code to <strong>{phone}</strong>. Enter it below to
          complete your application.
        </p>
      </div>

      <div className="join-otp-grid">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`join-otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="join-otp-input"
            value={digit}
            onChange={(e) => onOtpChange(index, e.target.value)}
            required
          />
        ))}
      </div>

      <p className="join-resend">
        Didn&apos;t get a code?{" "}
        <button type="button" className="join-link-btn">
          Resend
        </button>
      </p>
    </>
  );
}
