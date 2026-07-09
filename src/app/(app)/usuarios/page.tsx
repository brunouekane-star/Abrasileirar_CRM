import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  UsersManager,
  type ManagedUser,
} from "@/components/usuarios/users-manager";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Admin-only page (defense in depth beyond the sidebar filter).
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .order("role")
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Crie contas e defina o nível de acesso (Admin ou Professor).
        </p>
      </div>

      <UsersManager
        users={(users as ManagedUser[]) ?? []}
        currentUserId={user.id}
      />
    </div>
  );
}
