"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logHours } from "@/lib/actions/contracts";

export type ContractOption = {
  id: number;
  label: string;
  remaining: number;
};

export function LogHoursDialog({
  studentId,
  contracts,
}: {
  studentId: number;
  contracts: ContractOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contractId, setContractId] = useState<string>(
    contracts[0] ? String(contracts[0].id) : "",
  );
  const [duration, setDuration] = useState("1");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!contractId) {
      toast.error("Selecione um contrato.");
      return;
    }
    setSaving(true);
    const result = await logHours({
      contract_id: Number(contractId),
      student_id: studentId,
      duration_hours: Number(duration),
      topic,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao registrar horas", { description: result.error });
      return;
    }
    toast.success("Aula registrada — horas decrementadas!");
    setTopic("");
    setDuration("1");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={contracts.length === 0}
      >
        <Clock className="size-3.5" /> Registrar aula
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar aula</DialogTitle>
            <DialogDescription>
              As horas são descontadas do contrato automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contrato</Label>
              <Select
                value={contractId}
                onValueChange={(v) => setContractId(v as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.label} ({c.remaining}h restantes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (horas)</Label>
              <Input
                id="duration"
                type="number"
                step="0.5"
                min="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico / conteúdo</Label>
              <Textarea
                id="topic"
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
