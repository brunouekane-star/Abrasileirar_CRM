import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "@/components/reports/report-form";

export default async function NovoRelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", studentId)
    .single();

  if (!student) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/alunos/${studentId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {student.full_name}
      </Link>
      <h1 className="text-2xl font-semibold">Novo relatório de desempenho</h1>
      <ReportForm studentId={studentId} studentName={student.full_name} />
    </div>
  );
}
