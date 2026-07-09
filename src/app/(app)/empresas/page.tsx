import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCompanyDialog } from "@/components/empresas/create-company-dialog";

export default async function EmpresasPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, industry, country, students(count)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Contas corporativas (B2B) e seus alunos vinculados.
          </p>
        </div>
        <CreateCompanyDialog />
      </div>

      {(companies ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma empresa cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(companies ?? []).map((c) => {
            const count = (c.students as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Card key={c.id}>
                <CardContent className="flex items-start gap-3 py-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[c.industry, c.country].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {count} {count === 1 ? "aluno" : "alunos"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
