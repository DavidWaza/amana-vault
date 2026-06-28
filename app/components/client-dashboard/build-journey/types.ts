export type ArchitectFeeType = "flat" | "percentage";

export type LandDocument = {
  id: string;
  name: string;
  kind: string;
  dataUrl: string;
};

export type BuildJourneyForm = {
  projectType: string;
  homeType: string;
  style: string;
  customStyle: string;
  feels: string[];
  feelNotes: string;
  journeyStage: string;
  landDocuments: LandDocument[];
  preferredLandState: string;
  landPriceRange: string;
  projectRange: string;
  priorities: string[];
  architectFeeType: ArchitectFeeType;
  architectFeePercent: number | null;
  architectFeeAmount: number | null;
  inspirationImages: string[];
  inspirationNote: string;
  voiceNoteAdded: boolean;
};

export type BuildJourneyStep =
  | "welcome"
  | "project-type"
  | "home-type"
  | "style"
  | "feel"
  | "journey"
  | "range"
  | "architect-fee"
  | "inspiration"
  | "review";

export const BUILD_JOURNEY_STEPS: BuildJourneyStep[] = [
  "welcome",
  "project-type",
  "home-type",
  "style",
  "feel",
  "journey",
  "range",
  "architect-fee",
  "inspiration",
  "review",
];

export const EMPTY_BUILD_JOURNEY_FORM: BuildJourneyForm = {
  projectType: "",
  homeType: "",
  style: "",
  customStyle: "",
  feels: [],
  feelNotes: "",
  journeyStage: "",
  landDocuments: [],
  preferredLandState: "",
  landPriceRange: "",
  projectRange: "",
  priorities: [],
  architectFeeType: "percentage",
  architectFeePercent: 7.5,
  architectFeeAmount: null,
  inspirationImages: [],
  inspirationNote: "",
  voiceNoteAdded: false,
};
