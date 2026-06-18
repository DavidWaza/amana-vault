import type { ReactNode } from "react";
import { ArchitectProfileProvider } from "../../components/architect-dashboard/ArchitectProfileProvider";

export default function ArchitectDashboardLayout({ children }: { children: ReactNode }) {
  return <ArchitectProfileProvider>{children}</ArchitectProfileProvider>;
}
