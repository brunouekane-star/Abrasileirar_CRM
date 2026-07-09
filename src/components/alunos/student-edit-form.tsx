"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStudent } from "@/lib/actions/students";
import { PROFICIENCY_LABELS } from "@/lib/labels";
import type { ProficiencyLevel, Student, TeacherOption } from "@/lib/types";

const LEVELS: ProficiencyLevel[] = ["a1", "a2", "b1", "b2", "c1", "c2"];
const NONE = "__none__";

export function StudentEditForm({
  student,
  teachers,
}: {
  student: Student;
  teachers: TeacherOption[];
}) {
  const router = useRouter();
  const [level, setLevel] = useState<string>(student.proficiency_level ?? NONE);
  const [teacher, setTeacher] = useState<string>(
    student.assigned_teacher_id ?? NONE,
  );
  const [notes, setNotes] = useState<string>(student.cultural_notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateStudent({
      id: student.id,
      proficiency_level: level === NONE ? null : level,
      assigned_teacher_id: teacher === NONE ? null : teacher,
      cultural_notes: notes || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao salvar", { description: result.error });
      return;
    }
    toast.success("Aluno atualizado!");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nível de proficiência</Label>
          <Select
            items={{ [NONE]: "Não avaliado", ...PROFICIENCY_LABELS }}
            value={level}
            onValueChange={(v) => setLevel(v as string)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Não avaliado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Não avaliado</SelectItem>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {PROFICIENCY_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Professor responsável</Label>
          <Select
            items={{
              [NONE]: "Sem professor",
              ...Object.fromEntries(
                teachers.map((t) => [t.id, t.full_name || "(sem nome)"]),
              ),
            }}
            value={teacher}
            onValueChange={(v) => setTeacher(v as string)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem professor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem professor</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name || "(sem nome)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cultural_notes">Observações culturais</Label>
        <Textarea
          id="cultural_notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contexto cultural relevante para as aulas..."
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
}
