import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-accent" /> : null}
      </div>
      <p className="mt-3 font-display text-3xl leading-none tabular text-fg">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </GlassCard>
  );
}
