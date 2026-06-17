import { Buildings, Wallet, Bell } from "phosphor-react";
import { formatNaira } from "./utils";
import VaultIcon from "../artisan-dashboard/VaultIcon";

type ClientStatsProps = {
  activeProjectCount: number;
  vaultProtected: number;
  fundsReleased: number;
  pendingActions: number;
};

export default function ClientStats({
  activeProjectCount,
  vaultProtected,
  fundsReleased,
  pendingActions,
}: ClientStatsProps) {
  const stats = [
    {
      label: "Active Projects",
      value: String(activeProjectCount),
      hint: "Builds in progress across Nigeria",
      icon: <Buildings size={24} weight="bold" />,
    },
    {
      label: "Total Vault Protected",
      value: formatNaira(vaultProtected),
      hint: "Funds secured in milestone vaults",
      icon: <VaultIcon size={28} />,
    },
    {
      label: "Funds Released",
      value: formatNaira(fundsReleased),
      hint: "Approved milestone payments",
      icon: <Wallet size={24} weight="bold" />,
    },
    {
      label: "Pending Actions",
      value: String(pendingActions),
      hint: pendingActions > 0 ? "Requires your attention" : "You're all caught up",
      icon: <Bell size={24} weight="bold" />,
    },
  ];

  return (
    <section className="adash-stats" aria-label="Project overview">
      {stats.map((stat) => (
        <article key={stat.label} className="adash-stat-card">
          <span className="adash-stat-icon">{stat.icon}</span>
          <div>
            <p className="adash-stat-label">{stat.label}</p>
            <p className="adash-stat-value">{stat.value}</p>
            <p className="adash-stat-hint">{stat.hint}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
