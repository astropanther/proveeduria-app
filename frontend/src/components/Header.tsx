import { Button } from './ui/button';
import { Rocket, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User } from '../App';
import { Badge } from './ui/badge';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const roleLabels = {
  admin: 'Administrador',
  comprador: 'Comprador',
  aprobador_jefe: 'Aprobador Jefe',
  aprobador_financiero: 'Aprobador Financiero',
};

export function Header({ user, onLogout, isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border px-10 py-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div className="p-1 border border-border">
          <Rocket className="h-7 w-7 text-foreground" strokeWidth={1} />
        </div>
        <div>
          <h1 className="text-foreground text-xl tracking-[0.2em]">ProcureHub</h1>
          <div className="h-px w-16 bg-red-600 mt-2"></div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDarkMode}
          className="border-border bg-background hover:bg-accent h-12 px-4"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-foreground" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-4 border-border bg-background hover:bg-accent text-foreground transition-all h-14 px-5">
              <div className="text-left">
                <p className="text-foreground text-sm tracking-wider">{user.nombre}</p>
                <p className="text-muted-foreground text-xs tracking-wider">{user.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-card border-border">
            <DropdownMenuLabel className="text-muted-foreground uppercase text-[0.65rem] tracking-[0.2em]">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <div className="px-2 py-4">
              <p className="text-muted-foreground mb-3 text-[0.65rem] uppercase tracking-[0.2em]">Rol actual:</p>
              <Badge variant="secondary" className="bg-accent text-foreground border-border uppercase text-[0.65rem] tracking-[0.15em]">
                {roleLabels[user.rol]}
              </Badge>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={onLogout} className="text-red-500 cursor-pointer focus:bg-red-500/10 focus:text-red-500 tracking-wider">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}