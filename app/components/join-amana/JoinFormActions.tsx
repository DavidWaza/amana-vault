import { ArrowLeft, ArrowRight } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";

type JoinFormActionsProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  loading?: boolean;
  onBack: () => void;
};

export default function JoinFormActions({
  isFirstStep,
  isLastStep,
  canProceed,
  loading = false,
  onBack,
}: JoinFormActionsProps) {
  return (
    <div className="flex flex-row items-center shrink-0 gap-3 pt-4 px-8 pb-7">
      <button type="button" className="join-btn-back" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" />
        {isFirstStep ? "Cancel" : "Back"}
      </button>
      <Button
        type="submit"
        className="join-btn-form flex-1 w-auto min-w-0 min-h-13 m-0"
        disabled={!canProceed}
        loading={loading}
        loadingLabel={isLastStep ? "Submitting…" : "Continuing…"}
      >
        {isLastStep ? "Submit Application" : "Continue"}
        <ArrowRight size={16} weight="bold" />
      </Button>
    </div>
  );
}
