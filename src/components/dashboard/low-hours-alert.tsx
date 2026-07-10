import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOW_HOURS_THRESHOLD } from "@/lib/labels";

export type LowHoursContract = {
  id: number;
  owner: string;
  service: string | null;
  remaining_hours: number;
  total_hours: number;
};

export function LowHoursAlert({
  contracts,
}: {
  contracts: LowHoursContract[];
}) {
  const hasAlerts = contracts.length > 0;

  return (
    <Card className={hasAlerts ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {hasAlerts ? (
            <AlertTriangle className="size-4 text-destructive" />
          ) : (
            <CheckCircle2 className="size-4 text-primary" />
          )}
          Contratos acabando
          <span className="text-xs font-normal text-muted-foreground">
            (≤ {LOW_HOURS_THRESHOLD}h restantes)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAlerts ? (
          <div className="space-y-2">
            {contracts.map((c) => (
              <Link
                key={c.id}
                href={`/contratos/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.owner}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.service ?? "—"}
                  </p>
                </div>
                <Badge variant="destructive" className="shrink-0">
                  {c.remaining_hours}h / {c.total_hours}h
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum contrato com horas baixas. Tudo em dia. 🎉
          </p>
        )}
      </CardContent>
    </Card>
  );
}
