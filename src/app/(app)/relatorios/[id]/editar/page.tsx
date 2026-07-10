import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "@/components/reports/report-form";
import { one } from "@/lib/db";
import type { ReportAbsence, StudentReport } from "@/lib/types";

export default async function EditarRelatorioPage({
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
      "id, student_id, teacher_id, period_start, period_end, total_aulas, fala, audicao, leitura, escrita, gramatica, eng_participacao, eng_tarefas, eng_pratica, eng_assiduidade, recomendacoes, created_at, student:students(full_name)",
    )
    .eq("id", reportId)
    .single();

  if (!report) notFound();

  const { data: absences } = await supabase
    .from("report_absences")
    .select("id, data, conteudo, repor")
    .eq("report_id", reportId)
    .order("data");

  const studentName =
    one<{ full_name: string }>(report.student)?.full_name ?? "";

  return (
    <div className="space-y-6">
      <Link
        href={`/relatorios/${reportId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar ao relatório
      </Link>
      <h1 className="text-2xl font-semibold">Editar relatório</h1>
      <ReportForm
        studentId={report.student_id}
        studentName={studentName}
        initial={{
          report: report as unknown as StudentReport,
          absences: (absences ?? []) as ReportAbsence[],
        }}
      />
    </div>
  );
}
