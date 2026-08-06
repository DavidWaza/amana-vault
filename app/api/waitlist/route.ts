import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/app/lib/supabase-admin";
import { normalizePhoneInput } from "@/app/lib/phone";
import {
  HONEYPOT_FIELD,
  MESSAGE_MAX_LENGTH,
} from "@/app/components/waitlist/constants";
import {
  getWaitlistErrors,
  normalizeEmail,
} from "@/app/components/waitlist/validation";
import type {
  WaitlistErrorResponse,
  WaitlistFormData,
  WaitlistSuccessResponse,
} from "@/app/components/waitlist/types";

/** Postgres unique_violation — the email is already on the list. */
const UNIQUE_VIOLATION = "23505";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Empty strings become null so optional columns stay clean. */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json<WaitlistErrorResponse>(
      { error: "The waitlist isn't available right now. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<WaitlistErrorResponse>(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const payload = (body ?? {}) as Record<string, unknown>;

  // Honeypot: hidden from real users, so a value here suggests a bot. It is
  // only a heuristic — browser autofill and password managers have been known
  // to fill hidden fields for real people — so the row is still saved, just
  // flagged for review. Silently discarding would lose genuine signups.
  const honeypot = asString(payload[HONEYPOT_FIELD]).trim();
  const status = honeypot ? "spam" : "pending";

  if (honeypot) {
    console.warn(
      `[waitlist] honeypot filled with ${JSON.stringify(honeypot)} — saving with status=spam for review`,
    );
  }

  const form: WaitlistFormData = {
    fullName: asString(payload.fullName).trim(),
    email: normalizeEmail(asString(payload.email)),
    phone: normalizePhoneInput(asString(payload.phone)),
    role: asString(payload.role) as WaitlistFormData["role"],
    city: asString(payload.city).trim(),
    referralSource: asString(payload.referralSource).trim(),
    message: asString(payload.message).trim().slice(0, MESSAGE_MAX_LENGTH),
  };

  // Re-validate server-side; the client checks are for feedback only.
  const fields = getWaitlistErrors(form);
  if (Object.keys(fields).length > 0) {
    return NextResponse.json<WaitlistErrorResponse>(
      { error: "Please check the highlighted fields.", fields },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      full_name: form.fullName,
      email: form.email,
      phone: orNull(form.phone),
      role: form.role,
      city: orNull(form.city),
      referral_source: orNull(form.referralSource),
      message: orNull(form.message),
      status,
    })
    .select("position")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      const { data: existing } = await supabase
        .from("waitlist")
        .select("position")
        .eq("email", form.email)
        .single();

      return NextResponse.json<WaitlistSuccessResponse>(
        { position: existing?.position ?? 0, alreadyJoined: true },
        { status: 200 },
      );
    }

    console.error("[waitlist] insert failed", error);
    return NextResponse.json<WaitlistErrorResponse>(
      { error: "We couldn't add you to the waitlist. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json<WaitlistSuccessResponse>(
    { position: data.position, alreadyJoined: false },
    { status: 201 },
  );
}
