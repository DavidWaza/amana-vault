import type { BuildJourneyForm } from "./types";
import {
  FEEL_OPTIONS,
  HOME_TYPE_OPTIONS,
  JOURNEY_STAGE_OPTIONS,
  PRIORITY_OPTIONS,
  PROJECT_RANGE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  labelForOption,
  labelForStyle,
} from "./constants";
import { labelForLandPrice } from "./land-data";
import { formatNaira } from "../utils";

export type BriefTrailStep = {
  id: string;
  label: string;
  value: string;
};

export type ProjectBriefTrail = {
  id: string;
  projectId: string;
  projectName: string;
  submittedAt: string;
  steps: BriefTrailStep[];
};

export function buildSubmissionTrail(form: BuildJourneyForm): BriefTrailStep[] {
  const steps: BriefTrailStep[] = [
    {
      id: "project-type",
      label: "Project type",
      value: labelForOption(PROJECT_TYPE_OPTIONS, form.projectType),
    },
    {
      id: "home-type",
      label: "Home type",
      value: labelForOption(HOME_TYPE_OPTIONS, form.homeType, "—"),
    },
    {
      id: "style",
      label: "Style",
      value: labelForStyle(form),
    },
    {
      id: "feel",
      label: "Home feel",
      value:
        form.feels.map((id) => labelForOption(FEEL_OPTIONS, id)).join(", ") || "—",
    },
  ];

  if (form.feelNotes.trim()) {
    steps.push({
      id: "feel-notes",
      label: "Feel notes",
      value: form.feelNotes.trim(),
    });
  }

  steps.push({
    id: "journey",
    label: "Journey stage",
    value: labelForOption(JOURNEY_STAGE_OPTIONS, form.journeyStage),
  });

  if (form.journeyStage === "own_land" && form.landDocuments.length) {
    steps.push({
      id: "land-docs",
      label: "Land ownership documents",
      value: form.landDocuments.map((doc) => `${doc.name} (${doc.kind})`).join(", "),
    });
  }

  if (form.journeyStage === "looking_for_land") {
    if (form.preferredLandState) {
      steps.push({
        id: "land-state",
        label: "Land search state",
        value: form.preferredLandState,
      });
    }
    if (form.landPriceRange) {
      steps.push({
        id: "land-price",
        label: "Land price range",
        value: labelForLandPrice(form.preferredLandState, form.landPriceRange),
      });
    }
  }

  steps.push(
    {
      id: "budget",
      label: "Project budget range",
      value: labelForOption(PROJECT_RANGE_OPTIONS, form.projectRange),
    },
    {
      id: "priorities",
      label: "Priorities",
      value:
        form.priorities.map((id) => labelForOption(PRIORITY_OPTIONS, id)).join(", ") ||
        "—",
    },
    {
      id: "architect-fee",
      label: "Architect fee",
      value:
        form.architectFeeType === "flat"
          ? form.architectFeeAmount
            ? formatNaira(form.architectFeeAmount)
            : "Flat fee"
          : `${form.architectFeePercent ?? 7.5}% of build cost`,
    },
  );

  if (form.inspirationImages.length || form.inspirationNote.trim() || form.voiceNoteAdded) {
    const parts: string[] = [];
    if (form.inspirationImages.length) {
      parts.push(`${form.inspirationImages.length} photo(s) uploaded`);
    }
    if (form.voiceNoteAdded) parts.push("Voice note attached");
    if (form.inspirationNote.trim()) {
      parts.push(`Note: ${form.inspirationNote.trim()}`);
    }
    steps.push({
      id: "inspiration",
      label: "Inspiration shared",
      value: parts.join(" · "),
    });
  }

  return steps;
}

export function createProjectBriefTrail(
  projectId: string,
  projectName: string,
  form: BuildJourneyForm,
  submittedAt: string,
): ProjectBriefTrail {
  return {
    id: `trail-${projectId}`,
    projectId,
    projectName,
    submittedAt,
    steps: buildSubmissionTrail(form),
  };
}
