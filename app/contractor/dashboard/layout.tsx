import type { ReactNode } from "react";
import { ContractorProfileProvider } from "../../components/contractor-dashboard/ContractorProfileProvider";

export default function ContractorDashboardLayout({ children }: { children: ReactNode }) {
  return <ContractorProfileProvider>{children}</ContractorProfileProvider>;
}
