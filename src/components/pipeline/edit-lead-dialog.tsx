"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { updateLead } from "@/lib/actions/leads";
import { STAGES, STAGE_LABEL } from "@/lib/pipeline";
import type { Lead, LeadStage, Service } from "@/lib/types";

const NONE = "__none__";

type FormState = {
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  nationality: string;
  native_language: string;
  service_id: string;
  estimated_value: string;
  stage: LeadStage;
  notes: string;
  lost_reason: string;
};

function fromLead(lead: Lead): FormState {
  return {
    contact_name: lead.contact_name ?? "",
    company_name: lead.company_name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    nationality: lead.nationality ?? "",
    native_language: lead.native_language ?? "",
    service_id: lead.service_id ? String(lead.service_id) : NONE,
    estimated_value: lead.estimated_value != null ? String(lead.estimated_value) : "",
    stage: lead.stage,
    notes: lead.notes ?? "",
    lost_reason: lead.lost_reason ?? "",
  };
}

export function EditLeadDialog({
  lead,
  services,
  onClose,
}: {
  lead: Lead | null;
  services: Service[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(lead ? fromLead(lead) : null);
  }, [lead]);

  const open = lead !== null && form !== null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!lead || !form) return;
    setSaving(true);
    const result = await updateLead({
      id: lead.id,
      contact_name: form.contact_name,
      company_name: form.company_name || null,
      email: form.email || "",
      phone: form.phone || null,
      nationality: form.nationality || null,
      native_language: form.native_language || null,
      service_id: form.service_id === NONE ? null : Number(form.service_id),
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      stage: form.stage,
      notes: form.notes || null,
      lost_reason: form.lost_reason || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao salvar", { description: result.error });
      return;
    }
    toast.success("Lead atualizado!");
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar lead</DialogTitle>
          <DialogDescription>
            Atualize os dados, mova a situação ou registre o motivo da perda.
          </DialogDescription>
        </DialogHeader>

        {form ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e_contact">Nome do contato *</Label>
              <Input
                id="e_contact"
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="e_company">Empresa</Label>
              <Input
                id="e_company"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="e_email">E-mail</Label>
                <Input
                  id="e_email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_phone">Telefone / WhatsApp</Label>
                <Input
                  id="e_phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="e_nat">Nacionalidade</Label>
                <Input
                  id="e_nat"
                  value={form.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_lang">Idioma nativo</Label>
                <Input
                  id="e_lang"
                  value={form.native_language}
                  onChange={(e) => set("native_language", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Produto de interesse</Label>
                <Select
                  items={{
                    [NONE]: "Nenhum",
                    ...Object.fromEntries(
                      services.map((s) => [String(s.id), s.name]),
                    ),
                  }}
                  value={form.service_id}
                  onValueChange={(v) => set("service_id", v as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Nenhum</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_value">Valor estimado (R$)</Label>
                <Input
                  id="e_value"
                  type="number"
                  step="0.01"
                  value={form.estimated_value}
                  onChange={(e) => set("estimated_value", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Situação</Label>
              <Select
                items={STAGE_LABEL}
                value={form.stage}
                onValueChange={(v) => set("stage", v as LeadStage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.stage === "lost" ? (
              <div className="space-y-2">
                <Label htmlFor="e_lost">Motivo da perda</Label>
                <Textarea
                  id="e_lost"
                  rows={2}
                  value={form.lost_reason}
                  onChange={(e) => set("lost_reason", e.target.value)}
                  placeholder="Ex: preço, timing, escolheu concorrente..."
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="e_notes">Observações</Label>
              <Textarea
                id="e_notes"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
