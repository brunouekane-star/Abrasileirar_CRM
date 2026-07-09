import type { LeadStage } from "@/lib/types";

export const STAGES: {
  key: LeadStage;
  label: string;
  /** CSS color used for the column accent dot. */
  color: string;
}[] = [
  { key: "lead", label: "Lead", color: "var(--chart-2)" },
  { key: "first_contact", label: "Primeiro Contato", color: "var(--chart-3)" },
  { key: "proposal_sent", label: "Proposta Enviada", color: "var(--chart-4)" },
  { key: "negotiation", label: "Negociação", color: "var(--chart-5)" },
  { key: "won", label: "Ganho", color: "var(--chart-1)" },
  { key: "lost", label: "Perdido", color: "var(--muted-foreground)" },
];

export const STAGE_LABEL: Record<LeadStage, string> = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
) as Record<LeadStage, string>;

export function formatBRL(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
