"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const contractSchema = z
  .object({
    service_id: z.coerce.number().int().positive("Selecione um serviço."),
    company_id: z.coerce.number().int().positive().optional().nullable(),
    student_id: z.coerce.number().int().positive().optional().nullable(),
    total_hours: z.coerce.number().positive("Informe as horas contratadas."),
    total_value: z.coerce.number().nonnegative().optional().default(0),
    monthly_value: z.coerce.number().nonnegative().optional().nullable(),
    start_date: z.string().optional(),
    end_date: z.string().optional().nullable(),
  })
  .refine((d) => d.company_id || d.student_id, {
    message: "Vincule o contrato a uma empresa ou a um aluno.",
  });

type Result = { ok: true } | { ok: false; error: string };

export async function createContract(input: unknown): Promise<Result> {
  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("contracts").insert({
    service_id: d.service_id,
    company_id: d.company_id || null,
    student_id: d.student_id || null,
    total_hours: d.total_hours,
    total_value: d.total_value ?? 0,
    monthly_value: d.monthly_value ?? null,
    start_date: d.start_date || undefined,
    end_date: d.end_date || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contratos");
  return { ok: true };
}

const sessionSchema = z.object({
  contract_id: z.coerce.number().int().positive(),
  student_id: z.coerce.number().int().positive(),
  duration_hours: z.coerce.number().positive("Informe a duração em horas."),
  topic: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/** Register a completed class session; the DB trigger decrements contract hours. */
export async function logHours(input: unknown): Promise<Result> {
  const parsed = sessionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("class_sessions").insert({
    contract_id: d.contract_id,
    student_id: d.student_id,
    teacher_id: user?.id ?? null,
    duration_hours: d.duration_hours,
    status: "completed",
    topic: d.topic || null,
    notes: d.notes || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contratos");
  revalidatePath(`/alunos/${d.student_id}`);
  return { ok: true };
}
