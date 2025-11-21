/**
 * In-memory data store for auditoría (dummy data)
 * PB-15: Registro de Actividades del Sistema
 * TODO: Replace with database when PB-20 is complete
 */

let actividades = [];

export function getAllActividades() {
  return [...actividades];
}

export function getActividadesByUsuario(usuarioId) {
  return actividades.filter(a => a.usuarioId === parseInt(usuarioId));
}

export function getActividadesByEntidad(entidad, entidadId) {
  return actividades.filter(a => a.entidad === entidad && a.entidadId === parseInt(entidadId));
}

export function addActividad(actividad) {
  const nuevaActividad = {
    ...actividad,
    id: actividades.length + 1,
    fecha: new Date().toISOString(),
  };
  actividades.push(nuevaActividad);
  
  // Mantener solo las últimas 1000 actividades en memoria
  if (actividades.length > 1000) {
    actividades = actividades.slice(-1000);
  }
  
  return nuevaActividad;
}

export function clearActividades() {
  actividades = [];
}

