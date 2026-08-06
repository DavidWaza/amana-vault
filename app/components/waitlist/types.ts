export const WAITLIST_ROLES = [
  "client",
  "architect",
  "contractor",
  "artisan",
  "supplier",
  "partner",
  "other",
] as const;

export type WaitlistRole = (typeof WAITLIST_ROLES)[number];

export type WaitlistFormData = {
  fullName: string;
  email: string;
  phone: string;
  role: WaitlistRole | "";
  city: string;
  referralSource: string;
  message: string;
};

export type WaitlistTouchedState = {
  fullName: boolean;
  email: boolean;
  phone: boolean;
  role: boolean;
};

export type WaitlistFieldErrors = Partial<
  Record<keyof WaitlistTouchedState, string>
>;

/**
 * Shape accepted by `POST /api/waitlist`, alongside the honeypot field named
 * by `HONEYPOT_FIELD` in constants.ts, which must arrive empty.
 */
export type WaitlistSubmission = {
  fullName: string;
  email: string;
  phone?: string;
  role: WaitlistRole;
  city?: string;
  referralSource?: string;
  message?: string;
};

export type WaitlistSuccessResponse = {
  position: number;
  /** True when this email was already on the list. */
  alreadyJoined: boolean;
};

export type WaitlistErrorResponse = {
  error: string;
  fields?: WaitlistFieldErrors;
};
