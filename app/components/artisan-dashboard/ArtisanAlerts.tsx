"use client";

import type { DashboardAlert } from "./types";

type ArtisanAlertsProps = {
  alerts: DashboardAlert[];
  onDismiss?: (id: string) => void;
  onAction?: (alert: DashboardAlert) => void;
};

export default function ArtisanAlerts({
  alerts,
  onDismiss,
  onAction,
}: ArtisanAlertsProps) {
  if (alerts.length === 0) return null;

  const card =
    "flex flex-wrap items-center justify-between gap-3 px-[1.1rem] py-[0.9rem] rounded-2xl border border-solid";
  const toneCard: Record<string, string> = {
    warning: "border-[rgba(244,163,0,0.3)] bg-gold-soft",
    info: "border-line bg-soft",
    success: "border-line bg-white",
    error: "border-line bg-white",
  };
  const linkClass =
    "border-0 bg-transparent p-0 text-[0.85rem] font-extrabold text-green2 cursor-pointer underline";

  return (
    <section className="grid gap-[0.65rem]" aria-label="Important alerts">
      {alerts.map((alert) => (
        <div key={alert.id} className={`${card} ${toneCard[alert.type]}`}>
          <div>
            <strong className="block text-[0.9rem] text-green">
              {alert.title}
            </strong>
            <p className="mt-[0.2rem] text-[0.85rem] text-muted">
              {alert.message}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {alert.actionLabel && (alert.actionHref || alert.actionType) && (
              onAction && alert.actionType ? (
                <button
                  type="button"
                  className={linkClass}
                  onClick={() => onAction(alert)}
                >
                  {alert.actionLabel}
                </button>
              ) : (
                <a href={alert.actionHref} className={linkClass}>
                  {alert.actionLabel}
                </a>
              )
            )}
            {onDismiss && (
              <button
                type="button"
                className="border-0 bg-transparent text-muted text-[0.82rem] font-bold cursor-pointer"
                onClick={() => onDismiss(alert.id)}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
