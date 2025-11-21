import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './SidebarNav';
import { DashboardAdmin } from './dashboards/DashboardAdmin';
import { DashboardComprador } from './dashboards/DashboardComprador';
import { DashboardAprobador } from './dashboards/DashboardAprobador';
import { GestionUsuarios } from './GestionUsuarios';
import { SolicitudesCompra } from './SolicitudesCompra';
import { AprobacionSolicitudes } from './AprobacionSolicitudes';
import { Reportes } from './Reportes';
import { User } from '../App';

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export type View = 'dashboard' | 'usuarios' | 'solicitudes' | 'aprobaciones' | 'reportes';

export function MainLayout({ user, onLogout, isDarkMode, onToggleDarkMode }: MainLayoutProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (user.rol === 'admin') return <DashboardAdmin />;
        if (user.rol === 'comprador') return <DashboardComprador />;
        return <DashboardAprobador rol={user.rol} />;
      case 'usuarios':
        return <GestionUsuarios />;
      case 'solicitudes':
        return <SolicitudesCompra userRole={user.rol} />;
      case 'aprobaciones':
        return <AprobacionSolicitudes userRole={user.rol} />;
      case 'reportes':
        return <Reportes userRole={user.rol} />;
      default:
        return <DashboardAdmin />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header user={user} onLogout={onLogout} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          userRole={user.rol}
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto bg-background">
          {renderView()}
        </main>
      </div>
    </div>
  );
}