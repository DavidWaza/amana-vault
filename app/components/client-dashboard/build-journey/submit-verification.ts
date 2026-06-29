const VERIFY_STEP_MS = 700;

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Demo helper: append `?submitFail=1` to the dashboard URL to force a failed submit. */
export function shouldSimulateSubmitFailure() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("submitFail") === "1";
}

export async function runSubmitVerification(
  onStep: (step: number) => void,
  submit: () => Promise<void>,
) {
  onStep(0);
  await delay(VERIFY_STEP_MS);
  onStep(1);
  await delay(VERIFY_STEP_MS);

  if (shouldSimulateSubmitFailure()) {
    await delay(VERIFY_STEP_MS);
    throw new Error(
      "The marketplace is temporarily unavailable. Please try again in a moment.",
    );
  }

  await submit();
  onStep(2);
  await delay(VERIFY_STEP_MS);
  onStep(3);
}
