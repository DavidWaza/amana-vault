"use client";

import { CircleNotch } from "phosphor-react";
import {
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  loadingLabel?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
};

export function Button({
  children,
  className = "",
  loading: loadingProp,
  loadingLabel,
  disabled,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = loadingProp ?? internalLoading;
  const isDisabled = disabled || loading;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled || !onClick) return;

    if (loadingProp !== undefined) {
      const result = onClick(event);
      if (result instanceof Promise) await result;
      return;
    }

    setInternalLoading(true);
    try {
      const result = onClick(event);
      if (result instanceof Promise) await result;
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <button
      type={type}
      className={`amana-btn${className ? ` ${className}` : ""}${loading ? " amana-btn--loading" : ""}`}
      disabled={isDisabled}
      onClick={onClick ? handleClick : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span
        className={`amana-btn__content${loading ? " amana-btn__content--hidden" : ""}`}
      >
        {children}
      </span>
      {loading && (
        <span className="amana-btn__loader" aria-hidden>
          <CircleNotch size={18} weight="bold" className="amana-btn__spinner" />
          {loadingLabel ? (
            <span className="amana-btn__loading-label">{loadingLabel}</span>
          ) : null}
        </span>
      )}
    </button>
  );
}
