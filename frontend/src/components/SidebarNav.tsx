import { Button } from './ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../App';
import { View } from './MainLayout';

interface SidebarProps {
  userRole: UserRole;
  currentView: View;
  onViewChange: (view: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'comprador', 'aprobador_jefe', 'aprobador_financiero'],
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: Users,
    roles: ['admin'],
  },
  {
    id: 'solicitudes',
    label: 'Solicitudes',
    icon: FileText,
    roles: ['admin', 'comprador', 'aprobador_jefe', 'aprobador_financiero'],
  },
  {
    id: 'aprobaciones',
    label: 'Aprobaciones',
    icon: CheckSquare,
    roles: ['admin', 'aprobador_jefe', 'aprobador_financiero'],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    roles: ['admin', 'aprobador_financiero'],
  },
];

export function Sidebar({ userRole, currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" strokeWidth={1} />
          ) : (
            <ChevronLeft className="h-5 w-5" strokeWidth={1} />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-6 space-y-3">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'} transition-all h-14 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground border border-sidebar-border'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-4'} shrink-0`} strokeWidth={1.5} />
              {!collapsed && <span className="uppercase tracking-[0.15em] text-[0.7rem]">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-6 border-t border-sidebar-border">
          <div className="space-y-2">
            <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em]">ProcureHub</p>
            <div className="h-px bg-red-600 w-12"></div>
          </div>
        </div>
      )}
    </div>
  );
}