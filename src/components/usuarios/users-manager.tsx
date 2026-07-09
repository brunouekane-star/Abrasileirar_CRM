"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShieldCheck, GraduationCap, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, deleteUser, setUserRole } from "@/lib/actions/users";

export type ManagedUser = {
  id: string;
  full_name: string;
  email: string | null;
  role: "admin" | "professor";
  is_active: boolean;
};

function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "professor">("professor");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await createUser({ email, password, fullName, role });
    setSaving(false);
    if (!result.ok) {
      toast.error("Erro ao criar usuário", { description: result.error });
      return;
    }
    toast.success("Usuário criado!");
    setEmail("");
    setFullName("");
    setPassword("");
    setRole("professor");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Novo usuário
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>
              O usuário é criado já confirmado e pode entrar imediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u_name">Nome completo</Label>
              <Input
                id="u_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u_email">E-mail</Label>
              <Input
                id="u_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u_pw">Senha provisória</Label>
              <Input
                id="u_pw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mín. 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select
                items={{ professor: "Professor", admin: "Administrador" }}
                value={role}
                onValueChange={(v) => setRole(v as "admin" | "professor")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserRow({
  user,
  isSelf,
}: {
  user: ManagedUser;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function changeRole(role: "admin" | "professor") {
    if (role === user.role) return;
    setBusy(true);
    const result = await setUserRole(user.id, role);
    setBusy(false);
    if (!result.ok) {
      toast.error("Erro ao alterar papel", { description: result.error });
      return;
    }
    toast.success("Papel atualizado!");
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteUser(user.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error("Erro ao excluir", { description: result.error });
      return;
    }
    toast.success("Usuário excluído.");
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {user.full_name || "(sem nome)"}
            {isSelf ? (
              <span className="ml-2 text-xs text-muted-foreground">(você)</span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={user.role === "admin" ? "default" : "secondary"}
            className="gap-1"
          >
            {user.role === "admin" ? (
              <ShieldCheck className="size-3" />
            ) : (
              <GraduationCap className="size-3" />
            )}
            {user.role === "admin" ? "Admin" : "Professor"}
          </Badge>
          <Select
            items={{ professor: "Professor", admin: "Administrador" }}
            value={user.role}
            onValueChange={(v) => changeRole(v as "admin" | "professor")}
            disabled={busy || isSelf}
          >
            <SelectTrigger className="w-40" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professor">Professor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
          {!isSelf ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Excluir usuário"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. O acesso de{" "}
              <span className="font-medium text-foreground">
                {user.full_name || user.email}
              </span>{" "}
              será removido e não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: ManagedUser[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateUserDialog />
      </div>
      <div className="grid gap-3">
        {users.map((u) => (
          <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
        ))}
      </div>
    </div>
  );
}
