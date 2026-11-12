import { cn } from "@/lib/cn";

export function CslMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10", className)} aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <circle cx="32" cy="30" r="12" fill="none" className="stroke-accent" strokeWidth="2.5" />
      <path d="M32 20l2.2 5.2h5.4l-4.4 3.4 1.7 5.4L32 30.6l-4.9 3.4 1.7-5.4-4.4-3.4h5.4z" className="fill-gold" />
      <text x="32" y="54" textAnchor="middle" fontSize="9" fontFamily="Oswald, sans-serif" className="fill-primary-fg">
        CSL
      </text>
    </svg>
  );
}
