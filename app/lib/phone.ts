export const PHONE_DIGIT_LENGTH = 11;

export function normalizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LENGTH);
}

export function isValidPhoneDigits(value: string): boolean {
  return /^\d{11}$/.test(value);
}
