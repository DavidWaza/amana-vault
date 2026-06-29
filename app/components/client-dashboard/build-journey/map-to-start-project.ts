import type { StartProjectForm } from "../types";
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

const PROJECT_TYPE_CATEGORY: Record<string, StartProjectForm["buildingCategory"]> = {
  family_home: "residential",
  apartments: "residential",
  commercial: "commercial",
  hospitality: "commercial",
  renovation: "residential",
  community: "community",
  something_else: "residential",
};

const HOME_TYPE_MAP: Record<string, StartProjectForm["buildingType"]> = {
  duplex: "duplex",
  bungalow: "bungalow",
  villa: "mansion",
  apartments: "rental_property",
  investment: "rental_property",
  multi_family: "family_compound",
  not_sure: "bungalow",
};

const JOURNEY_START_STAGE: Record<string, StartProjectForm["startStage"]> = {
  own_land: "need_architect",
  looking_for_land: "need_architect",
  only_design: "need_architect",
  have_drawings: "have_drawings",
  have_contractor: "have_contractor",
};

const JOURNEY_LAND_STATUS: Record<string, StartProjectForm["landStatus"]> = {
  own_land: "own",
  looking_for_land: "need_assistance",
  only_design: "own",
  have_drawings: "own",
  have_contractor: "own",
};

function buildDescription(form: BuildJourneyForm): string {
  const feels = form.feels
    .map((id) => labelForOption(FEEL_OPTIONS, id))
    .filter(Boolean)
    .join(", ");

  const priorities = form.priorities
    .map((id) => labelForOption(PRIORITY_OPTIONS, id))
    .filter(Boolean)
    .join(", ");

  const fee =
    form.architectFeeType === "flat"
      ? form.architectFeeAmount
        ? `Flat architect fee: ₦${form.architectFeeAmount.toLocaleString("en-NG")}`
        : "Flat architect fee"
      : `${form.architectFeePercent ?? 7.5}% of overall build cost`;

  const lines = [
    `Project type: ${labelForOption(PROJECT_TYPE_OPTIONS, form.projectType)}`,
    `Home type: ${labelForOption(HOME_TYPE_OPTIONS, form.homeType, "Not sure yet")}`,
    `Style: ${labelForStyle(form)}`,
    feels ? `Desired feel: ${feels}` : null,
    form.feelNotes.trim() ? `Additional notes: ${form.feelNotes.trim()}` : null,
    `Journey stage: ${labelForOption(JOURNEY_STAGE_OPTIONS, form.journeyStage)}`,
    form.journeyStage === "own_land" && form.landDocuments.length
      ? `Land documents submitted: ${form.landDocuments.map((doc) => doc.name).join(", ")}`
      : null,
    form.journeyStage === "looking_for_land" && form.preferredLandState
      ? `Land search state: ${form.preferredLandState}`
      : null,
    form.journeyStage === "looking_for_land" && form.landPriceRange
      ? `Land budget range: ${labelForLandPrice(form.preferredLandState, form.landPriceRange)}`
      : null,
    `Budget range: ${labelForOption(PROJECT_RANGE_OPTIONS, form.projectRange)}`,
    priorities ? `Priorities: ${priorities}` : null,
    `Architect fee preference: ${fee}`,
    form.inspirationNote.trim()
      ? `Message to architect: ${form.inspirationNote.trim()}`
      : null,
    form.inspirationImages.length
      ? `Inspiration uploads: ${form.inspirationImages.length} image(s)`
      : null,
    form.voiceNoteAdded ? "Voice note attached." : null,
  ].filter(Boolean);

  return lines.join("\n");
}

function buildProjectName(form: BuildJourneyForm): string {
  const home = labelForOption(HOME_TYPE_OPTIONS, form.homeType, "Dream Home");
  const type = labelForOption(PROJECT_TYPE_OPTIONS, form.projectType, "Build");
  return `${home} ${type}`.replace("Not sure yet", "Dream");
}

export function mapBuildJourneyToStartProject(
  form: BuildJourneyForm,
): StartProjectForm {
  const landState =
    form.journeyStage === "looking_for_land" ? form.preferredLandState : "";

  return {
    buildingCategory: PROJECT_TYPE_CATEGORY[form.projectType] ?? "residential",
    buildingType: HOME_TYPE_MAP[form.homeType] ?? "bungalow",
    country: "Nigeria",
    state: landState,
    city: landState ? "To be confirmed" : "",
    address: "To be confirmed",
    landStatus: JOURNEY_LAND_STATUS[form.journeyStage] ?? "need_assistance",
    projectName: buildProjectName(form),
    description: buildDescription(form),
    startStage: JOURNEY_START_STAGE[form.journeyStage] ?? "need_architect",
  };
}

function journeyStepComplete(form: BuildJourneyForm): boolean {
  if (!form.journeyStage) return false;
  if (form.journeyStage === "own_land") return form.landDocuments.length > 0;
  if (form.journeyStage === "looking_for_land") {
    return !!form.preferredLandState && !!form.landPriceRange;
  }
  return true;
}

export function canProceedStep(stepIndex: number, form: BuildJourneyForm): boolean {
  switch (stepIndex) {
    case 0:
      return true;
    case 1:
      return !!form.projectType;
    case 2:
      return !!form.homeType;
    case 3:
      return form.style === "custom"
        ? form.customStyle.trim().length > 2
        : !!form.style;
    case 4:
      return form.feels.length > 0;
    case 5:
      return journeyStepComplete(form);
    case 6:
      return !!form.projectRange;
    case 7:
      return form.architectFeeType === "flat"
        ? form.architectFeeAmount !== null && form.architectFeeAmount > 0
        : form.architectFeePercent !== null;
    case 8:
      return true;
    case 9:
      return true;
    default:
      return false;
  }
}
