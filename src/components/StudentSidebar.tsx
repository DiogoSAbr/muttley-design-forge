import { cn } from "@/lib/utils";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Award, Calendar, LogOut, User, Medal } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "Eventos", path: "/student/events", icon: Calendar },
  { label: "Minhas Medalhas", path: "/student/medals", icon: Medal },
  { label: "Perfil", path: "/student/profile", icon: User },
];

export function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-40">
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Award className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-primary-foreground tracking-tight">
          Muttley
        </span>
      </div>

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

      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3">
          <UserAvatar name={user?.name ?? "Aluno"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-sidebar-foreground truncate font-medium">{user?.name}</p>
            <p className="text-[11px] text-sidebar-muted truncate">Aluno</p>
          </div>
          <button
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            title="Sair"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
