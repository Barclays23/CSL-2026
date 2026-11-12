import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <GlassCard className="px-6 py-12 text-center">
      <h2 className="font-display text-3xl text-fg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </GlassCard>
  );
}
