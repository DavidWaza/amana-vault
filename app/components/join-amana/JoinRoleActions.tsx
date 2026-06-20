"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CaretRight,
  CaretDown,
  PenNib,
  Wrench,
  Buildings,
  Users,
} from "phosphor-react";
import type { ProfessionalRole } from "./types";

const PROFESSIONAL_OPTIONS: {
  id: ProfessionalRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "architect",
    label: "Architect",
    description: "Design plans, BOQs & milestone deliverables",
    icon: <PenNib size={20} weight="duotone" />,
  },
  {
    id: "artisan",
    label: "Artisan",
    description: "Verified trades & secured gig payments",
    icon: <Wrench size={20} weight="duotone" />,
  },
  {
    id: "contractor",
    label: "Contractor",
    description: "Lead builds, bids & construction teams",
    icon: <Buildings size={20} weight="duotone" />,
  },
];

type JoinRoleActionsProps = {
  onJoinAsClient: () => void;
  onJoinAsProfessional: (role: ProfessionalRole) => void;
  menuPlacement?: "up" | "down";
  className?: string;
};

export default function JoinRoleActions({
  onJoinAsClient,
  onJoinAsProfessional,
  menuPlacement = "up",
  className = "",
}: JoinRoleActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setMenuOpen(true);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setMenuOpen(false);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setMenuOpen(false), 140);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const handleSelectRole = (role: ProfessionalRole) => {
    closeMenu();
    onJoinAsProfessional(role);
  };

  return (
    <div className={`join-amana-hero-cta-content ${className}`.trim()}>
      <button type="button" className="join-btn-primary" onClick={onJoinAsClient}>
        Join as Client
        <CaretRight size={16} weight="bold" />
      </button>

      <div
        ref={menuRef}
        className={`join-pro-dropdown${menuOpen ? " join-pro-dropdown--open" : ""}`}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          className="join-btn-secondary join-pro-trigger"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="join-pro-menu-actions"
          onClick={() => (menuOpen ? closeMenu() : openMenu())}
        >
          <Users size={16} weight="bold" />
          Join as Professional
          <CaretDown
            size={14}
            weight="bold"
            className={`join-pro-caret${menuOpen ? " join-pro-caret--open" : ""}`}
          />
        </button>

        <div
          id="join-pro-menu-actions"
          className={`join-pro-menu join-pro-menu--${menuPlacement}`}
          role="menu"
          aria-label="Choose professional type"
        >
          {PROFESSIONAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitem"
              className="join-pro-menu-item"
              onClick={() => handleSelectRole(option.id)}
            >
              <span className="join-pro-menu-icon">{option.icon}</span>
              <span className="join-pro-menu-text">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </span>
              <CaretRight size={14} weight="bold" className="join-pro-menu-arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
