/** Rosca/gauge de frequência (%). Componente puro. */
export function FrequencyDonut({
  pct,
  present,
  total,
}: {
  pct: number | null;
  present: number;
  total: number;
}) {
  const cx = 70;
  const cy = 70;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const filled = pct != null ? (pct / 100) * circumference : 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="size-32 shrink-0">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={14}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="26"
          fontWeight="700"
          fill="var(--foreground)"
        >
          {pct != null ? `${pct}%` : "—"}
        </text>
      </svg>
      <div className="text-sm">
        <p>
          <span className="font-medium">{present}</span> presenças
        </p>
        <p className="text-muted-foreground">
          {Math.max(0, total - present)} faltas · {total} aulas
        </p>
      </div>
    </div>
  );
}
