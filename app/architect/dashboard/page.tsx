import { Suspense } from "react";
import ArchitectDashboard from "../../components/architect-dashboard/ArchitectDashboard";

export default function ArchitectDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ArchitectDashboard />
    </Suspense>
  );
}
