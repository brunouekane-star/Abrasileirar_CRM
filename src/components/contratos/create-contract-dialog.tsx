"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createContract } from "@/lib/actions/contracts";

type Option = { id: number; name: string };

export function CreateContractDialog({
  services,
  students,
  companies,
  autoStudentId,
}: {
  services: Option[];
  students: Option[];
  companies: Option[];
  autoStudentId?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [party, setParty] = useState<"student" | "company">("student");
  const [serviceId, setServiceId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [monthlyValue, setMonthlyValue] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-open pre-filled when arriving from a lead conversion (RF03).
  useEffect(() => {
    if (autoStudentId) {
      setParty("student");
      setPartyId(String(autoStudentId));
      setOpen(true);
    }
  }, [autoStudentId]);

  async function handleSave() {
    setSaving(true);
    const result = await createContract({
      service_id: serviceId ? Number(serviceId) : undefined,
      student_id: party === "student" && partyId ? Number(partyId) : null,
      company_id: party === "company" && partyId ? Number(partyId) : null,
      total_hours: totalHours ? Number(totalHours) : undefined,
      total_value: totalValue ? Number(totalValue) : 0,
      monthly_value: monthlyValue ? Number(monthlyValue) : null,
      end_date: endDate || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao criar contrato", { description: result.error });
      return;
    }
    toast.success("Contrato criado!");
    setServiceId("");
    setPartyId("");
    setTotalHours("");
    setTotalValue("");
    setMonthlyValue("");
    setEndDate("");
    setOpen(false);
    router.refresh();
  }

  const partyOptions = party === "student" ? students : companies;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Novo contrato
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo contrato</DialogTitle>
            <DialogDescription>
              Banco de horas vinculado a um aluno (B2C) ou empresa (B2B).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vincular a</Label>
                <Select
                  items={{ student: "Aluno (B2C)", company: "Empresa (B2B)" }}
                  value={party}
                  onValueChange={(v) => {
                    setParty(v as "student" | "company");
                    setPartyId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Aluno (B2C)</SelectItem>
                    <SelectItem value="company">Empresa (B2B)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{party === "student" ? "Aluno" : "Empresa"}</Label>
                <Select
                  items={Object.fromEntries(
                    partyOptions.map((o) => [String(o.id), o.name]),
                  )}
                  value={partyId}
                  onValueChange={(v) => setPartyId(v as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {partyOptions.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select
                items={Object.fromEntries(
                  services.map((s) => [String(s.id), s.name]),
                )}
                value={serviceId}
                onValueChange={(v) => setServiceId(v as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um programa" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_hours">Horas contratadas *</Label>
                <Input
                  id="total_hours"
                  type="number"
                  step="0.5"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Vencimento</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_value">Valor total (R$)</Label>
                <Input
                  id="total_value"
                  type="number"
                  step="0.01"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_value">Mensal / MRR (R$)</Label>
                <Input
                  id="monthly_value"
                  type="number"
                  step="0.01"
                  value={monthlyValue}
                  onChange={(e) => setMonthlyValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Criar contrato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
