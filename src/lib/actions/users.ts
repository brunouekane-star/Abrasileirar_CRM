"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/config";

type Result = { ok: true } | { ok: false; error: string };

/** Ensures the caller is an authenticated admin. Returns their admin-session client. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Apenas administradores podem gerenciar usuários." };
  }
  return { ok: true as const, supabase, userId: user.id };
}

/** Service-role client (server-only). Used solely to create auth users. */
function adminAuthClient() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(
    /[^\x21-\x7E]/g,
    "",
  );
  if (key.split(".").length !== 3) return null;
  return createAdminClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const createSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
  fullName: z.string().trim().min(1, "Informe o nome."),
  role: z.enum(["admin", "professor"]),
});

export async function createUser(input: unknown): Promise<Result> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { email, password, fullName, role } = parsed.data;

  const admin = adminAuthClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor. Adicione a chave e tente novamente.",
    };
  }

  // Create an already-confirmed auth user (service-role only reaches auth).
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) return { ok: false, error: error.message };

  // Set role/name on the profile using the ADMIN SESSION (not service-role) so
  // the privileged-fields trigger — which checks auth.uid() — allows the change.
  const { error: upErr } = await gate.supabase
    .from("profiles")
    .update({ role, full_name: fullName })
    .eq("id", data.user.id);
  if (upErr) return { ok: false, error: upErr.message };

  revalidatePath("/usuarios");
  return { ok: true };
}

export async function setUserRole(
  userId: string,
  role: "admin" | "professor",
): Promise<Result> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.userId === userId && role !== "admin") {
    return { ok: false, error: "Você não pode remover seu próprio acesso de admin." };
  }

  const { error } = await gate.supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/usuarios");
  return { ok: true };
}

export async function setUserActive(
  userId: string,
  isActive: boolean,
): Promise<Result> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.userId === userId && !isActive) {
    return { ok: false, error: "Você não pode desativar a si mesmo." };
  }

  const { error } = await gate.supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/usuarios");
  return { ok: true };
}
