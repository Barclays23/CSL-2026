import type { TeamSquadStats } from "@/types/team.types";
import { formatCurrency } from "@/utils/formatCurrency";

export function TeamStats({ stats }: { stats: TeamSquadStats }) {
  const items = [
    ["Budget", formatCurrency(stats.auctionBudget)],
    ["Purchase cost", formatCurrency(stats.purchaseCost)],
    ["Remaining", formatCurrency(stats.remainingBalance)],
    ["Players", `${stats.playerCount} / ${stats.maxPlayers}`],
    ["Slots left", String(stats.remainingSlots)],
    ["Average", formatCurrency(stats.averagePurchaseCost)],
    ["Icons", `${stats.iconPlayerCount} / ${stats.requiredIcons}`],
    ["Goalkeepers", `${stats.goalkeeperCount} / ${stats.requiredGoalkeepers}`],
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-control border border-line bg-glass-strong px-3 py-2">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-1 text-sm font-semibold tabular text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
