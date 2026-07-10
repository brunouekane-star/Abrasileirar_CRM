"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCompany } from "@/lib/actions/companies";

export type CompanyFields = {
  id: number;
  name: string;
  industry: string;
  country: string;
  contact_name: string;
  email: string;
  phone: string;
};

export function CompanyEditForm({ company }: { company: CompanyFields }) {
  const router = useRouter();
  const [form, setForm] = useState<CompanyFields>(company);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CompanyFields>(key: K, value: CompanyFields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateCompany({
      id: form.id,
      name: form.name,
      industry: form.industry || null,
      country: form.country || null,
      contact_name: form.contact_name || null,
      email: form.email || "",
      phone: form.phone || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao salvar", { description: result.error });
      return;
    }
    toast.success("Empresa atualizada!");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="co_name">Nome *</Label>
        <Input
          id="co_name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="co_industry">Setor</Label>
          <Input
            id="co_industry"
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co_country">País</Label>
          <Input
            id="co_country"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="co_contact">Contato</Label>
        <Input
          id="co_contact"
          value={form.contact_name}
          onChange={(e) => set("contact_name", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="co_email">E-mail</Label>
          <Input
            id="co_email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co_phone">Telefone</Label>
          <Input
            id="co_phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar empresa"}
      </Button>
    </div>
  );
}
