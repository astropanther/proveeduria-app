import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, Lock, AlertCircle, CheckCircle2, Rocket, Sun, Moon } from 'lucide-react';
import { User, UserRole } from '../App';
import { authAPI } from '../services/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Mapear roles del backend a roles del frontend
function mapRole(backendRole: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'Administrador': 'admin',
    'Comprador': 'comprador',
    'Aprobador Jefe': 'aprobador_jefe',
    'Aprobador Financiero': 'aprobador_financiero',
  };
  return roleMap[backendRole] || 'comprador';
}

export function LoginPage({ onLogin, isDarkMode, onToggleDarkMode }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Mapear usuario del backend al formato del frontend
      const user: User = {
        id: response.user.id.toString(),
        nombre: response.user.nombre || response.user.email.split('@')[0],
        email: response.user.email,
        rol: mapRole(response.user.role),
      };

      setSuccess('Inicio de sesión exitoso');
      setTimeout(() => {
        onLogin(user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
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
          <h1 className="text-foreground mb-3 text-3xl">ProcureHub</h1>
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
                disabled={loading}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white border-0 transition-all tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em] mb-4">Usuario de prueba:</p>
              <div className="space-y-2 text-muted-foreground text-[0.7rem] font-mono">
                <p>admin@proveeduria.com / admin123</p>
                <p className="text-[0.6rem] text-muted-foreground/70 mt-2">
                  (Ejecuta POST /api/auth/init para crear el usuario admin)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}