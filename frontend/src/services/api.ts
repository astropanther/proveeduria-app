/**
 * API Client Service
 * Centraliza todas las llamadas al backend
 */

const API_BASE_URL = '/api';

// Helper para obtener el token del localStorage
function getToken(): string | null {
  return localStorage.getItem('token');
}

// Helper para hacer requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
      
      // Si el error es de token expirado o inválido, limpiar localStorage
      if (response.status === 401 && (errorMessage.includes('Token') || errorMessage.includes('Sesión expirada') || errorMessage.includes('expirado'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Recargar la página para redirigir al login
        window.location.href = '/';
      }
    } catch {
      // Si no es JSON, intentar leer como texto
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
      } catch {
        // Si todo falla, usar el mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    // Por ahora solo limpiamos el token local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  init: async () => {
    return request<{ message: string; user?: any }>('/auth/init', {
      method: 'POST',
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (filters?: { role?: string; activo?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    
    const query = params.toString();
    return request<{ users: any[]; total: number }>(`/users${query ? `?${query}` : ''}`);
  },

  getById: async (id: number) => {
    return request<any>(`/users/${id}`);
  },

  create: async (userData: {
    email: string;
    password: string;
    role: string;
    nombre?: string;
  }) => {
    return request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: number, userData: Partial<any>) => {
    return request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  inactivate: async (id: number) => {
    return request<any>(`/users/${id}/inactivate`, {
      method: 'PATCH',
    });
  },
  activate: async (id: number) => {
    return request<any>(`/users/${id}/activate`, {
      method: 'PATCH',
    });
  },
};

// Solicitudes API (PB-10, PB-11, PB-12)
export const solicitudesAPI = {
  getAll: async (filtros?: { estado?: string; usuarioId?: number }) => {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.usuarioId) params.append('usuarioId', filtros.usuarioId.toString());
    const query = params.toString();
    return request<any[]>(`/solicitudes${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/solicitudes/${id}`);
  },
  create: async (data: {
    descripcion: string;
    monto: number;
    categoria: string;
    prioridad?: string;
    justificacion?: string;
  }) => {
    return request<any>('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  aprobar: async (id: string) => {
    return request<any>(`/solicitudes/${id}/aprobar`, {
      method: 'POST',
    });
  },
  rechazar: async (id: string, motivo: string) => {
    return request<any>(`/solicitudes/${id}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    });
  },
  anular: async (id: string) => {
    return request<any>(`/solicitudes/${id}/anular`, {
      method: 'POST',
    });
  },
  deshacerRechazo: async (id: string) => {
    return request<any>(`/solicitudes/${id}/deshacer-rechazo`, {
      method: 'POST',
    });
  },
  deshacerAprobacion: async (id: string) => {
    return request<any>(`/solicitudes/${id}/deshacer-aprobacion`, {
      method: 'POST',
    });
  },
};

// Notificaciones API (PB-13)
export const notificacionesAPI = {
  enviar: async (email: string, evento: string, detalles?: any) => {
    return request<{ enviado: boolean; modo?: string; email: string; evento: string }>('/notificaciones', {
      method: 'POST',
      body: JSON.stringify({ email, evento, ...detalles }),
    });
  },
  getAll: async (filters?: { leida?: boolean; tipo?: string; evento?: string; limite?: number }) => {
    const params = new URLSearchParams();
    if (filters?.leida !== undefined) params.append('leida', filters.leida.toString());
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.evento) params.append('evento', filters.evento);
    if (filters?.limite) params.append('limite', filters.limite.toString());
    const query = params.toString();
    return request<any[]>(`/notificaciones${query ? `?${query}` : ''}`);
  },
  getNoLeidas: async () => {
    return request<{ count: number }>('/notificaciones/no-leidas');
  },
  marcarComoLeida: async (id: string) => {
    return request<any>(`/notificaciones/${id}/leida`, {
      method: 'PATCH',
    });
  },
  marcarTodasComoLeidas: async () => {
    return request<{ count: number }>('/notificaciones/marcar-todas-leidas', {
      method: 'PATCH',
    });
  },
};

// Reportes API (PB-14)
export const reportesAPI = {
  generar: async (filters: { 
    estado?: string; 
    fechaInicio?: string; 
    fechaFin?: string;
    formato?: 'excel' | 'pdf' | 'ambos';
  }) => {
    return request<{ 
      message: string; 
      total: number; 
      archivos: { excel?: string; pdf?: string };
      filtros: any;
    }>('/reportes', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },

  descargar: async (archivo: string) => {
    const token = getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor inicia sesión.');
    }
    
    console.log('Iniciando descarga de:', archivo);
    console.log('URL:', `${API_BASE_URL}/reportes/descargar/${encodeURIComponent(archivo)}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/reportes/descargar/${encodeURIComponent(archivo)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorMessage = 'Error al descargar archivo';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      console.log('Blob recibido, tamaño:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('El archivo está vacío');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archivo;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de un delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Descarga completada');
      }, 100);
    } catch (error: any) {
      console.error('Error en descarga:', error);
      throw error;
    }
  },
};

// Dashboard API (PB-22)
export const dashboardAPI = {
  getResumen: async () => {
    return request<{
      solicitudes: {
        total: number;
        pendientes: number;
        aprobadas: number;
        rechazadas: number;
        anuladas: number;
        montoTotal: number;
        montoPendiente: number;
        montoAprobado: number;
      };
      usuarios: {
        total: number;
        activos: number;
      };
    }>('/dashboard/resumen');
  },
  getEstadisticas: async () => {
    return request<Array<{
      mes: string;
      total: number;
      aprobadas: number;
      rechazadas: number;
    }>>('/dashboard/estadisticas');
  },
  getRecientes: async (limite: number = 5) => {
    return request<Array<{
      id: string;
      usuario: string;
      monto: string;
      fecha: string;
      estado: string;
    }>>(`/dashboard/recientes?limite=${limite}`);
  },
};

