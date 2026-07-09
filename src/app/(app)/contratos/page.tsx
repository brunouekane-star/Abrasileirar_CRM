import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HoursBar } from "@/components/hours-bar";
import { CreateContractDialog } from "@/components/contratos/create-contract-dialog";
import { CONTRACT_STATUS_LABELS } from "@/lib/labels";
import { formatBRL } from "@/lib/pipeline";
import { one } from "@/lib/db";
import type { ContractStatus } from "@/lib/types";

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const sp = await searchParams;
  const autoStudentId = sp.aluno ? Number(sp.aluno) : undefined;
  const supabase = await createClient();

  const [{ data: contracts }, { data: services }, { data: students }, { data: companies }] =
    await Promise.all([
      supabase
        .from("contracts")
        .select(
          "id, total_hours, consumed_hours, remaining_hours, total_value, monthly_value, status, start_date, end_date, service:services(name), company:companies(name), student:students(full_name)",
        )
        .order("created_at", { ascending: false }),
      supabase.from("services").select("id, name").eq("is_active", true).order("name"),
      supabase.from("students").select("id, full_name").order("full_name"),
      supabase.from("companies").select("id, name").order("name"),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contratos</h1>
          <p className="text-sm text-muted-foreground">
            Banco de horas: contratadas vs. consumidas.
          </p>
        </div>
        <CreateContractDialog
          services={(services as { id: number; name: string }[]) ?? []}
          students={
            (students ?? []).map((s) => ({ id: s.id, name: s.full_name }))
          }
          companies={(companies as { id: number; name: string }[]) ?? []}
          autoStudentId={autoStudentId}
        />
      </div>

      {(contracts ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum contrato ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(contracts ?? []).map((c) => {
            const service = one<{ name: string }>(c.service);
            const company = one<{ name: string }>(c.company);
            const student = one<{ full_name: string }>(c.student);
            const owner = company?.name ?? student?.full_name ?? "—";
            return (
              <Link key={c.id} href={`/contratos/${c.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{owner}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {service?.name ?? "—"}
                      </p>
                    </div>
                    <Badge
                      variant={c.status === "active" ? "default" : "secondary"}
                    >
                      {CONTRACT_STATUS_LABELS[c.status as ContractStatus] ??
                        c.status}
                    </Badge>
                  </div>

                  <HoursBar
                    total={c.total_hours}
                    consumed={c.consumed_hours}
                    remaining={c.remaining_hours}
                  />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {c.monthly_value
                        ? `${formatBRL(c.monthly_value)}/mês`
                        : formatBRL(c.total_value)}
                    </span>
                    <span>
                      {c.end_date
                        ? `Vence ${new Date(c.end_date).toLocaleDateString("pt-BR")}`
                        : "Sem vencimento"}
                    </span>
                  </div>
                </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
