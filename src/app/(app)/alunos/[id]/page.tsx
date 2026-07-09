import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoursBar } from "@/components/hours-bar";
import { StudentEditForm } from "@/components/alunos/student-edit-form";
import {
  LogHoursDialog,
  type ContractOption,
} from "@/components/alunos/log-hours-dialog";
import { CONTRACT_STATUS_LABELS } from "@/lib/labels";
import { one } from "@/lib/db";
import type { ContractStatus, Student, TeacherOption } from "@/lib/types";

export default async function AlunoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, nationality, native_language, company_id, proficiency_level, assigned_teacher_id, cultural_notes, is_active, company:companies(name)",
    )
    .eq("id", studentId)
    .single();

  if (!student) notFound();

  const [{ data: teachers }, { data: contracts }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").order("full_name"),
    supabase
      .from("contracts")
      .select(
        "id, total_hours, consumed_hours, remaining_hours, status, service:services(name)",
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
  ]);

  const company = one<{ name: string }>(student.company);

  const contractOptions: ContractOption[] = (contracts ?? []).map((c) => ({
    id: c.id,
    label: one<{ name: string }>(c.service)?.name ?? `Contrato #${c.id}`,
    remaining: c.remaining_hours,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/alunos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Alunos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{student.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {[company?.name, student.nationality, student.native_language]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        <LogHoursDialog studentId={studentId} contracts={contractOptions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentEditForm
              student={student as unknown as Student}
              teachers={(teachers as TeacherOption[]) ?? []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contratos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(contracts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum contrato. Crie um em{" "}
                <Link href="/contratos" className="text-primary underline">
                  Contratos
                </Link>
                .
              </p>
            ) : (
              (contracts ?? []).map((c) => (
                <div key={c.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {one<{ name: string }>(c.service)?.name ??
                        `Contrato #${c.id}`}
                    </span>
                    <Badge variant="secondary">
                      {CONTRACT_STATUS_LABELS[c.status as ContractStatus] ??
                        c.status}
                    </Badge>
                  </div>
                  <HoursBar
                    total={c.total_hours}
                    consumed={c.consumed_hours}
                    remaining={c.remaining_hours}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Contato: {student.email ?? "—"} · {student.phone ?? "—"}
      </p>
    </div>
  );
}
