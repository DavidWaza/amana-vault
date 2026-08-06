import type { Metadata } from "next";
import WaitlistPage from "@/app/components/waitlist/WaitlistPage";

export const metadata: Metadata = {
  title: "Join the Waitlist — Amana Vault",
  description:
    "Amana Vault opens to a founding group before public launch. Join the waitlist for early access, fast-tracked verification, and no platform fee on your first project.",
  openGraph: {
    title: "Join the Amana Vault Waitlist",
    description:
      "Be first through the Vault doors. Early access to Africa's construction escrow platform.",
    type: "website",
    locale: "en_NG",
    siteName: "Amana",
  },
};

export default function Page() {
  return <WaitlistPage />;
}
