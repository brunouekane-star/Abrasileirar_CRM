"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteSession } from "@/lib/actions/contracts";

export type SessionItem = {
  id: number;
  session_date: string;
  duration_hours: number;
  status: string;
  topic: string | null;
  teacher_name: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Concluída",
  scheduled: "Agendada",
  cancelled: "Cancelada",
  no_show: "Faltou",
};

function SessionRow({ session }: { session: SessionItem }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteSession(session.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error("Erro ao excluir aula", { description: result.error });
      return;
    }
    toast.success("Aula excluída — horas devolvidas ao contrato.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {new Date(session.session_date).toLocaleDateString("pt-BR")}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {session.duration_hours}h
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {STATUS_LABELS[session.status] ?? session.status}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {[session.topic, session.teacher_name].filter(Boolean).join(" · ") ||
            "—"}
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "..." : "Confirmar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => setConfirming(true)}
          aria-label="Excluir aula"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}

export function SessionHistory({ sessions }: { sessions: SessionItem[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma aula registrada neste contrato ainda.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}
