"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/pipeline";
import { convertLead } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export function LeadCard({
  lead,
  overlay = false,
}: {
  lead: Lead;
  overlay?: boolean;
}) {
  const router = useRouter();
  const [converting, setConverting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id, data: { stage: lead.stage } });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  async function handleConvert() {
    setConverting(true);
    const result = await convertLead(lead.id);
    setConverting(false);
    if (!result.ok) {
      toast.error("Não foi possível converter", { description: result.error });
      return;
    }
    toast.success("Lead convertido em cliente!");
    router.refresh();
  }

  const showConvert =
    !overlay && lead.stage === "won" && !lead.converted_at;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm",
        isDragging && "opacity-40",
        overlay && "shadow-lg ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.contact_name}</p>
          {lead.company_name ? (
            <p className="truncate text-xs text-muted-foreground">
              {lead.company_name}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...listeners}
          {...attributes}
          aria-label="Arrastar"
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge
          variant={lead.type === "b2b" ? "default" : "secondary"}
          className="text-[10px]"
        >
          {lead.type.toUpperCase()}
        </Badge>
        {lead.nationality ? (
          <Badge variant="outline" className="text-[10px]">
            {lead.nationality}
          </Badge>
        ) : null}
        {lead.converted_at ? (
          <Badge variant="outline" className="gap-1 text-[10px] text-primary">
            <Check className="size-3" /> Convertido
          </Badge>
        ) : null}
      </div>

      {lead.estimated_value != null ? (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {formatBRL(lead.estimated_value)}
        </p>
      ) : null}

      {showConvert ? (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full"
          onClick={handleConvert}
          disabled={converting}
        >
          <UserPlus className="size-3.5" />
          {converting ? "Convertendo..." : "Converter em cliente"}
        </Button>
      ) : null}
    </div>
  );
}
