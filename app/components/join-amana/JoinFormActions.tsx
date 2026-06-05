import { ArrowLeft, ArrowRight } from "phosphor-react";

type JoinFormActionsProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  onBack: () => void;
};

export default function JoinFormActions({
  isFirstStep,
  isLastStep,
  canProceed,
  onBack,
}: JoinFormActionsProps) {
  return (
    <div className="join-form-actions">
      <button type="button" className="join-btn-back" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" />
        {isFirstStep ? "Cancel" : "Back"}
      </button>
      <button type="submit" className="join-btn-form" disabled={!canProceed}>
        {isLastStep ? "Submit Application" : "Continue"}
        <ArrowRight size={16} weight="bold" />
      </button>
    </div>
  );
}
