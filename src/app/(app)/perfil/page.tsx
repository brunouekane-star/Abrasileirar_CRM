import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/perfil/profile-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Atualize seus dados e sua senha de acesso.
        </p>
      </div>

      <ProfileForm
        initial={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          email: profile?.email ?? user.email ?? "",
        }}
      />
    </div>
  );
}
