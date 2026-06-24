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
    <div className="flex flex-row items-center shrink-0 gap-3 pt-4 px-8 pb-7 border-t border-solid border-line bg-white">
      <button type="button" className="join-btn-back" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" />
        {isFirstStep ? "Cancel" : "Back"}
      </button>
      <button
        type="submit"
        className="join-btn-form flex-1 w-auto min-w-0 min-h-[3.25rem] m-0"
        disabled={!canProceed}
      >
        {isLastStep ? "Submit Application" : "Continue"}
        <ArrowRight size={16} weight="bold" />
      </button>
    </div>
  );
}
