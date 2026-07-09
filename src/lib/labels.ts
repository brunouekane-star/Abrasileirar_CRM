import type { ContractStatus, ProficiencyLevel } from "@/lib/types";

export const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  a1: "A1 — Iniciante",
  a2: "A2 — Básico",
  b1: "B1 — Intermediário",
  b2: "B2 — Intermediário Alto",
  c1: "C1 — Avançado",
  c2: "C2 — Proficiente",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: "Ativo",
  completed: "Concluído",
  expired: "Expirado",
  cancelled: "Cancelado",
};

export const MODALITY_LABELS: Record<string, string> = {
  intensive: "Imersão",
  regular: "Regular",
  exam_prep: "Preparatório",
  workshop: "Workshop",
  mentoring: "Mentoria",
};

/** Hours remaining below this threshold triggers a visual alert (RF04). */
export const LOW_HOURS_THRESHOLD = 5;
