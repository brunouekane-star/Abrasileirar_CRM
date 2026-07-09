import { AlertTriangle } from "lucide-react";
import { LOW_HOURS_THRESHOLD } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function HoursBar({
  total,
  consumed,
  remaining,
}: {
  total: number;
  consumed: number;
  remaining: number;
}) {
  const pct = total > 0 ? Math.min(100, (consumed / total) * 100) : 0;
  const low = remaining <= LOW_HOURS_THRESHOLD;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {consumed}h / {total}h consumidas
        </span>
        <span
          className={cn(
            "flex items-center gap-1 font-medium",
            low ? "text-destructive" : "text-foreground",
          )}
        >
          {low ? <AlertTriangle className="size-3" /> : null}
          {remaining}h restantes
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            low ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
