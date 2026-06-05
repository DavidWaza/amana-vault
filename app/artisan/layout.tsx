import type { ReactNode } from "react";
import { ArtisanProfileProvider } from "../components/artisan-dashboard/ArtisanProfileProvider";

export default function ArtisanLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ArtisanProfileProvider>{children}</ArtisanProfileProvider>;
}
