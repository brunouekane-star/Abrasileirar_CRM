import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoursBar } from "@/components/hours-bar";
import { ContractEditForm } from "@/components/contratos/contract-edit-form";
import {
  SessionHistory,
  type SessionItem,
} from "@/components/contratos/session-history";
import {
  LogHoursDialog,
  type ContractOption,
} from "@/components/alunos/log-hours-dialog";
import { CONTRACT_STATUS_LABELS } from "@/lib/labels";
import { formatBRL } from "@/lib/pipeline";
import { one } from "@/lib/db";
import type { Contract, ContractStatus } from "@/lib/types";

export default async function ContratoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contractId = Number(id);
  const supabase = await createClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select(
      "id, service_id, company_id, student_id, total_hours, consumed_hours, remaining_hours, total_value, monthly_value, status, start_date, end_date, service:services(name), company:companies(name), student:students(id, full_name)",
    )
    .eq("id", contractId)
    .single();

  if (!contract) notFound();

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select(
      "id, session_date, duration_hours, status, topic, teacher:profiles!class_sessions_teacher_id_fkey(full_name)",
    )
    .eq("contract_id", contractId)
    .order("session_date", { ascending: false });

  const service = one<{ name: string }>(contract.service);
  const company = one<{ name: string }>(contract.company);
  const student = one<{ id: number; full_name: string }>(contract.student);
  const owner = company?.name ?? student?.full_name ?? "—";

  const sessionItems: SessionItem[] = (sessions ?? []).map((s) => ({
    id: s.id,
    session_date: s.session_date,
    duration_hours: s.duration_hours,
    status: s.status,
    topic: s.topic,
    teacher_name: one<{ full_name: string }>(s.teacher)?.full_name ?? null,
  }));

  const contractOptions: ContractOption[] = [
    {
      id: contract.id,
      label: service?.name ?? `Contrato #${contract.id}`,
      remaining: contract.remaining_hours,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/contratos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Contratos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{owner}</h1>
          <p className="text-sm text-muted-foreground">
            {service?.name ?? "—"}
            {student ? " · aluno" : company ? " · empresa" : ""}
          </p>
        </div>
        {student ? (
          <LogHoursDialog studentId={student.id} contracts={contractOptions} />
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Banco de horas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HoursBar
              total={contract.total_hours}
              consumed={contract.consumed_hours}
              remaining={contract.remaining_hours}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">
                {CONTRACT_STATUS_LABELS[contract.status as ContractStatus] ??
                  contract.status}
              </Badge>
              <span>
                {contract.monthly_value
                  ? `${formatBRL(contract.monthly_value)}/mês`
                  : formatBRL(contract.total_value)}
              </span>
              <span>
                {contract.end_date
                  ? `Vence ${new Date(contract.end_date).toLocaleDateString("pt-BR")}`
                  : "Sem vencimento"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editar contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractEditForm contract={contract as unknown as Contract} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionHistory sessions={sessionItems} />
        </CardContent>
      </Card>
    </div>
  );
}
