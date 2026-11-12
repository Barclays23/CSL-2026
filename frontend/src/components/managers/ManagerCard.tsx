import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import type { PublicManager } from "@/types/manager.types";

export function ManagerCard({ manager }: { manager: PublicManager }) {
  return (
    <GlassCard className="flex items-center gap-3 p-4">
      <Avatar name={manager.name} asset={manager.profilePic} className="h-14 w-14" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-fg">{manager.name}</p>
        <p className="truncate text-sm text-muted">{manager.team?.name ?? "No team assigned"}</p>
        {manager.role ? <Badge className="mt-2">{manager.role}</Badge> : null}
      </div>
      {manager.team?.logo ? <img src={manager.team.logo.url} alt="" className="ml-auto h-10 w-10 rounded-lg object-cover" /> : null}
    </GlassCard>
  );
}
