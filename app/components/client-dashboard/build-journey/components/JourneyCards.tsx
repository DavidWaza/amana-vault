"use client";

import type { ReactNode } from "react";
import { Check } from "phosphor-react";

type SelectableProps = {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

function SelectableCard({
  selected,
  onClick,
  children,
  className = "",
}: SelectableProps) {
  return (
    <button
      type="button"
      className={`bj-card${selected ? " bj-card--selected" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

export function IconOptionCard({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  description?: string;
}) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onClick}
      className="bj-card--icon"
    >
      <span className="bj-card-icon">{icon}</span>
      <span className="bj-card-copy">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
    </SelectableCard>
  );
}

export function ImageOptionCard({
  selected,
  onClick,
  image,
  label,
  description,
}: {
  selected?: boolean;
  onClick: () => void;
  image: string;
  label: string;
  description?: string;
}) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onClick}
      className="bj-card--image"
    >
      <span
        className="bj-card-image"
        style={{ backgroundImage: `url(${image})` }}
        role="img"
        aria-label={label}
      />
      <span className="bj-card-copy">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
    </SelectableCard>
  );
}

export function FeelChipCard({
  selected,
  onClick,
  label,
}: {
  selected?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onClick}
      className="bj-card--feel"
    >
      <span className="bj-feel-dot" />
      <strong>{label}</strong>
    </SelectableCard>
  );
}

export function RangeCard({
  selected,
  onClick,
  label,
  description,
}: {
  selected?: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onClick}
      className="bj-card--range"
    >
      <strong>{label}</strong>
      {description && <span>{description}</span>}
    </SelectableCard>
  );
}

export function PriorityCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`bj-check${checked ? " bj-check--on" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span className="bj-check-box">{checked && <Check size={12} weight="bold" />}</span>
      <span>{label}</span>
    </button>
  );
}

export function FeeToggleCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected?: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onClick}
      className="bj-card--fee"
    >
      <strong>{title}</strong>
      <span>{description}</span>
    </SelectableCard>
  );
}

export function PercentPill({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`bj-percent${selected ? " bj-percent--selected" : ""}`}
      onClick={onClick}
    >
      {value}%
    </button>
  );
}
