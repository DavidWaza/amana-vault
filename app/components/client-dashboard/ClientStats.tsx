import { ShieldCheck, Hourglass, Wallet, Briefcase } from "phosphor-react";
import { formatNaira } from "./utils";
import VaultIcon from "../artisan-dashboard/VaultIcon";

type ClientStatsProps = {
  secured: number;
  pendingApproval: number;
  pendingFunding: number;
  activeCount: number;
  pendingReleaseTotal: number;
};

export default function ClientStats({
  secured,
  pendingApproval,
  pendingFunding,
  activeCount,
  pendingReleaseTotal,
}: ClientStatsProps) {
  const stats = [
    {
      label: "Secured in Escrow",
      value: formatNaira(secured),
      hint: "Protected across active jobs",
      icon: <VaultIcon size={28} />,
    },
    {
      label: "Awaiting Your Action",
      value: formatNaira(pendingApproval + pendingFunding + pendingReleaseTotal),
      hint: `${activeCount} active job${activeCount === 1 ? "" : "s"}`,
      icon: <Hourglass size={24} weight="bold" />,
    },
    {
      label: "Pending Funding",
      value: formatNaira(pendingFunding),
      hint: "Agreements awaiting payment",
      icon: <Wallet size={24} weight="bold" />,
    },
    {
      label: "Active Jobs",
      value: String(activeCount),
      hint: pendingReleaseTotal > 0 ? "Release approval needed" : "In progress",
      icon: <Briefcase size={24} weight="bold" />,
    },
  ];

  return (
    <section className="adash-stats" aria-label="Protection overview">
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
