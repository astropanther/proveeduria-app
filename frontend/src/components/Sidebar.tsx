import { LayoutDashboard, Users, ShoppingCart, Package, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

type View = 'dashboard' | 'proveedores' | 'ordenes' | 'productos';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'proveedores' as View, label: 'Proveedores', icon: Users },
    { id: 'ordenes' as View, label: 'Órdenes de Compra', icon: ShoppingCart },
    { id: 'productos' as View, label: 'Productos', icon: Package },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-blue-600">ProcureHub</h1>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator />
      
      <div className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-3 h-5 w-5" />
          Configuración
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
