import type { StudentReport } from "@/lib/types";

/** Habilidades PLE (eixos do radar de Desenvolvimento). */
export const SKILL_KEYS = [
  "fala",
  "audicao",
  "leitura",
  "escrita",
  "gramatica",
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

export const SKILL_LABELS: Record<SkillKey, string> = {
  fala: "Fala",
  audicao: "Audição",
  leitura: "Leitura",
  escrita: "Escrita",
  gramatica: "Gramática",
};

/** Critérios de Engajamento. */
export const ENGAGEMENT_KEYS = [
  "eng_participacao",
  "eng_tarefas",
  "eng_pratica",
  "eng_assiduidade",
] as const;
export type EngagementKey = (typeof ENGAGEMENT_KEYS)[number];

export const ENGAGEMENT_LABELS: Record<EngagementKey, string> = {
  eng_participacao: "Participação nas aulas",
  eng_tarefas: "Realização de tarefas",
  eng_pratica: "Prática fora da aula",
  eng_assiduidade: "Assiduidade",
};

/** Legenda da escala 1–5. */
export const RATING_LEGEND: { value: number; label: string }[] = [
  { value: 1, label: "Raramente" },
  { value: 2, label: "Quando solicitado" },
  { value: 3, label: "Regularmente" },
  { value: 4, label: "Sempre" },
  { value: 5, label: "Com excelência" },
];

/** Média de valores 1–5, ignorando nulos. Retorna null se nada preenchido. */
export function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export function skillAverage(r: StudentReport): number | null {
  return average(SKILL_KEYS.map((k) => r[k]));
}

export function engagementAverage(r: StudentReport): number | null {
  return average(ENGAGEMENT_KEYS.map((k) => r[k]));
}

/** Frequência % = (total - faltas) / total. Null quando total = 0. */
export function frequencyPct(
  totalAulas: number,
  absences: number,
): number | null {
  if (totalAulas <= 0) return null;
  const present = Math.max(0, totalAulas - absences);
  return Math.round((present / totalAulas) * 100);
}

export function formatPeriod(start: string, end: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  return `${fmt(start)} a ${fmt(end)}`;
}
