import type { ReactNode } from "react";
import ClientPanelEmptyIllustration, {
  type ClientEmptyIllustrationVariant,
} from "./ClientPanelEmptyIllustration";
import "./client-panel-empty.css";

type ClientPanelEmptyStateProps = {
  variant: ClientEmptyIllustrationVariant;
  title: string;
  message: string;
  note?: string;
  action?: ReactNode;
  compact?: boolean;
};

export default function ClientPanelEmptyState({
  variant,
  title,
  message,
  note,
  action,
  compact = false,
}: ClientPanelEmptyStateProps) {
  return (
    <div
      className={`cp-empty-state${compact ? " cp-empty-state--compact" : ""}`}
      role="status"
    >
      <ClientPanelEmptyIllustration variant={variant} />
      <h3>{title}</h3>
      <p>{message}</p>
      {note && <p className="cp-empty-state-note">{note}</p>}
      {action}
    </div>
  );
}
