import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarChart } from "@/components/reports/radar-chart";
import { FrequencyDonut } from "@/components/reports/frequency-donut";
import { ReportActions } from "@/components/reports/report-actions";
import {
  SKILL_KEYS,
  SKILL_LABELS,
  ENGAGEMENT_KEYS,
  ENGAGEMENT_LABELS,
  skillAverage,
  engagementAverage,
  frequencyPct,
  formatPeriod,
} from "@/lib/reports";
import { one } from "@/lib/db";
import type { StudentReport } from "@/lib/types";

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportId = Number(id);
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("student_reports")
    .select(
      "*, student:students(id, full_name), teacher:profiles!student_reports_teacher_id_fkey(full_name)",
    )
    .eq("id", reportId)
    .single();

  if (!report) notFound();

  const { data: absences } = await supabase
    .from("report_absences")
    .select("id, data, conteudo, repor")
    .eq("report_id", reportId)
    .order("data");

  const rep = report as unknown as StudentReport;
  const student = one<{ id: number; full_name: string }>(report.student);
  const teacher = one<{ full_name: string }>(report.teacher);

  const absCount = absences?.length ?? 0;
  const freq = frequencyPct(rep.total_aulas, absCount);
  const present = Math.max(0, rep.total_aulas - absCount);
  const skillAvg = skillAverage(rep);
  const engAvg = engagementAverage(rep);

  const radarData = SKILL_KEYS.map((k) => ({
    label: SKILL_LABELS[k],
    value: rep[k] ?? 0,
  }));

  const kpis = [
    { label: "Frequência", value: freq != null ? `${freq}%` : "—" },
    { label: "Desenvolvimento", value: skillAvg != null ? String(skillAvg) : "—" },
    { label: "Engajamento", value: engAvg != null ? String(engAvg) : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/alunos/${student?.id ?? ""}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {student?.full_name ?? "Aluno"}
        </Link>
        <ReportActions reportId={rep.id} studentId={rep.student_id} />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Relatório de Desempenho
            </p>
            <h1 className="text-2xl font-semibold">{student?.full_name}</h1>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Professor(a): {teacher?.full_name || "—"}</p>
            <p>Período: {formatPeriod(rep.period_start, rep.period_end)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Presença</CardTitle>
          </CardHeader>
          <CardContent>
            <FrequencyDonut pct={freq} present={present} total={rep.total_aulas} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart data={radarData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Engajamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ENGAGEMENT_KEYS.map((k) => {
              const v = rep[k] ?? 0;
              return (
                <div key={k} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {ENGAGEMENT_LABELS[k]}
                    </span>
                    <span className="font-medium">
                      {rep[k] != null ? `${rep[k]}/5` : "—"}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(v / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {(() => {
        const fb = (rep.feedback ?? {}) as Record<string, string>;
        const items = [
          ...SKILL_KEYS.map((k) => ({
            label: SKILL_LABELS[k],
            score: rep[k],
            text: fb[k],
          })),
          ...ENGAGEMENT_KEYS.map((k) => ({
            label: ENGAGEMENT_LABELS[k],
            score: rep[k],
            text: fb[k],
          })),
        ].filter((it) => it.text && it.text.trim());
        if (items.length === 0) return null;
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Observações por critério
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((it) => (
                <div key={it.label} className="text-sm">
                  <p className="font-medium">
                    {it.label}
                    {it.score != null ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {it.score}/5
                      </span>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground">{it.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      {absCount > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faltas ({absCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(absences ?? []).map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="font-medium">
                  {a.data
                    ? new Date(a.data).toLocaleDateString("pt-BR")
                    : "—"}
                </span>
                <span className="text-muted-foreground">
                  {a.conteudo || "Conteúdo não informado"}
                </span>
                {a.repor ? (
                  <Badge variant="outline" className="text-[10px]">
                    Repor
                  </Badge>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {rep.recomendacoes ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recomendações do professor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{rep.recomendacoes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
