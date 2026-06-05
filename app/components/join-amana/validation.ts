import { MIN_ARTISAN_AGE, PASSWORD_MIN_LENGTH } from "./constants";
import type { ArtisanFormData, IdentityFiles } from "./types";

function formatDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getMaxDateOfBirth(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MIN_ARTISAN_AGE);
  return formatDateInput(date);
}

export function getMinDateOfBirth(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);
  return formatDateInput(date);
}

export function getDateOfBirthError(dateOfBirth: string): string | null {
  if (!dateOfBirth) return "Date of birth is required";

  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return "Enter a valid date of birth";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dob > today) return "Date of birth cannot be in the future";

  const minAgeDate = new Date();
  minAgeDate.setFullYear(minAgeDate.getFullYear() - MIN_ARTISAN_AGE);
  minAgeDate.setHours(0, 0, 0, 0);
  if (dob > minAgeDate) {
    return `You must be at least ${MIN_ARTISAN_AGE} years old`;
  }

  return null;
}

export function getPasswordError(password: string): string | null {
  if (!password.trim()) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

export function getConfirmPasswordError(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword.trim()) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function isProfileStepValid(form: ArtisanFormData): boolean {
  return (
    form.fullName.trim().length > 2 &&
    getDateOfBirthError(form.dateOfBirth) === null &&
    form.phone.trim().length > 5 &&
    getPasswordError(form.password) === null &&
    getConfirmPasswordError(form.password, form.confirmPassword) === null
  );
}

export function isTradeStepValid(form: ArtisanFormData): boolean {
  if (!form.category || !form.experience) return false;
  if (form.category === "other") {
    return form.otherTrade.trim().length > 2;
  }
  return true;
}

export function isLocationStepValid(form: ArtisanFormData): boolean {
  return form.area.trim().length > 2;
}

export function getNinError(nin: string): string | null {
  if (!nin.trim()) return "NIN is required";
  if (!/^\d{11}$/.test(nin)) return "NIN must be exactly 11 digits";
  return null;
}

export function getBvnError(bvn: string): string | null {
  if (!bvn.trim()) return "BVN is required";
  if (!/^\d{11}$/.test(bvn)) return "BVN must be exactly 11 digits";
  return null;
}

export function isIdentityStepValid(
  form: ArtisanFormData,
  files: IdentityFiles,
  identityConsent: boolean,
): boolean {
  return (
    getNinError(form.nin) === null &&
    getBvnError(form.bvn) === null &&
    files.governmentId !== null &&
    files.selfie !== null &&
    identityConsent
  );
}

export function isPhoneVerifyStepValid(otp: string[]): boolean {
  return otp.every((digit) => digit.length === 1);
}

export function formatNumericId(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}
