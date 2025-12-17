/**
 * Solicitudes controller
 * PB-10: Crear Solicitud de Compra
 * PB-11: Aprobar o Rechazar Solicitud
 * PB-12: Anular Solicitud Pendiente
 */

import * as solicitudesRepository from './repository.js';
import { enviarNotificacion } from '../notificaciones/service.js';
import { getAprobadoresYAdmin } from '../notificaciones/notificationHelper.js';
import { registrarActividad } from '../auditoria/service.js';
import {
  puedeVerSolicitud,
  puedeAprobarSolicitud,
  filtrarCamposSolicitud,
  ROLES,
  LIMITES_APROBACION,
} from './permissions.js';

/**
 * Crear una nueva solicitud (PB-10)
 */
export async function crearSolicitud(req, res) {
  try {
    const { descripcion, monto, categoria, prioridad, justificacion } = req.body;
    const usuarioId = req.user.userId || req.user.id;
    const usuarioEmail = req.user.email;
    const usuario = req.user.nombre || req.user.email?.split('@')[0] || 'Usuario';

    // Validaciones
    if (!descripcion || !monto || !categoria) {
      return res.status(400).json({
        error: 'Descripción, monto y categoría son requeridos',
      });
    }

    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({
        error: 'El monto debe ser un número positivo',
      });
    }

    // Crear solicitud
    const nuevaSolicitud = await solicitudesRepository.createSolicitud({
      descripcion,
      monto: parseFloat(monto),
      categoria,
      prioridad: prioridad || 'media',
      justificacion: justificacion || '',
      usuarioId,
      usuario,
      usuarioEmail,
      fecha: new Date().toISOString().split('T')[0],
    });

    // Registrar actividad
    await registrarActividad({
      usuarioId: usuarioId,
      accion: 'CREAR_SOLICITUD',
      entidad: 'Solicitud',
      entidadId: nuevaSolicitud.id,
      detalles: `Solicitud ${nuevaSolicitud.numero} creada`,
    });

    // Enviar notificación al comprador
    try {
      await enviarNotificacion(usuarioEmail, 'creacion', {
        solicitudId: nuevaSolicitud.id,
        numero: nuevaSolicitud.numero,
        usuarioId: usuarioId, // Pasar usuarioId directamente
      }, 'comprador');
    } catch (error) {
      console.error('Error al enviar notificación al comprador:', error);
    }

    // Enviar notificación a aprobadores y admin
    try {
      const { findAll: findAllUsers } = await import('../users/repository.js');
      const usuariosANotificar = await getAprobadoresYAdmin(findAllUsers);
      
      console.log(`[SOLICITUDES] Notificando a ${usuariosANotificar.length} usuarios (aprobadores y admin)`);
      
      for (const usuarioANotificar of usuariosANotificar) {
        try {
          await enviarNotificacion(usuarioANotificar.email, 'nueva_solicitud', {
            usuario: usuario,
            descripcion: descripcion,
            numero: nuevaSolicitud.numero,
            monto: monto,
            solicitudId: nuevaSolicitud.id,
            usuarioId: usuarioANotificar.id, // Pasar usuarioId directamente
          }, 'admin');
        } catch (error) {
          console.error(`[SOLICITUDES] Error al enviar notificación a ${usuarioANotificar.email}:`, error);
        }
      }
    } catch (error) {
      console.error('[SOLICITUDES] Error al enviar notificaciones a aprobadores:', error);
      // No fallar la creación si la notificación falla
    }

    // No filtrar campos al crear, devolver la solicitud completa
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      error: error.message || 'Error al crear solicitud',
    });
  }
}

/**
 * Listar solicitudes
 */
export async function listarSolicitudes(req, res) {
  try {
    const { estado, usuarioId } = req.query;
    const filters = {};

    // Filtrar por estado si se proporciona
    if (estado && estado !== 'todos') {
      filters.estado = estado;
    }

    // Aplicar filtros según rol y permisos
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    // Admin puede ver todo
    if (userRole === ROLES.ADMIN) {
      if (usuarioId) {
        filters.usuarioId = parseInt(usuarioId);
      }
    }
    // Comprador solo ve sus propias solicitudes
    else if (userRole === ROLES.COMPRADOR) {
      filters.usuarioId = userId;
    }
    // Aprobadores ven solicitudes pendientes que necesitan su aprobación
    else if (userRole === ROLES.APROBADOR_JEFE || userRole === ROLES.APROBADOR_FINANCIERO) {
      // Por defecto mostrar pendientes, pero pueden ver todas si no hay filtro
      if (!estado || estado === 'Pendiente') {
        filters.estado = 'Pendiente';
      }
    }

    const solicitudes = await solicitudesRepository.getAllSolicitudes(filters);
    
    // Filtrar campos según permisos y aplicar control de visibilidad
    const solicitudesFiltradas = solicitudes
      .filter(s => {
        try {
          return puedeVerSolicitud(userRole, userId, s);
        } catch (error) {
          console.error('Error al verificar permisos de solicitud:', error);
          return false;
        }
      })
      .map(s => {
        try {
          return filtrarCamposSolicitud(userRole, userId, s);
        } catch (error) {
          console.error('Error al filtrar campos de solicitud:', error);
          return null;
        }
      })
      .filter(s => s !== null); // Remover solicitudes sin permiso

    res.json(solicitudesFiltradas);
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    res.status(500).json({
      error: error.message || 'Error al listar solicitudes',
    });
  }
}

/**
 * Obtener una solicitud por ID
 */
export async function obtenerSolicitud(req, res) {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesRepository.getSolicitudById(id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
      });
    }

    // Verificar permisos usando el módulo de permisos
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    if (!puedeVerSolicitud(userRole, userId, solicitud)) {
      return res.status(403).json({
        error: 'No tienes permiso para ver esta solicitud',
      });
    }

    // Filtrar campos según permisos
    const solicitudFiltrada = filtrarCamposSolicitud(userRole, userId, solicitud);
    
    if (!solicitudFiltrada) {
      return res.status(403).json({
        error: 'No tienes permiso para ver esta solicitud',
      });
    }

    res.json(solicitudFiltrada);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener solicitud',
    });
  }
}

/**
 * Aprobar solicitud (PB-11)
 */
export async function aprobarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesRepository.getSolicitudById(id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.estado !== 'Pendiente') {
      return res.status(400).json({
        error: 'Solo se pueden aprobar solicitudes pendientes',
      });
    }

    const userRole = req.user.role;
    const userId = req.user.userId || req.user.id;

    // Verificar permisos usando el módulo de permisos
    if (!puedeAprobarSolicitud(userRole, userId, solicitud)) {
      // Mensaje más específico
      if (solicitud.estado !== 'Pendiente') {
        return res.status(403).json({
          error: `Esta solicitud ya fue ${solicitud.estado.toLowerCase()}. No se puede aprobar nuevamente.`,
        });
      }
      
      // Verificar si ya fue aprobada por este usuario
      if (solicitud.aprobadorJefe === userId || solicitud.aprobadorFinanciero === userId) {
        return res.status(403).json({
          error: 'Ya has aprobado esta solicitud anteriormente.',
        });
      }
      
      // Verificar permisos por monto
      const monto = parseFloat(solicitud.monto) || 0;
      if (userRole === ROLES.APROBADOR_FINANCIERO && monto < LIMITES_APROBACION.APROBADOR_FINANCIERO_MIN) {
        return res.status(403).json({
          error: `No tienes permiso para aprobar solicitudes menores a $${LIMITES_APROBACION.APROBADOR_FINANCIERO_MIN.toLocaleString('es-ES')}.`,
        });
      }
      
      return res.status(403).json({
        error: 'No tienes permiso para aprobar esta solicitud.',
      });
    }

    const esAdmin = userRole === ROLES.ADMIN;
    const esAprobadorJefe = userRole === ROLES.APROBADOR_JEFE;
    const esAprobadorFinanciero = userRole === ROLES.APROBADOR_FINANCIERO;
    const monto = parseFloat(solicitud.monto) || 0;

    // Lógica de aprobación según monto y roles
    let updates = {};
    const ahora = new Date().toISOString();

    if (esAdmin) {
      // Admin puede aprobar directamente
      updates = {
        estado: 'Aprobada',
        aprobadorJefe: userId,
        aprobadorFinanciero: userId,
        fechaAprobacion: ahora,
      };
    } else if (esAprobadorJefe) {
      // Aprobador Jefe
      updates = {
        aprobadorJefe: userId,
      };
      
      // Si el monto es < $50,000, puede aprobar solo
      if (monto < LIMITES_APROBACION.APROBADOR_FINANCIERO_MIN) {
        updates.estado = 'Aprobada';
        updates.fechaAprobacion = ahora;
        updates.aprobadorFinanciero = userId; // Se auto-asigna para montos pequeños
      }
      // Si el monto >= $50,000, necesita también aprobación financiera
      else if (solicitud.aprobadorFinanciero) {
        // Si ya tiene aprobador financiero, se aprueba completamente
        updates.estado = 'Aprobada';
        updates.fechaAprobacion = ahora;
      }
    } else if (esAprobadorFinanciero) {
      // Aprobador Financiero
      updates = {
        aprobadorFinanciero: userId,
      };
      
      // Si el monto >= $50,000, siempre requiere aprobación financiera
      if (monto >= LIMITES_APROBACION.APROBADOR_FINANCIERO_MIN) {
        // Si ya tiene aprobador jefe, se aprueba completamente
        if (solicitud.aprobadorJefe) {
          updates.estado = 'Aprobada';
          updates.fechaAprobacion = ahora;
        }
      } else {
        // Para montos menores, si ya tiene aprobación del jefe, se aprueba
        if (solicitud.aprobadorJefe) {
          updates.estado = 'Aprobada';
          updates.fechaAprobacion = ahora;
        }
      }
    }

    const solicitudActualizada = await solicitudesRepository.updateSolicitud(id, updates);

    // Registrar actividad
    await registrarActividad({
      usuarioId: userId,
      accion: 'APROBAR_SOLICITUD',
      entidad: 'Solicitud',
      entidadId: solicitud.id,
      detalles: `Solicitud ${solicitud.numero} aprobada`,
    });

    // Enviar notificación si está completamente aprobada
    if (solicitudActualizada.estado === 'Aprobada') {
      // Notificar al comprador (general)
      try {
        await enviarNotificacion(solicitud.usuarioEmail, 'aprobacion', {
          solicitudId: solicitud.id,
          numero: solicitud.numero,
          usuarioId: solicitud.usuarioId, // Pasar usuarioId del comprador
        }, 'comprador');
      } catch (error) {
        console.error('Error al enviar notificación al comprador:', error);
      }

      // Notificar a todos los aprobadores y admin sobre la aprobación
      try {
        const { findAll: findAllUsers } = await import('../users/repository.js');
        const usuariosANotificar = await getAprobadoresYAdmin(findAllUsers);
        const aprobadorNombre = req.user.nombre || req.user.email?.split('@')[0] || 'Aprobador';
        
        console.log(`[SOLICITUDES] Notificando aprobación a ${usuariosANotificar.length} usuarios`);
        
        for (const usuario of usuariosANotificar) {
          try {
            await enviarNotificacion(usuario.email, 'aprobada', {
              aprobador: aprobadorNombre,
              numero: solicitud.numero,
              solicitudId: solicitud.id,
              usuarioId: usuario.id, // Pasar usuarioId del usuario
            }, 'admin');
          } catch (error) {
            console.error(`[SOLICITUDES] Error al enviar notificación a ${usuario.email}:`, error);
          }
        }
      } catch (error) {
        console.error('[SOLICITUDES] Error al enviar notificaciones:', error);
      }
    }

    res.json(solicitudActualizada);
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({
      error: error.message || 'Error al aprobar solicitud',
    });
  }
}

/**
 * Rechazar solicitud (PB-11)
 */
export async function rechazarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const solicitud = await solicitudesRepository.getSolicitudById(id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.estado !== 'Pendiente') {
      return res.status(400).json({
        error: 'Solo se pueden rechazar solicitudes pendientes',
      });
    }

    // Verificar rol del aprobador
    const esAprobador = req.user.role === 'Aprobador Jefe' || 
                       req.user.role === 'Aprobador Financiero' ||
                       req.user.role === 'Administrador';

    if (!esAprobador) {
      return res.status(403).json({
        error: 'No tienes permiso para rechazar solicitudes',
      });
    }

    if (!motivo) {
      return res.status(400).json({
        error: 'El motivo del rechazo es requerido',
      });
    }

    const solicitudActualizada = await solicitudesRepository.updateSolicitud(id, {
      estado: 'Rechazada',
      motivoRechazo: motivo,
      fechaRechazo: new Date().toISOString(),
    });

    // Registrar actividad
    const userId = req.user.userId || req.user.id;
    await registrarActividad({
      usuarioId: userId,
      accion: 'RECHAZAR_SOLICITUD',
      entidad: 'Solicitud',
      entidadId: solicitud.id,
      detalles: `Solicitud ${solicitud.numero} rechazada: ${motivo}`,
    });

      // Enviar notificación al comprador (general)
      try {
        await enviarNotificacion(solicitud.usuarioEmail, 'rechazo', {
          folio: solicitud.numero,
          motivo,
          solicitudId: solicitud.id,
          numero: solicitud.numero,
          usuarioId: solicitud.usuarioId, // Pasar usuarioId del comprador
        }, 'comprador');
      } catch (error) {
        console.error('Error al enviar notificación al comprador:', error);
      }

    // Enviar notificación a todos los aprobadores y admin sobre el rechazo
    try {
      const { findAll: findAllUsers } = await import('../users/repository.js');
      const usuariosANotificar = await getAprobadoresYAdmin(findAllUsers);
      const aprobadorNombre = req.user.nombre || req.user.email?.split('@')[0] || 'Aprobador';
      
      console.log(`[SOLICITUDES] Notificando rechazo a ${usuariosANotificar.length} usuarios`);
      
      for (const usuario of usuariosANotificar) {
        try {
          await enviarNotificacion(usuario.email, 'rechazada', {
            aprobador: aprobadorNombre,
            numero: solicitud.numero,
            motivo: motivo,
            solicitudId: solicitud.id,
            usuarioId: usuario.id, // Pasar usuarioId del usuario
          }, 'admin');
        } catch (error) {
          console.error(`[SOLICITUDES] Error al enviar notificación a ${usuario.email}:`, error);
        }
      }
    } catch (error) {
      console.error('[SOLICITUDES] Error al enviar notificaciones:', error);
    }

    res.json(solicitudActualizada);
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({
      error: error.message || 'Error al rechazar solicitud',
    });
  }
}

/**
 * Anular solicitud (PB-12)
 */
export async function anularSolicitud(req, res) {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesRepository.getSolicitudById(id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.estado !== 'Pendiente') {
      return res.status(400).json({
        error: 'Solo se pueden anular solicitudes pendientes',
      });
    }

    // Solo el usuario que la creó o un admin puede anularla
    const userId = req.user.userId || req.user.id;
    if (req.user.role !== 'Administrador' && solicitud.usuarioId !== userId) {
      return res.status(403).json({
        error: 'No tienes permiso para anular esta solicitud',
      });
    }

    const solicitudActualizada = await solicitudesRepository.updateSolicitud(id, {
      estado: 'Anulada',
      fechaAnulacion: new Date().toISOString(),
    });

    // Registrar actividad
    await registrarActividad({
      usuarioId: userId,
      accion: 'ANULAR_SOLICITUD',
      entidad: 'Solicitud',
      entidadId: solicitud.id,
      detalles: `Solicitud ${solicitud.numero} anulada`,
    });

      // Enviar notificación al comprador (general)
      try {
        await enviarNotificacion(solicitud.usuarioEmail, 'anulacion', {
          solicitudId: solicitud.id,
          numero: solicitud.numero,
          usuarioId: solicitud.usuarioId, // Pasar usuarioId del comprador
        }, 'comprador');
      } catch (error) {
        console.error('Error al enviar notificación al comprador:', error);
      }

    // Enviar notificación a todos los aprobadores y admin sobre la anulación
    try {
      const { findAll: findAllUsers } = await import('../users/repository.js');
      const usuariosANotificar = await getAprobadoresYAdmin(findAllUsers);
      const usuarioNombre = solicitud.usuario || solicitud.usuarioEmail?.split('@')[0] || 'Usuario';
      
      console.log(`[SOLICITUDES] Notificando anulación a ${usuariosANotificar.length} usuarios`);
      
      for (const usuario of usuariosANotificar) {
        try {
          await enviarNotificacion(usuario.email, 'anulada', {
            usuario: usuarioNombre,
            numero: solicitud.numero,
            solicitudId: solicitud.id,
            usuarioId: usuario.id, // Pasar usuarioId del usuario
          }, 'admin');
        } catch (error) {
          console.error(`[SOLICITUDES] Error al enviar notificación a ${usuario.email}:`, error);
        }
      }
    } catch (error) {
      console.error('[SOLICITUDES] Error al enviar notificaciones:', error);
    }

    res.json(solicitudActualizada);
  } catch (error) {
    console.error('Error al anular solicitud:', error);
    res.status(500).json({
      error: error.message || 'Error al anular solicitud',
    });
  }
}

/**
 * Deshacer rechazo de solicitud (solo dentro de 15 minutos)
 */
export async function deshacerRechazo(req, res) {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesRepository.getSolicitudById(id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.estado !== 'Rechazada') {
      return res.status(400).json({
        error: 'Solo se pueden deshacer solicitudes rechazadas',
      });
    }

    // Verificar que no hayan pasado más de 15 minutos desde el rechazo
    if (!solicitud.fechaRechazo) {
      return res.status(400).json({
        error: 'No se puede determinar cuándo fue rechazada esta solicitud',
      });
    }

    const fechaRechazo = new Date(solicitud.fechaRechazo);
    const ahora = new Date();
    const minutosTranscurridos = (ahora - fechaRechazo) / (1000 * 60);

    if (minutosTranscurridos > 15) {
      return res.status(400).json({
        error: 'El tiempo para deshacer el rechazo ha expirado (15 minutos)',
        minutosTranscurridos: Math.round(minutosTranscurridos),
      });
    }

    // Verificar permisos: solo quien rechazó o un admin puede deshacer
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    // Solo admin puede deshacer cualquier rechazo, o el mismo usuario que rechazó
    // (Nota: necesitaríamos guardar quién rechazó, por ahora solo admin)
    if (userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        error: 'Solo un administrador puede deshacer rechazos',
      });
    }

    // Restaurar a estado Pendiente y limpiar datos de rechazo
    const solicitudActualizada = await solicitudesRepository.updateSolicitud(id, {
      estado: 'Pendiente',
      motivoRechazo: null,
      fechaRechazo: null,
    });

    // Registrar actividad
    await registrarActividad({
      usuarioId: userId,
      accion: 'DESHACER_RECHAZO',
      entidad: 'Solicitud',
      entidadId: solicitud.id,
      detalles: `Rechazo de solicitud ${solicitud.numero} deshecho`,
    });

    res.json({
      ...solicitudActualizada,
      minutosRestantes: Math.max(0, 15 - Math.round(minutosTranscurridos)),
    });
  } catch (error) {
    console.error('Error al deshacer rechazo:', error);
    res.status(500).json({
      error: error.message || 'Error al deshacer rechazo',
    });
  }
}

/**
 * Deshacer aprobación de solicitud (solo dentro de 10-15 minutos)
 */
export async function deshacerAprobacion(req, res) {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesRepository.getSolicitudById(id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.estado !== 'Aprobada') {
      return res.status(400).json({
        error: 'Solo se pueden deshacer solicitudes aprobadas',
      });
    }

    // Verificar que no hayan pasado más de 15 minutos desde la aprobación
    if (!solicitud.fechaAprobacion) {
      return res.status(400).json({
        error: 'No se puede determinar cuándo fue aprobada esta solicitud',
      });
    }

    const fechaAprobacion = new Date(solicitud.fechaAprobacion);
    const ahora = new Date();
    const minutosTranscurridos = (ahora - fechaAprobacion) / (1000 * 60);

    if (minutosTranscurridos > 15) {
      return res.status(400).json({
        error: 'El tiempo para deshacer la aprobación ha expirado (15 minutos)',
        minutosTranscurridos: Math.round(minutosTranscurridos),
      });
    }

    // Verificar permisos: solo quien aprobó o un admin puede deshacer
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    // Solo admin puede deshacer cualquier aprobación, o el mismo usuario que aprobó
    if (userRole !== ROLES.ADMIN && 
        solicitud.aprobadorJefe !== userId && 
        solicitud.aprobadorFinanciero !== userId) {
      return res.status(403).json({
        error: 'Solo puedes deshacer aprobaciones que hayas realizado tú mismo o como administrador',
      });
    }

    // Restaurar a estado Pendiente y limpiar datos de aprobación
    const solicitudActualizada = await solicitudesRepository.updateSolicitud(id, {
      estado: 'Pendiente',
      aprobadorJefe: null,
      aprobadorFinanciero: null,
      fechaAprobacion: null,
    });

    // Registrar actividad
    await registrarActividad({
      usuarioId: userId,
      accion: 'DESHACER_APROBACION',
      entidad: 'Solicitud',
      entidadId: solicitud.id,
      detalles: `Aprobación de solicitud ${solicitud.numero} deshecha`,
    });

    res.json({
      ...solicitudActualizada,
      minutosRestantes: Math.max(0, 15 - Math.round(minutosTranscurridos)),
    });
  } catch (error) {
    console.error('Error al deshacer aprobación:', error);
    res.status(500).json({
      error: error.message || 'Error al deshacer aprobación',
    });
  }
}

