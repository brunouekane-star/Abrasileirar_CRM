"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateContract } from "@/lib/actions/contracts";
import { CONTRACT_STATUS_LABELS } from "@/lib/labels";
import type { Contract, ContractStatus } from "@/lib/types";

const STATUSES: ContractStatus[] = [
  "active",
  "completed",
  "expired",
  "cancelled",
];

export function ContractEditForm({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [status, setStatus] = useState<ContractStatus>(contract.status);
  const [totalHours, setTotalHours] = useState(String(contract.total_hours));
  const [totalValue, setTotalValue] = useState(String(contract.total_value));
  const [monthlyValue, setMonthlyValue] = useState(
    contract.monthly_value != null ? String(contract.monthly_value) : "",
  );
  const [endDate, setEndDate] = useState(contract.end_date ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateContract({
      id: contract.id,
      total_hours: totalHours ? Number(totalHours) : 0,
      total_value: totalValue ? Number(totalValue) : 0,
      monthly_value: monthlyValue ? Number(monthlyValue) : null,
      status,
      end_date: endDate || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao salvar", { description: result.error });
      return;
    }
    toast.success("Contrato atualizado!");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Situação</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ContractStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {CONTRACT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="c_hours">Horas contratadas</Label>
          <Input
            id="c_hours"
            type="number"
            step="0.5"
            value={totalHours}
            onChange={(e) => setTotalHours(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c_total">Valor total (R$)</Label>
          <Input
            id="c_total"
            type="number"
            step="0.01"
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c_monthly">Mensal / MRR (R$)</Label>
          <Input
            id="c_monthly"
            type="number"
            step="0.01"
            value={monthlyValue}
            onChange={(e) => setMonthlyValue(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c_end">Vencimento</Label>
        <Input
          id="c_end"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar contrato"}
      </Button>
    </div>
  );
}
