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
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
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
};

// Solicitudes API (placeholder - implementar cuando esté listo)
export const solicitudesAPI = {
  getAll: async () => {
    return request<any[]>('/solicitudes');
  },

  getById: async (id: number) => {
    return request<any>(`/solicitudes/${id}`);
  },

  create: async (solicitudData: any) => {
    return request<any>('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(solicitudData),
    });
  },
};

// Reportes API (placeholder - implementar cuando esté listo)
export const reportesAPI = {
  getByFilters: async (filters: { estado?: string; fechaInicio?: string; fechaFin?: string }) => {
    const params = new URLSearchParams();
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
    
    const query = params.toString();
    return request<any[]>(`/reportes${query ? `?${query}` : ''}`);
  },
};

