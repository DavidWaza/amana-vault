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

  return (
    <section className="adash-alerts" aria-label="Important alerts">
      {alerts.map((alert) => (
        <div key={alert.id} className={`adash-alert adash-alert--${alert.type}`}>
          <div>
            <strong>{alert.title}</strong>
            <p>{alert.message}</p>
          </div>
          <div className="adash-alert-actions">
            {alert.actionLabel && (alert.actionHref || alert.actionType) && (
              onAction && alert.actionType ? (
                <button
                  type="button"
                  className="adash-alert-link"
                  onClick={() => onAction(alert)}
                >
                  {alert.actionLabel}
                </button>
              ) : (
                <a href={alert.actionHref} className="adash-alert-link">
                  {alert.actionLabel}
                </a>
              )
            )}
            {onDismiss && (
              <button
                type="button"
                className="adash-alert-dismiss"
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
