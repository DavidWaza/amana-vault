import { isValidPhoneDigits } from "@/app/lib/phone";
import {
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "./constants";
import {
  WAITLIST_ROLES,
  type WaitlistFieldErrors,
  type WaitlistFormData,
  type WaitlistRole,
} from "./types";

/** Mirrors the `waitlist_email_format` check constraint on the table. */
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getFullNameError(fullName: string): string | null {
  const trimmed = fullName.trim();
  if (!trimmed) return "Your name is required";
  if (trimmed.length < NAME_MIN_LENGTH) return "Enter your full name";
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `Name must be under ${NAME_MAX_LENGTH} characters`;
  }
  return null;
}

export function getEmailError(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email address is required";
  if (trimmed.length > EMAIL_MAX_LENGTH) return "That email is too long";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
  return null;
}

/** Phone is optional — only validated once something has been typed. */
export function getPhoneError(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  if (!isValidPhoneDigits(trimmed)) return "Enter a valid 11-digit phone number";
  return null;
}

export function getRoleError(role: string): string | null {
  if (!role) return "Select the option that describes you";
  if (!isWaitlistRole(role)) return "Select a valid option";
  return null;
}

export function getMessageError(message: string): string | null {
  if (message.trim().length > MESSAGE_MAX_LENGTH) {
    return `Keep it under ${MESSAGE_MAX_LENGTH} characters`;
  }
  return null;
}

export function isWaitlistRole(value: unknown): value is WaitlistRole {
  return (
    typeof value === "string" &&
    (WAITLIST_ROLES as readonly string[]).includes(value)
  );
}

/**
 * Single source of truth for waitlist validation — run in the browser for
 * inline feedback and again in the route handler, which never trusts the client.
 */
export function getWaitlistErrors(form: WaitlistFormData): WaitlistFieldErrors {
  const errors: WaitlistFieldErrors = {};

  const fullName = getFullNameError(form.fullName);
  if (fullName) errors.fullName = fullName;

  const email = getEmailError(form.email);
  if (email) errors.email = email;

  const phone = getPhoneError(form.phone);
  if (phone) errors.phone = phone;

  const role = getRoleError(form.role);
  if (role) errors.role = role;

  return errors;
}

export function isWaitlistFormValid(form: WaitlistFormData): boolean {
  return Object.keys(getWaitlistErrors(form)).length === 0;
}
