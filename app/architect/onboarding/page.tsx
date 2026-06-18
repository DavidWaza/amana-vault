import { Suspense } from "react";
import ArchitectOnboardingPage from "../../components/architect-dashboard/ArchitectOnboardingPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ArchitectOnboardingPage />
    </Suspense>
  );
}
