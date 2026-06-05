import { Suspense } from "react";
import ArtisanDashboard from "../../components/artisan-dashboard/ArtisanDashboard";

export default function ArtisanDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ArtisanDashboard />
    </Suspense>
  );
}
