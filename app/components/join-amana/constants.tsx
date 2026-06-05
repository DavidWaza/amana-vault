import {
  ShieldCheck,
  CurrencyCircleDollar,
  UsersThree,
} from "phosphor-react";
import type { ArtisanFormData, IdentityFiles, JoinTouchedState } from "./types";

export const VERIFICATION_CHECKS = [
  "NIN matches user details",
  "BVN matches account holder",
  "Selfie matches ID photo",
  "Phone & email verified",
  "No duplicate account exists",
] as const;

export const TRUST_POINTS = [
  { icon: <UsersThree size={20} weight="bold" />, label: "Verified Clients" },
  { icon: <ShieldCheck size={20} weight="bold" />, label: "Escrow Protection" },
  { icon: <CurrencyCircleDollar size={20} weight="bold" />, label: "Guaranteed Payments" },
];

export const INITIAL_FORM: ArtisanFormData = {
  fullName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  category: "",
  otherTrade: "",
  experience: "",
  bio: "",
  area: "",
  travelRadius: "",
  nin: "",
  bvn: "",
};

export const INITIAL_IDENTITY_FILES: IdentityFiles = {
  governmentId: null,
  selfie: null,
};

export const INITIAL_TOUCHED: JoinTouchedState = {
  dateOfBirth: false,
  password: false,
  confirmPassword: false,
  otherTrade: false,
  nin: false,
  bvn: false,
  governmentId: false,
  selfie: false,
};

export const PASSWORD_MIN_LENGTH = 8;
export const MIN_ARTISAN_AGE = 18;
