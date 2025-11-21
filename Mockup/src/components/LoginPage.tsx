import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, Lock, AlertCircle, CheckCircle2, Rocket, Sun, Moon } from 'lucide-react';
import { User, UserRole } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Mock users para testing
const mockUsers = [
  { id: '1', email: 'admin@empresa.com', password: 'admin123', nombre: 'Admin Usuario', rol: 'admin' as UserRole },
  { id: '2', email: 'comprador@empresa.com', password: 'comprador123', nombre: 'Juan Pérez', rol: 'comprador' as UserRole },
  { id: '3', email: 'jefe@empresa.com', password: 'jefe123', nombre: 'María García', rol: 'aprobador_jefe' as UserRole },
  { id: '4', email: 'finanzas@empresa.com', password: 'finanzas123', nombre: 'Carlos López', rol: 'aprobador_financiero' as UserRole },
];

export function LoginPage({ onLogin, isDarkMode, onToggleDarkMode }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      setSuccess('Inicio de sesión exitoso');
      setTimeout(() => {
        onLogin({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
      }, 500);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient for dark mode */}
      {isDarkMode && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-950/5"></div>
      )}
      
      {/* Dark mode toggle */}
      <div className="absolute top-8 right-8 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDarkMode}
          className="border-border bg-background hover:bg-accent"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="p-1 border border-border">
              <Rocket className="h-16 w-16 text-foreground" strokeWidth={1} />
            </div>
          </div>
          <h1 className="text-foreground mb-3 text-3xl">Sistema de Proveeduría</h1>
          <div className="h-px w-24 mx-auto bg-red-600 mb-3"></div>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[0.7rem]">Gestión de Solicitudes de Compra</p>
        </div>

        <Card className="border border-border bg-card">
          <CardHeader className="space-y-6 pb-8">
            <CardTitle className="text-card-foreground text-center tracking-[0.2em]">Iniciar Sesión</CardTitle>
            <div className="h-px bg-border"></div>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-muted-foreground">Correo Electrónico</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    className="h-14 bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:border-red-600 focus:ring-0 transition-all px-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-muted-foreground">Contraseña</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-14 bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:border-red-600 focus:ring-0 transition-all px-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-500 bg-red-500/5 border border-red-500/20 p-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm tracking-wider">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 text-foreground bg-accent border border-border p-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="text-sm tracking-wider">{success}</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white border-0 transition-all tracking-[0.2em]"
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em] mb-4">Usuarios de prueba:</p>
              <div className="space-y-2 text-muted-foreground text-[0.7rem] font-mono">
                <p>admin@empresa.com / admin123</p>
                <p>comprador@empresa.com / comprador123</p>
                <p>jefe@empresa.com / jefe123</p>
                <p>finanzas@empresa.com / finanzas123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}