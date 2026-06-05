import { Briefcase, Hourglass, CheckCircle } from "phosphor-react";
import { formatNaira } from "./utils";
import VaultIcon from "./VaultIcon";

type ArtisanStatsProps = {
  secured: number;
  pendingRelease: number;
  released: number;
  activeCount: number;
  inviteCount: number;
};

export default function ArtisanStats({
  secured,
  pendingRelease,
  released,
  activeCount,
  inviteCount,
}: ArtisanStatsProps) {
  const stats = [
    {
      label: "Secured in Escrow",
      value: formatNaira(secured),
      hint: "Available for active jobs",
      icon: <VaultIcon size={28} />,
    },
    {
      label: "Pending Release",
      value: formatNaira(pendingRelease),
      hint: "Awaiting client approval",
      icon: <Hourglass size={24} weight="bold" />,
    },
    {
      label: "Total Paid Out",
      value: formatNaira(released),
      hint: "Successfully released",
      icon: <CheckCircle size={24} weight="bold" />,
    },
    {
      label: "Active Jobs",
      value: String(activeCount),
      hint: inviteCount > 0 ? `${inviteCount} new invite${inviteCount > 1 ? "s" : ""}` : "In progress",
      icon: <Briefcase size={24} weight="bold" />,
    },
  ];

  return (
    <section className="adash-stats" aria-label="Earnings overview">
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
