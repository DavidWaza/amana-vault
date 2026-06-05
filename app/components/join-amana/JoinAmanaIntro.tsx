import { ArrowRight } from "phosphor-react";
import { HardHatIcon } from "@phosphor-icons/react/dist/ssr";

type JoinAmanaIntroProps = {
  onStart: () => void;
};

export default function JoinAmanaIntro({ onStart }: JoinAmanaIntroProps) {
  return (
    <div className="join-amana-intro-card">
      <div className="join-amana-intro-icon">
        <HardHatIcon size={40} weight="bold" />
      </div>
      <h2>Start your artisan application</h2>
      <p>
        Complete a short 6-step form to join Amana. Get matched with verified
        clients and receive guaranteed payments through escrow.
      </p>
      <button type="button" className="join-btn-form" onClick={onStart}>
        Begin Application
        <ArrowRight size={18} weight="bold" />
      </button>
      <p className="join-amana-panel-note">Takes about 3 minutes</p>
    </div>
  );
}
