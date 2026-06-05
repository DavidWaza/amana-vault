export const JOIN_STEPS = [
  { id: "profile", title: "Your profile", subtitle: "Tell us who you are" },
  { id: "trade", title: "Your trade", subtitle: "What services do you offer?" },
  { id: "location", title: "Your area", subtitle: "Where do you work?" },
  { id: "identity", title: "Verify identity", subtitle: "Confirm your government details" },
  { id: "verify", title: "Verify phone", subtitle: "Confirm your number" },
] as const;

export type JoinStepId = (typeof JOIN_STEPS)[number]["id"];

export type ArtisanFormData = {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  category: string;
  otherTrade: string;
  experience: string;
  bio: string;
  area: string;
  travelRadius: string;
  nin: string;
  bvn: string;
};

export type IdentityFiles = {
  governmentId: File | null;
  selfie: File | null;
};

export type JoinTouchedState = {
  dateOfBirth: boolean;
  password: boolean;
  confirmPassword: boolean;
  otherTrade: boolean;
  nin: boolean;
  bvn: boolean;
  governmentId: boolean;
  selfie: boolean;
};

export type ProfileStepData = Pick<
  ArtisanFormData,
  | "fullName"
  | "dateOfBirth"
  | "phone"
  | "email"
  | "password"
  | "confirmPassword"
>;

export type TradeStepData = Pick<
  ArtisanFormData,
  "category" | "otherTrade" | "experience" | "bio"
>;

export type LocationStepData = Pick<ArtisanFormData, "area" | "travelRadius">;

export type IdentityStepData = Pick<ArtisanFormData, "nin" | "bvn">;
