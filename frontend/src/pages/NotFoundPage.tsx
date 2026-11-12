import { Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export function NotFoundPage() {
  return (
    <PageContainer>
      <GlassCard className="px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-2 font-display text-5xl text-fg">This page is off the pitch</h1>
        <p className="mt-3 text-sm text-muted">The link does not match a tournament page.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back home</Button>
        </Link>
      </GlassCard>
    </PageContainer>
  );
}
