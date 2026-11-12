import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              "h-11 shrink-0 rounded-full px-4 text-sm font-semibold",
              selected ? "bg-accent text-accent-fg" : "border border-line bg-glass text-fg",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
