"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/reports/print-button";
import { deleteReport } from "@/lib/actions/reports";

export function ReportActions({
  reportId,
  studentId,
}: {
  reportId: number;
  studentId: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteReport(reportId);
    setDeleting(false);
    if (!res.ok) {
      toast.error("Erro ao excluir", { description: res.error });
      return;
    }
    toast.success("Relatório excluído.");
    router.push(`/alunos/${studentId}`);
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Link
        href={`/relatorios/${reportId}/editar`}
        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Pencil className="size-4" /> Editar
      </Link>
      <PrintButton />
      {confirming ? (
        <>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-4" /> Excluir
        </Button>
      )}
    </div>
  );
}
