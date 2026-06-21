/*
 * Shared Tailwind className strings for the artisan dashboard.
 *
 * These replace the reused `.adash-btn`, `.adash-field`, `.adash-input`,
 * `.adash-modal*` CSS primitives during the deep CSS→Tailwind migration, so the
 * shared styles live in exactly one place instead of being duplicated across
 * the ~15 components that consume them. Compose with `clsx`-style template
 * strings, e.g. `className={`${adashBtn} ${adashBtnPrimary}`}`.
 *
 * Note: Tailwind preflight is disabled, so buttons must declare their own
 * border (`border-0` or an explicit border) and background.
 */

// Buttons — base has no border; each variant sets its own (see note above).
export const adashBtn =
  "inline-flex items-center justify-center px-[1.15rem] py-[0.7rem] rounded-full text-[0.88rem] font-extrabold transition-[transform,opacity] duration-300 enabled:hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed";
export const adashBtnPrimary =
  "border-0 text-white bg-[linear-gradient(135deg,var(--green),var(--green2))]";
export const adashBtnSecondary =
  "bg-white text-green border border-solid border-line";
export const adashBtnDanger =
  "bg-[#fff5f5] text-[#c53030] border border-solid border-[rgba(214,69,69,0.25)]";
export const adashBtnGhost =
  "bg-transparent text-muted border border-solid border-line";
export const adashBtnBlock = "w-full justify-center";

// Form fields
export const adashField = "grid gap-[0.45rem]";
export const adashLabel =
  "text-[0.72rem] font-extrabold tracking-[0.12em] uppercase text-green";
export const adashInput =
  "w-full border border-solid border-line rounded-[14px] px-4 py-[0.9rem] text-base text-text outline-none focus:border-green2 focus:shadow-[0_0_0_4px_rgba(0,107,50,0.12)]";
export const adashInputError = "border-[#d64545]";
export const adashFieldError = "m-0 text-[0.82rem] font-semibold text-[#c53030]";
export const adashLinkBtn =
  "justify-self-start border-0 bg-transparent text-green2 text-[0.85rem] font-extrabold cursor-pointer";

// Modal shell
export const adashModalOverlay =
  "fixed inset-0 z-[100] grid place-items-center p-5 bg-[rgba(6,43,24,0.45)] backdrop-blur-[4px]";
export const adashModal =
  "w-full max-w-[450px] p-6 rounded-[22px] bg-white border border-solid border-line shadow-brand-lg";
export const adashModalHeader = "flex justify-between items-center mb-3";
export const adashModalClose =
  "grid place-items-center w-8 h-8 border-0 rounded-[10px] bg-soft text-green";
export const adashModalActions = "flex gap-[0.65rem] justify-end mt-4";

// Section eyebrow (reused by the welcome header + wallet header)
export const adashEyebrow =
  "text-[0.82rem] font-extrabold tracking-[0.14em] uppercase text-green2";
