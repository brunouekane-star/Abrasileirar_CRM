"use client";

import { cn } from "@/lib/utils";

/** Seletor segmentado 1–5. Clicar no valor selecionado limpa (volta a null). */
export function RatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={cn(
            "w-9 border-r py-1 text-sm transition-colors last:border-r-0",
            value === n
              ? "bg-primary font-medium text-primary-foreground"
              : "hover:bg-accent",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
