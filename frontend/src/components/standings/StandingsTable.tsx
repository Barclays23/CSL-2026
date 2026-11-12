import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/Avatar";
import type { GroupStanding } from "@/types/statistics.types";

export function StandingsTable({ group }: { group: GroupStanding }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr>
            {["#", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((column) => (
              <th key={column} className="px-2 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => (
            <tr key={row.team._id} className={row.qualified ? "bg-primary/10" : undefined}>
              <td className="px-2 py-3 tabular text-muted">{row.position}</td>
              <td className="px-2 py-3">
                <Link to="/teams/$teamId" params={{ teamId: row.team._id }} className="flex items-center gap-2 font-semibold text-fg">
                  <Avatar name={row.team.name} asset={row.team.logo} className="h-8 w-8 rounded-lg" />
                  {row.team.name}
                </Link>
              </td>
              {[row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.goalDifference].map((value, index) => (
                <td key={index} className="px-2 py-3 tabular text-fg">
                  {value}
                </td>
              ))}
              <td className="px-2 py-3 font-display text-xl tabular text-fg">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
