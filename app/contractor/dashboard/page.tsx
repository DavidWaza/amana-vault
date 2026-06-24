import { Suspense } from "react";
import ContractorDashboard from "../../components/contractor-dashboard/ContractorDashboard";

export default function ContractorDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ContractorDashboard />
    </Suspense>
  );
}
