/**
 * In-memory data store for solicitudes (dummy data)
 * TODO: Replace with database when PB-20 is complete
 */

let solicitudes = [
  {
    id: 1,
    numero: 'SOL-2024-045',
    descripcion: 'Compra de equipos de oficina',
    usuarioId: 1,
    usuario: 'Juan Pérez',
    usuarioEmail: 'juan@ejemplo.com',
    monto: 5200,
    categoria: 'Equipamiento',
    fecha: '2024-06-15',
    estado: 'Pendiente',
    prioridad: 'media',
    justificacion: 'Se requieren nuevos equipos para el área de ventas debido al aumento de personal.',
    aprobadorJefe: null,
    aprobadorFinanciero: null,
    motivoRechazo: null,
    fechaCreacion: '2024-06-15T10:00:00Z',
    fechaAprobacion: null,
    fechaRechazo: null,
    fechaAnulacion: null,
  },
  {
    id: 2,
    numero: 'SOL-2024-044',
    descripcion: 'Software de gestión empresarial',
    usuarioId: 2,
    usuario: 'Ana González',
    usuarioEmail: 'ana@ejemplo.com',
    monto: 12800,
    categoria: 'Software',
    fecha: '2024-06-14',
    estado: 'Aprobada',
    prioridad: 'alta',
    justificacion: 'Sistema crítico para mejorar la eficiencia operativa del departamento.',
    aprobadorJefe: 3,
    aprobadorFinanciero: 4,
    motivoRechazo: null,
    fechaCreacion: '2024-06-14T09:00:00Z',
    fechaAprobacion: '2024-06-14T15:30:00Z',
    fechaRechazo: null,
    fechaAnulacion: null,
  },
  {
    id: 3,
    numero: 'SOL-2024-043',
    descripcion: 'Material de construcción',
    usuarioId: 3,
    usuario: 'Carlos Ruiz',
    usuarioEmail: 'carlos@ejemplo.com',
    monto: 8450,
    categoria: 'Materiales',
    fecha: '2024-06-14',
    estado: 'Aprobada',
    prioridad: 'alta',
    justificacion: 'Materiales urgentes para proyecto en curso.',
    aprobadorJefe: 3,
    aprobadorFinanciero: 4,
    motivoRechazo: null,
    fechaCreacion: '2024-06-14T08:00:00Z',
    fechaAprobacion: '2024-06-14T14:00:00Z',
    fechaRechazo: null,
    fechaAnulacion: null,
  },
  {
    id: 4,
    numero: 'SOL-2024-042',
    descripcion: 'Mobiliario de oficina',
    usuarioId: 4,
    usuario: 'María López',
    usuarioEmail: 'maria@ejemplo.com',
    monto: 6900,
    categoria: 'Mobiliario',
    fecha: '2024-06-13',
    estado: 'Rechazada',
    prioridad: 'media',
    justificacion: 'Reemplazo de mobiliario desgastado.',
    aprobadorJefe: null,
    aprobadorFinanciero: null,
    motivoRechazo: 'Presupuesto insuficiente para este trimestre.',
    fechaCreacion: '2024-06-13T10:00:00Z',
    fechaAprobacion: null,
    fechaRechazo: '2024-06-13T16:00:00Z',
    fechaAnulacion: null,
  },
  {
    id: 5,
    numero: 'SOL-2024-041',
    descripcion: 'Equipamiento tecnológico',
    usuarioId: 5,
    usuario: 'Luis Martín',
    usuarioEmail: 'luis@ejemplo.com',
    monto: 15200,
    categoria: 'Tecnología',
    fecha: '2024-06-13',
    estado: 'Pendiente',
    prioridad: 'alta',
    justificacion: 'Actualización de servidores para mejorar capacidad y seguridad.',
    aprobadorJefe: null,
    aprobadorFinanciero: null,
    motivoRechazo: null,
    fechaCreacion: '2024-06-13T11:00:00Z',
    fechaAprobacion: null,
    fechaRechazo: null,
    fechaAnulacion: null,
  },
  {
    id: 6,
    numero: 'SOL-2024-040',
    descripcion: 'Suministros de limpieza',
    usuarioId: 1,
    usuario: 'Juan Pérez',
    usuarioEmail: 'juan@ejemplo.com',
    monto: 1200,
    categoria: 'Servicios',
    fecha: '2024-06-12',
    estado: 'Aprobada',
    prioridad: 'baja',
    justificacion: 'Suministros mensuales necesarios.',
    aprobadorJefe: 3,
    aprobadorFinanciero: 4,
    motivoRechazo: null,
    fechaCreacion: '2024-06-12T09:00:00Z',
    fechaAprobacion: '2024-06-12T12:00:00Z',
    fechaRechazo: null,
    fechaAnulacion: null,
  },
  {
    id: 7,
    numero: 'SOL-2024-039',
    descripcion: 'Herramientas de trabajo',
    usuarioId: 2,
    usuario: 'Ana González',
    usuarioEmail: 'ana@ejemplo.com',
    monto: 3450,
    categoria: 'Herramientas',
    fecha: '2024-06-11',
    estado: 'Anulada',
    prioridad: 'media',
    justificacion: 'Herramientas para taller.',
    aprobadorJefe: null,
    aprobadorFinanciero: null,
    motivoRechazo: null,
    fechaCreacion: '2024-06-11T10:00:00Z',
    fechaAprobacion: null,
    fechaRechazo: null,
    fechaAnulacion: '2024-06-11T17:00:00Z',
  },
];

let nextId = 8;
let nextNumero = 46; // Para generar SOL-2024-046, etc.

export function getAllSolicitudes() {
  return [...solicitudes];
}

export function getSolicitudById(id) {
  return solicitudes.find(s => s.id === parseInt(id));
}

export function getSolicitudesByUsuario(usuarioId) {
  return solicitudes.filter(s => s.usuarioId === parseInt(usuarioId));
}

export function getSolicitudesByEstado(estado) {
  return solicitudes.filter(s => s.estado === estado);
}

export function addSolicitud(solicitud) {
  const nuevaSolicitud = {
    ...solicitud,
    id: nextId++,
    numero: `SOL-2024-${String(nextNumero++).padStart(3, '0')}`,
    estado: 'Pendiente',
    fechaCreacion: new Date().toISOString(),
    fechaAprobacion: null,
    fechaRechazo: null,
    fechaAnulacion: null,
    aprobadorJefe: null,
    aprobadorFinanciero: null,
    motivoRechazo: null,
  };
  solicitudes.push(nuevaSolicitud);
  return nuevaSolicitud;
}

export function updateSolicitud(id, updates) {
  const index = solicitudes.findIndex(s => s.id === parseInt(id));
  if (index === -1) return null;
  
  solicitudes[index] = {
    ...solicitudes[index],
    ...updates,
  };
  return solicitudes[index];
}

export function deleteSolicitud(id) {
  const index = solicitudes.findIndex(s => s.id === parseInt(id));
  if (index === -1) return false;
  solicitudes.splice(index, 1);
  return true;
}

