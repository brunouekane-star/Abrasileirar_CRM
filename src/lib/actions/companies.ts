"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome da empresa."),
  industry: z.string().trim().optional(),
  country: z.string().trim().optional(),
  contact_name: z.string().trim().optional(),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
});

type Result = { ok: true } | { ok: false; error: string };

export async function createCompany(input: unknown): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("companies").insert({
    name: d.name,
    industry: d.industry || null,
    country: d.country || null,
    contact_name: d.contact_name || null,
    email: d.email || null,
    phone: d.phone || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/empresas");
  return { ok: true };
}

const updateSchema = schema.extend({
  id: z.coerce.number().int().positive(),
});

export async function updateCompany(input: unknown): Promise<Result> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({
      name: d.name,
      industry: d.industry || null,
      country: d.country || null,
      contact_name: d.contact_name || null,
      email: d.email || null,
      phone: d.phone || null,
    })
    .eq("id", d.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${d.id}`);
  return { ok: true };
}
