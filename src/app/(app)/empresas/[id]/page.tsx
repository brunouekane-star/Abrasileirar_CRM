import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoursBar } from "@/components/hours-bar";
import { CompanyEditForm } from "@/components/empresas/company-edit-form";
import { CONTRACT_STATUS_LABELS } from "@/lib/labels";
import { one } from "@/lib/db";
import type { ContractStatus, ProficiencyLevel } from "@/lib/types";

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = Number(id);
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, industry, country, contact_name, email, phone")
    .eq("id", companyId)
    .single();

  if (!company) notFound();

  const [{ data: students }, { data: contracts }] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, email, proficiency_level, teacher:profiles!students_assigned_teacher_id_fkey(full_name)",
      )
      .eq("company_id", companyId)
      .order("full_name"),
    supabase
      .from("contracts")
      .select(
        "id, total_hours, consumed_hours, remaining_hours, status, service:services(name)",
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Empresas
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{company.name}</h1>
        <p className="text-sm text-muted-foreground">
          {[company.industry, company.country].filter(Boolean).join(" · ") ||
            "—"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyEditForm
              company={{
                id: company.id,
                name: company.name ?? "",
                industry: company.industry ?? "",
                country: company.country ?? "",
                contact_name: company.contact_name ?? "",
                email: company.email ?? "",
                phone: company.phone ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Contratos ({(contracts ?? []).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(contracts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum contrato vinculado a esta empresa.
              </p>
            ) : (
              (contracts ?? []).map((c) => (
                <Link
                  key={c.id}
                  href={`/contratos/${c.id}`}
                  className="block space-y-2 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
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
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Alunos vinculados ({(students ?? []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(students ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum aluno vinculado a esta empresa ainda.
            </p>
          ) : (
            <div className="grid gap-3">
              {(students ?? []).map((s) => {
                const teacher = one<{ full_name: string }>(s.teacher);
                const level = s.proficiency_level as ProficiencyLevel | null;
                return (
                  <Link
                    key={s.id}
                    href={`/alunos/${s.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <GraduationCap className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {s.full_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.email ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {level ? (
                        <Badge variant="outline">{level.toUpperCase()}</Badge>
                      ) : null}
                      <Badge variant="secondary">
                        {teacher?.full_name ?? "Sem professor"}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
