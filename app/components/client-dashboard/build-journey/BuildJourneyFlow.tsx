"use client";

import { useEffect, useState } from "react";
import { X } from "phosphor-react";
import type { StartProjectSubmitPayload } from "../types";
import BuildJourneyShell from "./components/BuildJourneyShell";
import SubmitVerificationScreen, {
  type SubmitVerificationPhase,
} from "./components/SubmitVerificationScreen";
import {
  ArchitectFeeStep,
  FeelStep,
  HomeTypeStep,
  InspirationStep,
  JourneyStageStep,
  ProjectTypeStep,
  RangePrioritiesStep,
  ReviewStep,
  StyleStep,
  WelcomeStep,
} from "./BuildJourneySteps";
import {
  canProceedStep,
  mapBuildJourneyToStartProject,
} from "./map-to-start-project";
import { runSubmitVerification } from "./submit-verification";
import { buildSubmissionTrail } from "./submission-trail";
import { useBuildJourney } from "./useBuildJourney";
import { BUILD_JOURNEY_STEPS } from "./types";
import "./build-journey.css";

const BUILD_JOURNEY_REVIEW_INDEX = BUILD_JOURNEY_STEPS.indexOf("review");

type BuildJourneyFlowProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: StartProjectSubmitPayload) => Promise<void>;
};

const STEP_COPY: Record<string, { title: string; subtitle?: string }> = {
  "project-type": {
    title: "What do you want to build?",
    subtitle: "Choose the category that best describes your project.",
  },
  "home-type": {
    title: "What kind of home are you imagining?",
    subtitle: "Select the layout that fits your lifestyle and goals.",
  },
  style: {
    title: "What style feels like home?",
    subtitle: "Pick an aesthetic direction for your architect to explore.",
  },
  feel: {
    title: "What should your home feel like?",
    subtitle: "Choose the emotions and experiences you want every day.",
  },
  journey: {
    title: "Where are you in your journey?",
    subtitle: "This helps us route you to the right next step.",
  },
  range: {
    title: "Project range & priorities",
    subtitle: "Share your budget range and what matters most in the build.",
  },
  "architect-fee": {
    title: "How would you like to pay the architect?",
    subtitle: "Choose a fee structure that works for your project.",
  },
  inspiration: {
    title: "Share inspiration for your future home",
    subtitle: "Upload photos, notes, or references to guide your architect.",
  },
  review: {
    title: "Review & submit",
    subtitle:
      "Confirm your brief before sending it to the architect marketplace.",
  },
};

export default function BuildJourneyFlow({
  open,
  onClose,
  onSubmit,
}: BuildJourneyFlowProps) {
  const {
    step,
    stepIndex,
    flowStep,
    flowTotal,
    form,
    patchForm,
    goNext,
    goBack,
    goToStep,
    reset,
    isWelcome,
  } = useBuildJourney(open);

  const [submitPhase, setSubmitPhase] = useState<SubmitVerificationPhase | "idle">(
    "idle",
  );
  const [loadingStep, setLoadingStep] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submittedProjectName, setSubmittedProjectName] = useState("");
  const [submissionTrail, setSubmissionTrail] = useState<
    ReturnType<typeof buildSubmissionTrail>
  >([]);

  useEffect(() => {
    if (!open) {
      setSubmitPhase("idle");
      setLoadingStep(0);
      setSubmitError("");
      setSubmittedProjectName("");
      setSubmissionTrail([]);
    }
  }, [open]);

  const runSubmit = async () => {
    const mapped = mapBuildJourneyToStartProject(form);
    setSubmittedProjectName(mapped.projectName);
    setSubmissionTrail(buildSubmissionTrail(form));
    setSubmitPhase("loading");
    setLoadingStep(0);
    setSubmitError("");

    try {
      await runSubmitVerification(setLoadingStep, () =>
        onSubmit({ startProject: mapped, brief: form }),
      );
      setSubmitPhase("success");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not publish your brief. Please try again.",
      );
      setSubmitPhase("failed");
    }
  };

  const handleSuccessContinue = () => {
    reset();
    setSubmitPhase("idle");
    onClose();
  };

  const handleBackToReview = () => {
    setSubmitPhase("idle");
    setSubmitError("");
    goToStep(BUILD_JOURNEY_REVIEW_INDEX);
  };

  if (!open) return null;

  const copy = STEP_COPY[step] ?? { title: "" };
  const canNext = canProceedStep(stepIndex, form);
  const isSubmitting = submitPhase !== "idle";

  const handleClose = () => {
    if (submitPhase === "loading") return;
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomeStep onBegin={goNext} />;
      case "project-type":
        return <ProjectTypeStep form={form} patchForm={patchForm} />;
      case "home-type":
        return <HomeTypeStep form={form} patchForm={patchForm} />;
      case "style":
        return <StyleStep form={form} patchForm={patchForm} />;
      case "feel":
        return <FeelStep form={form} patchForm={patchForm} />;
      case "journey":
        return <JourneyStageStep form={form} patchForm={patchForm} />;
      case "range":
        return <RangePrioritiesStep form={form} patchForm={patchForm} />;
      case "architect-fee":
        return <ArchitectFeeStep form={form} patchForm={patchForm} />;
      case "inspiration":
        return <InspirationStep form={form} patchForm={patchForm} />;
      case "review":
        return (
          <ReviewStep
            form={form}
            patchForm={patchForm}
            onEditStep={goToStep}
            onSubmit={runSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bj-overlay max-h-screen" role="presentation">
      <div className="bj-overlay-panel" role="dialog" aria-modal="true">
        {!isSubmitting && (
          <button
            type="button"
            className="bj-close"
            onClick={handleClose}
            aria-label="Close build journey"
          >
            <X size={18} weight="bold" />
          </button>
        )}

        {isSubmitting ? (
          <SubmitVerificationScreen
            phase={submitPhase as SubmitVerificationPhase}
            projectName={submittedProjectName}
            submissionTrail={submissionTrail}
            loadingStep={loadingStep}
            errorMessage={submitError}
            onRetry={runSubmit}
            onContinue={handleSuccessContinue}
            onBackToReview={handleBackToReview}
          />
        ) : isWelcome ? (
          <WelcomeStep onBegin={goNext} />
        ) : (
          <BuildJourneyShell
            stepIndex={flowStep}
            flowStep={flowStep}
            flowTotal={flowTotal}
            title={copy.title}
            subtitle={copy.subtitle}
            onBack={goBack}
            onNext={step === "review" ? undefined : goNext}
            nextDisabled={!canNext}
            nextLabel={step === "inspiration" ? "Review" : "Next"}
            hideFooter={step === "review"}
          >
            {renderStep()}
          </BuildJourneyShell>
        )}
      </div>
    </div>
  );
}
