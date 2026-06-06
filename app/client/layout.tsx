import type { ReactNode } from "react";
import { ClientProfileProvider } from "../components/client-dashboard/ClientProfileProvider";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <ClientProfileProvider>{children}</ClientProfileProvider>;
}
