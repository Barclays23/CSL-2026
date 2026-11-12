import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { PublicSponsor } from "@/types/sponsor.types";

export function SponsorCard({ sponsor }: { sponsor: PublicSponsor }) {
  const body = (
    <GlassCard className="flex h-full flex-col items-center p-5 text-center transition hover:border-accent">
      {sponsor.logo ? <img src={sponsor.logo.url} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : null}
      <h3 className="mt-3 font-display text-2xl text-fg">{sponsor.name}</h3>
      {sponsor.tier ? <Badge className="mt-2" tone="gold">{sponsor.tier}</Badge> : null}
    </GlassCard>
  );
  if (!sponsor.website) return body;
  return (
    <a href={sponsor.website} target="_blank" rel="noreferrer">
      {body}
    </a>
  );
}
