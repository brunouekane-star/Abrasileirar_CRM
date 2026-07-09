"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { LeadCard } from "@/components/pipeline/lead-card";
import { EditLeadDialog } from "@/components/pipeline/edit-lead-dialog";
import { STAGES } from "@/lib/pipeline";
import { updateLeadStage } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";
import type { Lead, LeadStage, Service } from "@/lib/types";

function Column({
  stage,
  label,
  color,
  leads,
  onEdit,
}: {
  stage: LeadStage;
  label: string;
  color: string;
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-lg border border-dashed bg-muted/40 p-2 transition-colors",
          isOver && "border-primary bg-primary/5",
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onEdit={onEdit} />
        ))}
        {leads.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">
            Sem leads
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function KanbanBoard({
  initialLeads,
  services,
}: {
  initialLeads: Lead[];
  services: Service[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "b2b" | "b2c">("all");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Re-sync when the server component refetches (e.g. after creating a lead).
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const visible = leads.filter((l) => filter === "all" || l.type === filter);
  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = Number(active.id);
    const newStage = over.id as LeadStage;
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.stage === newStage) return;

    const previous = leads;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
    );

    const result = await updateLeadStage(leadId, newStage);
    if (!result.ok) {
      setLeads(previous);
      toast.error("Não foi possível mover o lead", {
        description: result.error,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["all", "b2b", "b2c"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {f === "all" ? "Todos" : f.toUpperCase()}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <Column
              key={s.key}
              stage={s.key}
              label={s.label}
              color={s.color}
              leads={visible.filter((l) => l.stage === s.key)}
              onEdit={setEditingLead}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <EditLeadDialog
        lead={editingLead}
        services={services}
        onClose={() => setEditingLead(null)}
      />
    </div>
  );
}
