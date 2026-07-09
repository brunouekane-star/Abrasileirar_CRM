"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { LeadStage } from "@/lib/types";

const leadSchema = z.object({
  type: z.enum(["b2b", "b2c"]),
  contact_name: z.string().trim().min(1, "Informe o nome do contato."),
  company_name: z.string().trim().optional().nullable(),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  nationality: z.string().trim().optional().nullable(),
  native_language: z.string().trim().optional().nullable(),
  service_id: z.coerce.number().int().positive().optional().nullable(),
  estimated_value: z.coerce.number().nonnegative().optional().nullable(),
});

export type LeadInput = z.input<typeof leadSchema>;

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createLead(input: LeadInput): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    type: data.type,
    contact_name: data.contact_name,
    company_name: data.company_name || null,
    email: data.email || null,
    phone: data.phone || null,
    nationality: data.nationality || null,
    native_language: data.native_language || null,
    service_id: data.service_id || null,
    estimated_value: data.estimated_value ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/pipeline");
  return { ok: true };
}

export async function updateLeadStage(
  id: number,
  stage: LeadStage,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/pipeline");
  return { ok: true };
}

/** Convert a won lead into client records (RF03). Idempotent-guarded. */
export async function convertLead(id: number): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: lead, error: readErr } = await supabase
    .from("leads")
    .select("converted_at")
    .eq("id", id)
    .single();

  if (readErr) return { ok: false, error: readErr.message };
  if (lead?.converted_at) {
    return { ok: false, error: "Este lead já foi convertido em cliente." };
  }

  const { error } = await supabase.rpc("convert_lead", { p_lead_id: id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/alunos");
  return { ok: true };
}

export async function deleteLead(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pipeline");
  return { ok: true };
}
