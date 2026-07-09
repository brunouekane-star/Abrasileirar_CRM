import {
  LayoutDashboard,
  KanbanSquare,
  Building2,
  GraduationCap,
  FileText,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

/** Primary navigation for the CRM shell. */
export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { title: "Empresas", href: "/empresas", icon: Building2 },
  { title: "Alunos", href: "/alunos", icon: GraduationCap },
  { title: "Contratos", href: "/contratos", icon: FileText },
  { title: "Serviços", href: "/servicos", icon: BookOpen },
];
