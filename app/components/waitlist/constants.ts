/*
 * Pure constants — no JSX, no React imports.
 *
 * The route handler at app/api/waitlist/route.ts imports from here (via
 * validation.ts), so this module must stay free of component code. Anything
 * that renders an icon belongs in ui-options.tsx instead.
 */
import type { WaitlistFormData, WaitlistTouchedState } from "./types";

/**
 * Name of the hidden anti-bot field. Deliberately meaningless: semantic names
 * like "website" or "url" get filled in by browser autofill and password
 * managers, which silently drops real signups as though they were bots.
 */
export const HONEYPOT_FIELD = "hpContactRef";

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 120;
export const EMAIL_MAX_LENGTH = 254;
export const MESSAGE_MAX_LENGTH = 500;

export const INITIAL_FORM: WaitlistFormData = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  city: "",
  referralSource: "",
  message: "",
};

export const INITIAL_TOUCHED: WaitlistTouchedState = {
  fullName: false,
  email: false,
  phone: false,
  role: false,
};

export const CITY_OPTIONS = [
  "Abuja",
  "Lagos",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Benin City",
  "Enugu",
  "Kaduna",
  "Uyo",
  "Calabar",
  "Jos",
  "Warri",
  "Elsewhere in Nigeria",
  "Outside Nigeria",
];

export const REFERRAL_OPTIONS = [
  "A friend or colleague",
  "Instagram",
  "X (Twitter)",
  "LinkedIn",
  "Facebook",
  "Google search",
  "An event or meetup",
  "A professional body",
  "Somewhere else",
];
