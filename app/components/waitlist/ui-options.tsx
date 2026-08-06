/*
 * Icon-bearing options for the waitlist UI. Kept apart from constants.ts so the
 * route handler never pulls React components into the server bundle.
 */
import {
  Buildings,
  DotsThreeCircle,
  Handshake,
  HouseLine,
  PenNib,
  Truck,
} from "phosphor-react";
import { HammerIcon, HardHatIcon } from "@phosphor-icons/react";
import type { WaitlistRole } from "./types";

export const ROLE_OPTIONS: {
  value: WaitlistRole;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "client",
    label: "Client",
    hint: "I'm building",
    icon: <HouseLine size={20} weight="fill" />,
  },
  {
    value: "architect",
    label: "Architect",
    hint: "I design it",
    icon: <PenNib size={20} weight="fill" />,
  },
  {
    value: "contractor",
    label: "Contractor",
    hint: "I build it",
    icon: <HardHatIcon size={20} weight="fill" />,
  },
  {
    value: "artisan",
    label: "Artisan",
    hint: "I craft it",
    icon: <HammerIcon size={20} weight="fill" />,
  },
  {
    value: "supplier",
    label: "Supplier",
    hint: "I supply materials",
    icon: <Truck size={20} weight="fill" />,
  },
  {
    value: "partner",
    label: "Partner",
    hint: "Bank, body or institute",
    icon: <Handshake size={20} weight="fill" />,
  },
  {
    value: "other",
    label: "Something else",
    hint: "Tell us below",
    icon: <DotsThreeCircle size={20} weight="fill" />,
  },
];

export const WAITLIST_TRUST_POINTS: { icon: React.ReactNode; label: string }[] = [
  {
    icon: <Buildings size={18} weight="fill" />,
    label: "Early access before public launch",
  },
  {
    icon: <Handshake size={18} weight="fill" />,
    label: "Founding-member verification, fast-tracked",
  },
  {
    icon: <HouseLine size={18} weight="fill" />,
    label: "Zero platform fees on your first project",
  },
];
