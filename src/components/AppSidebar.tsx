import { cn } from "@/lib/utils";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Award,
  History,
  Users,
  Medal,
  LogOut,
  Calendar,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Emitir medalha", path: "/emit", icon: Award },
  { label: "Histórico", path: "/history", icon: History },
  { label: "Gerenciar medalhas", path: "/medals", icon: Medal },
  { label: "Alunos", path: "/students", icon: Users },
  { label: "Eventos", path: "/events", icon: Calendar }
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Award className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-primary-foreground tracking-tight">
          Muttley
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium border-l-2 border-sidebar-primary"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {item.label}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3">
          <UserAvatar name="Prof. Diogo Santana" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-sidebar-foreground truncate font-medium">Diogo Santana</p>
            <p className="text-[11px] text-sidebar-muted truncate">Professor</p>
          </div>
          <button
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            title="Sair"
            onClick={() => navigate("/login")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
