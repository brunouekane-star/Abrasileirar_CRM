"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const rating = z.number().int().min(1).max(5).nullable().optional();

const absenceSchema = z.object({
  data: z.string().optional().nullable(),
  conteudo: z.string().trim().optional().nullable(),
  repor: z.boolean().optional().default(false),
});

const reportSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  student_id: z.coerce.number().int().positive(),
  period_start: z.string().min(1, "Informe o início do período."),
  period_end: z.string().min(1, "Informe o fim do período."),
  total_aulas: z.coerce.number().int().min(0).default(0),
  fala: rating,
  audicao: rating,
  leitura: rating,
  escrita: rating,
  gramatica: rating,
  eng_participacao: rating,
  eng_tarefas: rating,
  eng_pratica: rating,
  eng_assiduidade: rating,
  recomendacoes: z.string().trim().optional().nullable(),
  feedback: z.record(z.string(), z.string()).optional().default({}),
  absences: z.array(absenceSchema).optional().default([]),
});

type SaveResult = { ok: true; id: number } | { ok: false; error: string };
type Result = { ok: true } | { ok: false; error: string };

export async function saveReport(input: unknown): Promise<SaveResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    student_id: d.student_id,
    period_start: d.period_start,
    period_end: d.period_end,
    total_aulas: d.total_aulas,
    fala: d.fala ?? null,
    audicao: d.audicao ?? null,
    leitura: d.leitura ?? null,
    escrita: d.escrita ?? null,
    gramatica: d.gramatica ?? null,
    eng_participacao: d.eng_participacao ?? null,
    eng_tarefas: d.eng_tarefas ?? null,
    eng_pratica: d.eng_pratica ?? null,
    eng_assiduidade: d.eng_assiduidade ?? null,
    recomendacoes: d.recomendacoes || null,
    // Guarda só os comentários não vazios.
    feedback: Object.fromEntries(
      Object.entries(d.feedback).filter(([, v]) => v && v.trim()),
    ),
  };

  let reportId: number;
  if (d.id) {
    const { error } = await supabase
      .from("student_reports")
      .update(payload)
      .eq("id", d.id);
    if (error) return { ok: false, error: error.message };
    reportId = d.id;
  } else {
    const { data, error } = await supabase
      .from("student_reports")
      .insert({ ...payload, teacher_id: user?.id ?? null })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    reportId = data.id;
  }

  // Substitui as faltas do relatório.
  await supabase.from("report_absences").delete().eq("report_id", reportId);
  const rows = d.absences
    .filter((a) => a.data || a.conteudo)
    .map((a) => ({
      report_id: reportId,
      data: a.data || null,
      conteudo: a.conteudo || null,
      repor: a.repor ?? false,
    }));
  if (rows.length > 0) {
    const { error } = await supabase.from("report_absences").insert(rows);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/relatorios/${reportId}`);
  revalidatePath(`/alunos/${d.student_id}`);
  return { ok: true, id: reportId };
}

export async function deleteReport(id: number): Promise<Result> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_reports")
    .delete()
    .eq("id", id)
    .select("student_id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/alunos");
  if (data?.student_id) revalidatePath(`/alunos/${data.student_id}`);
  return { ok: true };
}
