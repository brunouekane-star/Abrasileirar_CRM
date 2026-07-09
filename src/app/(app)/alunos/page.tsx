import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { one } from "@/lib/db";
import type { ProficiencyLevel } from "@/lib/types";

export default async function AlunosPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select(
      "id, full_name, email, nationality, proficiency_level, is_active, company:companies(name), teacher:profiles!students_assigned_teacher_id_fkey(full_name)",
    )
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alunos</h1>
        <p className="text-sm text-muted-foreground">
          Perfis, proficiência e professor responsável.
        </p>
      </div>

      {(students ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum aluno ainda. Converta um lead ganho no Pipeline para criar o
            primeiro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {(students ?? []).map((s) => {
            const company = one<{ name: string }>(s.company);
            const teacher = one<{ full_name: string }>(s.teacher);
            const level = s.proficiency_level as ProficiencyLevel | null;
            return (
              <Link key={s.id} href={`/alunos/${s.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[company?.name, s.nationality, s.email]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {level ? (
                        <Badge variant="outline">
                          {level.toUpperCase()}
                        </Badge>
                      ) : null}
                      <Badge variant="secondary">
                        {teacher?.full_name ?? "Sem professor"}
                      </Badge>
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
