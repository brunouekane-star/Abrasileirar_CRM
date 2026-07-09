import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { CreateLeadDialog } from "@/components/pipeline/create-lead-dialog";
import type { Lead, Service } from "@/lib/types";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [{ data: leads }, { data: services }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, type, stage, contact_name, company_name, email, phone, nationality, native_language, estimated_value, service_id, notes, lost_reason, converted_at, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("services")
      .select("id, code, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Arraste os leads entre as etapas do funil.
          </p>
        </div>
        <CreateLeadDialog services={(services as Service[]) ?? []} />
      </div>

      <KanbanBoard
        initialLeads={(leads as Lead[]) ?? []}
        services={(services as Service[]) ?? []}
      />
    </div>
  );
}
