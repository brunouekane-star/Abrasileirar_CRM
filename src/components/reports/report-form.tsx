"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput } from "@/components/reports/rating-input";
import { saveReport } from "@/lib/actions/reports";
import {
  SKILL_KEYS,
  SKILL_LABELS,
  ENGAGEMENT_KEYS,
  ENGAGEMENT_LABELS,
  RATING_LEGEND,
} from "@/lib/reports";
import type { ReportAbsence, StudentReport } from "@/lib/types";

type Ratings = Record<string, number | null>;

function defaultPeriod() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(first), end: iso(last) };
}

const ALL_KEYS = [...SKILL_KEYS, ...ENGAGEMENT_KEYS];

export function ReportForm({
  studentId,
  studentName,
  initial,
}: {
  studentId: number;
  studentName: string;
  initial?: { report: StudentReport; absences: ReportAbsence[] };
}) {
  const router = useRouter();
  const r = initial?.report;
  const dp = defaultPeriod();

  const [periodStart, setPeriodStart] = useState(r?.period_start ?? dp.start);
  const [periodEnd, setPeriodEnd] = useState(r?.period_end ?? dp.end);
  const [totalAulas, setTotalAulas] = useState(String(r?.total_aulas ?? 0));
  const [ratings, setRatings] = useState<Ratings>(() => {
    const init: Ratings = {};
    for (const k of ALL_KEYS) {
      init[k] = (r?.[k as keyof StudentReport] as number | null) ?? null;
    }
    return init;
  });
  const [feedback, setFeedback] = useState<Record<string, string>>(
    () => (r?.feedback as Record<string, string>) ?? {},
  );
  const [recomendacoes, setRecomendacoes] = useState(r?.recomendacoes ?? "");
  const [absences, setAbsences] = useState<ReportAbsence[]>(
    initial?.absences ?? [],
  );
  const [saving, setSaving] = useState(false);

  function setRating(key: string, v: number | null) {
    setRatings((prev) => ({ ...prev, [key]: v }));
  }
  function setFb(key: string, v: string) {
    setFeedback((prev) => ({ ...prev, [key]: v }));
  }
  function updateAbsence(i: number, patch: Partial<ReportAbsence>) {
    setAbsences((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  async function handleSave() {
    setSaving(true);
    const result = await saveReport({
      id: r?.id,
      student_id: studentId,
      period_start: periodStart,
      period_end: periodEnd,
      total_aulas: Number(totalAulas) || 0,
      ...Object.fromEntries(ALL_KEYS.map((k) => [k, ratings[k]])),
      recomendacoes: recomendacoes || null,
      feedback,
      absences: absences.map((a) => ({
        data: a.data || null,
        conteudo: a.conteudo || null,
        repor: !!a.repor,
      })),
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao salvar", { description: result.error });
      return;
    }
    toast.success("Relatório salvo!");
    router.push(`/relatorios/${result.id}`);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Período — {studentName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rp_start">Início</Label>
            <Input
              id="rp_start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rp_end">Fim</Label>
            <Input
              id="rp_end"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desenvolvimento (habilidades)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SKILL_KEYS.map((k) => (
            <div key={k} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">{SKILL_LABELS[k]}</span>
                <RatingInput
                  value={ratings[k]}
                  onChange={(v) => setRating(k, v)}
                />
              </div>
              <Input
                placeholder="Feedback do professor (opcional)"
                value={feedback[k] ?? ""}
                onChange={(e) => setFb(k, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engajamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ENGAGEMENT_KEYS.map((k) => (
            <div key={k} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">{ENGAGEMENT_LABELS[k]}</span>
                <RatingInput
                  value={ratings[k]}
                  onChange={(v) => setRating(k, v)}
                />
              </div>
              <Input
                placeholder="Feedback do professor (opcional)"
                value={feedback[k] ?? ""}
                onChange={(e) => setFb(k, e.target.value)}
              />
            </div>
          ))}
          <p className="pt-1 text-xs text-muted-foreground">
            {RATING_LEGEND.map((l) => `${l.value} ${l.label}`).join(" · ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="total_aulas">Total de aulas no período</Label>
            <Input
              id="total_aulas"
              type="number"
              min="0"
              value={totalAulas}
              onChange={(e) => setTotalAulas(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Faltas</Label>
            {absences.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma falta registrada.
              </p>
            ) : null}
            {absences.map((a, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  className="w-40"
                  value={a.data ?? ""}
                  onChange={(e) => updateAbsence(i, { data: e.target.value })}
                />
                <Input
                  className="min-w-40 flex-1"
                  placeholder="Conteúdo da aula perdida"
                  value={a.conteudo ?? ""}
                  onChange={(e) => updateAbsence(i, { conteudo: e.target.value })}
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={a.repor}
                    onChange={(e) => updateAbsence(i, { repor: e.target.checked })}
                  />
                  Repor
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setAbsences((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  aria-label="Remover falta"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setAbsences((a) => [
                  ...a,
                  { data: "", conteudo: "", repor: false },
                ])
              }
            >
              <Plus className="size-4" /> Adicionar falta
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recomendações do professor</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={recomendacoes}
            onChange={(e) => setRecomendacoes(e.target.value)}
            placeholder="Orientações e próximos passos para o aluno..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar relatório"}
        </Button>
      </div>
    </div>
  );
}
