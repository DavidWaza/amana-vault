import { JOIN_STEPS } from "./types";

type JoinFormHeaderProps = {
  stepIndex: number;
  progress: number;
};

export default function JoinFormHeader({ stepIndex, progress }: JoinFormHeaderProps) {
  const currentStep = JOIN_STEPS[stepIndex];

  return (
    <div className="join-amana-form-header">
      <div className="join-amana-step-meta">
        <span className="join-amana-step-count">
          Step {stepIndex + 1} of {JOIN_STEPS.length}
        </span>
        <h2>{currentStep.title}</h2>
        <p>{currentStep.subtitle}</p>
      </div>
      <div className="join-amana-progress-track">
        <div className="join-amana-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="join-amana-step-dots">
        {JOIN_STEPS.map((step, index) => (
          <span
            key={step.id}
            className={`join-amana-step-dot${
              index <= stepIndex ? " active" : ""
            }${index === stepIndex ? " current" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
