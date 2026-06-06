"use client";

import { X, Warning, Info, CheckCircle, XCircle } from "phosphor-react";
import type { ClientNotification } from "./types";

type ClientAlertsProps = {
  alerts: ClientNotification[];
  onDismiss: (id: string) => void;
  onAction: (alert: ClientNotification) => void;
};

const ICONS = {
  warning: Warning,
  info: Info,
  success: CheckCircle,
  error: XCircle,
};

export default function ClientAlerts({ alerts, onDismiss, onAction }: ClientAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="adash-alerts">
      {alerts.map((alert) => {
        const Icon = ICONS[alert.type];
        return (
          <div key={alert.id} className={`adash-alert adash-alert--${alert.type}`}>
            <Icon size={20} weight="bold" />
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
              {alert.actionLabel && (
                <button type="button" className="adash-link-btn" onClick={() => onAction(alert)}>
                  {alert.actionLabel}
                </button>
              )}
            </div>
            <button
              type="button"
              className="adash-icon-btn"
              aria-label="Dismiss alert"
              onClick={() => onDismiss(alert.id)}
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
