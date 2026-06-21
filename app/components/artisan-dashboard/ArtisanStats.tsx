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
    <section
      className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[768px]:grid-cols-1"
      aria-label="Earnings overview"
    >
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="flex gap-[0.85rem] px-[1.2rem] py-[1.15rem] rounded-[20px] bg-white border border-solid border-line shadow-brand-sm"
        >
          <span className="grid place-items-center w-11 h-11 rounded-[14px] bg-soft text-green2 shrink-0">
            {stat.icon}
          </span>
          <div>
            <p className="m-0 text-[0.78rem] font-extrabold tracking-[0.06em] uppercase text-muted">
              {stat.label}
            </p>
            <p className="mt-[0.2rem] text-[1.35rem] font-black text-green tracking-[-0.02em]">
              {stat.value}
            </p>
            <p className="mt-[0.15rem] text-[0.8rem] text-muted">{stat.hint}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
