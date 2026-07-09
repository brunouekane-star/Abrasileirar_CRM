import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, avatar_url")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || "";
  const email = profile?.email || user.email || "";
  const role = profile?.role || "professor";

  return (
    <div className="flex min-h-screen">
      <AppSidebar isAdmin={role === "admin"} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b bg-background px-6">
          <UserMenu
            name={name}
            email={email}
            role={role}
            avatarUrl={profile?.avatar_url}
          />
        </header>
        <main className="flex-1 bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
