import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FunnelChart({
  data,
}: {
  data: { label: string; count: number; color: string }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Funil de vendas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((d) => (
          <div key={d.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-medium tabular-nums">{d.count}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(d.count / max) * 100}%`,
                  backgroundColor: d.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MonthlyHoursChart({
  data,
}: {
  data: { label: string; hours: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.hours));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Horas ministradas (6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end justify-between gap-2">
          {data.map((d) => (
            <div
              key={d.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-primary transition-all"
                  style={{
                    height: `${Math.max(2, (d.hours / max) * 100)}%`,
                  }}
                  title={`${d.hours}h`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {d.label}
              </span>
              <span className="text-[10px] font-medium tabular-nums">
                {d.hours}h
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
