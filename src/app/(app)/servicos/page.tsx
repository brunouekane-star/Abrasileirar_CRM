import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MODALITY_LABELS } from "@/lib/labels";

export default async function ServicosPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, code, name, modality, locations, description, is_active")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de programas oferecidos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(services ?? []).map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <Badge variant="secondary">
                  {MODALITY_LABELS[s.modality] ?? s.modality}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {(s.locations ?? []).map((loc: string) => (
                  <Badge key={loc} variant="outline" className="text-[10px]">
                    {loc}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
