/*
 * Shared Tailwind className strings for the contractor portal.
 *
 * Follows the same deep CSS→Tailwind migration approach used by the artisan
 * dashboard's `ui.ts`: shared primitives live in one place and are composed via
 * template strings, e.g. `className={`${ctBtn} ${ctBtnPrimary}`}`.
 *
 * The contractor portal's accent is amber/bronze (`--contractor*`), distinct
 * from artisan forest-green, client teal, and architect teal. Tailwind preflight
 * is disabled, so every button declares its own border + background.
 */

// Buttons — base has no border; each variant sets its own.
export const ctBtn =
  "inline-flex items-center justify-center gap-2 px-[1.15rem] py-[0.7rem] rounded-full text-[0.88rem] font-extrabold transition-[transform,opacity] duration-300 enabled:hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed";
export const ctBtnPrimary =
  "border-0 text-white bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))]";
export const ctBtnSecondary =
  "bg-white text-contractor border border-solid border-contractor-line";
export const ctBtnGhost = "bg-transparent text-muted border border-solid border-line";
export const ctBtnDanger =
  "bg-[#fff5f5] text-[#c53030] border border-solid border-[rgba(214,69,69,0.25)]";
export const ctBtnBlock = "w-full justify-center";
export const ctBtnSm = "px-[0.85rem] py-[0.5rem] text-[0.8rem]";

// Cards / panels
export const ctCard =
  "rounded-brand bg-white border border-solid border-line shadow-brand-sm";
export const ctPanel =
  "p-5 rounded-brand bg-white border border-solid border-line shadow-brand-sm";

// Form fields
export const ctField = "grid gap-[0.45rem]";
export const ctLabel =
  "text-[0.72rem] font-extrabold tracking-[0.12em] uppercase text-contractor";
export const ctInput =
  "w-full border border-solid border-line rounded-[14px] px-4 py-[0.9rem] text-base text-text bg-white outline-none focus:border-contractor2 focus:shadow-[0_0_0_4px_rgba(180,83,9,0.14)]";
export const ctInputError = "border-[#d64545]";
export const ctFieldError = "m-0 text-[0.82rem] font-semibold text-[#c53030]";

// Modal shell
export const ctModalOverlay =
  "fixed inset-0 z-[100] grid place-items-center p-5 bg-[rgba(6,43,24,0.45)] backdrop-blur-[4px]";
export const ctModal =
  "w-full max-w-[520px] max-h-[calc(100dvh-2.5rem)] overflow-y-auto p-6 rounded-[22px] bg-white border border-solid border-line shadow-brand-lg";
export const ctModalHeader = "flex justify-between items-start gap-3 mb-4";
export const ctModalClose =
  "shrink-0 grid place-items-center w-8 h-8 border-0 rounded-[10px] bg-contractor-soft text-contractor";
export const ctModalActions = "flex gap-[0.65rem] justify-end mt-5";

// Segmented tabs
export const ctTabs = "flex flex-wrap gap-2";
export const ctTab =
  "inline-flex items-center gap-[0.45rem] px-4 py-[0.65rem] rounded-full border border-solid text-[0.88rem] font-extrabold transition-all duration-300";
export const ctTabActive =
  "bg-[linear-gradient(135deg,var(--contractor),var(--contractor2))] border-contractor text-white";
export const ctTabInactive = "bg-white border-line text-muted";
// Compact tab/chip — used for the artisan marketplace trade filters.
export const ctTabSm = "px-[0.7rem] py-[0.4rem] text-[0.78rem]";
export const ctTabCount =
  "min-w-[1.35rem] h-[1.35rem] px-[0.35rem] rounded-full bg-white/20 text-[0.72rem] grid place-items-center";

// Icon button + badge
export const ctIconBtn =
  "relative grid place-items-center w-10 h-10 rounded-xl border border-solid transition-[border-color,background] duration-300 text-contractor";
export const ctIconBtnActive = "border-contractor2 bg-contractor-soft";
export const ctIconBtnInactive = "border-line bg-white";
export const ctIconBadge =
  "absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-contractor2 text-white text-[0.65rem] font-extrabold grid place-items-center";

export const ctEyebrow =
  "text-[0.82rem] font-extrabold tracking-[0.14em] uppercase text-contractor2";

// Status badge tones (shared by milestones, projects, marketplace).
export type BadgeTone = "muted" | "progress" | "warning" | "secure" | "success" | "danger";

export const ctBadge =
  "inline-flex items-center gap-[0.3rem] px-[0.6rem] py-[0.25rem] rounded-full text-[0.68rem] font-extrabold uppercase tracking-[0.04em]";

export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  muted: "bg-[rgba(91,107,96,0.1)] text-muted",
  progress: "bg-[rgba(180,83,9,0.12)] text-contractor2",
  warning: "bg-[rgba(244,163,0,0.16)] text-[#b7791f]",
  secure: "bg-[rgba(0,107,50,0.12)] text-green2",
  success: "bg-[rgba(0,166,81,0.14)] text-green2",
  danger: "bg-[rgba(214,69,69,0.12)] text-[#c53030]",
};
