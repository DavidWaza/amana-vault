import JoinRoleActions from "./JoinRoleActions";
import type { ProfessionalRole } from "./types";

type JoinAmanaIntroProps = {
  onJoinAsClient: () => void;
  onJoinAsProfessional: (role: ProfessionalRole) => void;
};

export default function JoinAmanaIntro({
  onJoinAsClient,
  onJoinAsProfessional,
}: JoinAmanaIntroProps) {
  return (
    <div className="join-amana-intro-card">
      <h2>How would you like to join?</h2>
      <p>
        Clients protect builds with vault milestones. Professionals get verified, matched, and paid
        securely through Amana.
      </p>

      <div className="join-amana-intro-actions">
        <JoinRoleActions
          onJoinAsClient={onJoinAsClient}
          onJoinAsProfessional={onJoinAsProfessional}
          menuPlacement="down"
          className="join-amana-intro-cta"
        />
      </div>

      <p className="join-amana-panel-note">Choose a role to continue</p>
    </div>
  );
}
