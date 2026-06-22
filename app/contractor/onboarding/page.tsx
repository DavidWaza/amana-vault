import { Suspense } from "react";
import ContractorOnboardingPage from "../../components/contractor-dashboard/ContractorOnboardingPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContractorOnboardingPage />
    </Suspense>
  );
}
