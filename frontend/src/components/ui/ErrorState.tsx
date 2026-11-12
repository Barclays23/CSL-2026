import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <GlassCard className="px-6 py-10 text-center">
      <h2 className="font-display text-3xl text-fg">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </GlassCard>
  );
}
