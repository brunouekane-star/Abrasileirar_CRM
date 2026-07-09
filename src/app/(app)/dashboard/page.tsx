import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart, MonthlyHoursChart } from "@/components/dashboard/charts";
import { createClient } from "@/lib/supabase/server";
import { STAGES } from "@/lib/pipeline";
import { formatBRL } from "@/lib/pipeline";
import type { LeadStage } from "@/lib/types";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    { data: activeContracts },
    { data: leads },
    { count: activeStudents },
    { data: sessions },
  ] = await Promise.all([
    supabase.from("contracts").select("monthly_value, total_value").eq("status", "active"),
    supabase.from("leads").select("stage"),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("class_sessions")
      .select("session_date, duration_hours")
      .eq("status", "completed")
      .gte("session_date", sixMonthsAgo.toISOString()),
  ]);

  // Financial
  const mrr = (activeContracts ?? []).reduce(
    (sum, c) => sum + (Number(c.monthly_value) || 0),
    0,
  );
  const totalContracted = (activeContracts ?? []).reduce(
    (sum, c) => sum + (Number(c.total_value) || 0),
    0,
  );

  // Pipeline
  const stageCounts = new Map<LeadStage, number>();
  for (const l of leads ?? []) {
    stageCounts.set(l.stage, (stageCounts.get(l.stage) ?? 0) + 1);
  }
  const totalLeads = (leads ?? []).length;
  const wonLeads = stageCounts.get("won") ?? 0;
  const pendingProposals =
    (stageCounts.get("proposal_sent") ?? 0) + (stageCounts.get("negotiation") ?? 0);
  const conversionRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const funnelData = STAGES.map((s) => ({
    label: s.label,
    count: stageCounts.get(s.key) ?? 0,
    color: s.color,
  }));

  // Hours per month (last 6)
  const hoursByMonth = new Map<string, number>();
  for (const s of sessions ?? []) {
    const key = monthKey(new Date(s.session_date));
    hoursByMonth.set(key, (hoursByMonth.get(key) ?? 0) + Number(s.duration_hours));
  }
  const monthLabels: { label: string; hours: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push({
      label: d.toLocaleDateString("pt-BR", { month: "short" }),
      hours: Math.round((hoursByMonth.get(monthKey(d)) ?? 0) * 10) / 10,
    });
  }
  const hoursThisMonth = Math.round((hoursByMonth.get(monthKey(startOfMonth)) ?? 0) * 10) / 10;

  const metrics = [
    { label: "MRR", value: formatBRL(mrr), hint: "Receita recorrente mensal" },
    {
      label: "Alunos ativos",
      value: String(activeStudents ?? 0),
      hint: "Em contratos vigentes",
    },
    {
      label: "Propostas pendentes",
      value: String(pendingProposals),
      hint: "Proposta enviada + negociação",
    },
    {
      label: "Taxa de conversão",
      value: `${conversionRate}%`,
      hint: `${wonLeads} de ${totalLeads} leads`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do funil, contratos e faturamento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor total contratado (ativo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatBRL(totalContracted)}</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas ministradas no mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{hoursThisMonth}h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart data={funnelData} />
        <MonthlyHoursChart data={monthLabels} />
      </div>
    </div>
  );
}
