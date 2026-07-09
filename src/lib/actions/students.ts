"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.coerce.number().int().positive(),
  proficiency_level: z
    .enum(["a1", "a2", "b1", "b2", "c1", "c2"])
    .optional()
    .nullable(),
  assigned_teacher_id: z.string().uuid().optional().nullable(),
  cultural_notes: z.string().trim().optional().nullable(),
});

type Result = { ok: true } | { ok: false; error: string };

export async function updateStudent(input: unknown): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      proficiency_level: d.proficiency_level ?? null,
      assigned_teacher_id: d.assigned_teacher_id ?? null,
      cultural_notes: d.cultural_notes ?? null,
    })
    .eq("id", d.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/alunos/${d.id}`);
  revalidatePath("/alunos");
  return { ok: true };
}
