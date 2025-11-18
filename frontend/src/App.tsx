import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';

export type UserRole = 'admin' | 'comprador' | 'aprobador_jefe' | 'aprobador_financiero';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Mapear rol del backend al formato del frontend
        const roleMap: Record<string, UserRole> = {
          'Administrador': 'admin',
          'Comprador': 'comprador',
          'Aprobador Jefe': 'aprobador_jefe',
          'Aprobador Financiero': 'aprobador_financiero',
        };
        const user: User = {
          id: userData.id.toString(),
          nombre: userData.nombre || userData.email.split('@')[0],
          email: userData.email,
          rol: roleMap[userData.role] || 'comprador',
        };
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class on mount and when it changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />;
  }

  return <MainLayout user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />;
}