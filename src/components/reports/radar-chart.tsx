/** Radar (teia) SVG das habilidades PLE, escala 1–5. Componente puro. */
export function RadarChart({
  data,
  max = 5,
}: {
  data: { label: string; value: number }[];
  max?: number;
}) {
  const size = 300;
  const cx = size / 2;
  const cy = 138;
  const R = 92;
  const n = data.length;

  const point = (i: number, r: number): [number, number] => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const ringLevels = [1, 2, 3, 4, 5];
  const dataPoly = data
    .map((d, i) => point(i, (Math.max(0, d.value) / max) * R).join(","))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} 258`} className="w-full" role="img">
      {ringLevels.map((level) => (
        <polygon
          key={level}
          points={data
            .map((_, i) => point(i, (level / max) * R).join(","))
            .join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, R);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={dataPoly}
        fill="var(--primary)"
        fillOpacity={0.25}
        stroke="var(--primary)"
        strokeWidth={2}
      />
      {data.map((d, i) => {
        const [x, y] = point(i, R + 18);
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
