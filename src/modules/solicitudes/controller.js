/**
 * Solicitudes controller
 * PB-10: Crear Solicitud de Compra
 * PB-11: Aprobar o Rechazar Solicitud
 * PB-12: Anular Solicitud Pendiente
 */

import * as solicitudesRepository from './repository.js';
import { enviarNotificacion } from '../notificaciones/service.js';
import { registrarActividad } from '../auditoria/service.js';

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
      usuarioId: userId,
      accion: 'CREAR_SOLICITUD',
      entidad: 'Solicitud',
      entidadId: nuevaSolicitud.id,
      detalles: `Solicitud ${nuevaSolicitud.numero} creada`,
    });

    // Enviar notificación
    try {
      await enviarNotificacion(usuarioEmail, 'creacion');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      // No fallar la creación si la notificación falla
    }

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

    // Filtrar por usuario si no es admin
    const userId = req.user.userId || req.user.id;
    if (req.user.role !== 'Administrador') {
      filters.usuarioId = userId;
    } else if (usuarioId) {
      filters.usuarioId = parseInt(usuarioId);
    }

    const solicitudes = await solicitudesRepository.getAllSolicitudes(filters);
    res.json(solicitudes);
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

    // Verificar permisos: solo el usuario que la creó o un admin puede verla
    const userId = req.user.userId || req.user.id;
    if (req.user.role !== 'Administrador' && solicitud.usuarioId !== userId) {
      return res.status(403).json({
        error: 'No tienes permiso para ver esta solicitud',
      });
    }

    res.json(solicitud);
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

    // Verificar rol del aprobador
    const esAprobadorJefe = req.user.role === 'Aprobador Jefe';
    const esAprobadorFinanciero = req.user.role === 'Aprobador Financiero';
    const esAdmin = req.user.role === 'Administrador';

    if (!esAprobadorJefe && !esAprobadorFinanciero && !esAdmin) {
      return res.status(403).json({
        error: 'No tienes permiso para aprobar solicitudes',
      });
    }

    // Lógica de aprobación: necesita ambos aprobadores o admin
    let updates = {};
    const ahora = new Date().toISOString();

    const userId = req.user.userId || req.user.id;
    if (esAdmin) {
      // Admin puede aprobar directamente
      updates = {
        estado: 'Aprobada',
        aprobadorJefe: userId,
        aprobadorFinanciero: userId,
        fechaAprobacion: ahora,
      };
    } else if (esAprobadorJefe && !solicitud.aprobadorJefe) {
      // Primer aprobador (Jefe)
      updates = {
        aprobadorJefe: userId,
      };
      // Si ya tiene aprobador financiero, se aprueba completamente
      if (solicitud.aprobadorFinanciero) {
        updates.estado = 'Aprobada';
        updates.fechaAprobacion = ahora;
      }
    } else if (esAprobadorFinanciero && !solicitud.aprobadorFinanciero) {
      // Segundo aprobador (Financiero)
      updates = {
        aprobadorFinanciero: userId,
      };
      // Si ya tiene aprobador jefe, se aprueba completamente
      if (solicitud.aprobadorJefe) {
        updates.estado = 'Aprobada';
        updates.fechaAprobacion = ahora;
      }
    } else {
      return res.status(400).json({
        error: 'Esta solicitud ya fue procesada por tu rol',
      });
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
      try {
        await enviarNotificacion(solicitud.usuarioEmail, 'aprobacion');
      } catch (error) {
        console.error('Error al enviar notificación:', error);
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

    // Enviar notificación
    try {
      await enviarNotificacion(solicitud.usuarioEmail, 'rechazo', {
        folio: solicitud.numero,
        motivo,
      });
    } catch (error) {
      console.error('Error al enviar notificación:', error);
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

    // Enviar notificación
    try {
      await enviarNotificacion(solicitud.usuarioEmail, 'anulacion');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
    }

    res.json(solicitudActualizada);
  } catch (error) {
    console.error('Error al anular solicitud:', error);
    res.status(500).json({
      error: error.message || 'Error al anular solicitud',
    });
  }
}

