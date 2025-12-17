import express from "express";
import { enviarNotificacion } from "../service.js";
import * as notificacionesRepository from "../repository.js";
import { authGuard } from "../../../middleware/authGuard.js";
import { getAprobadoresYAdmin, shouldSeeAllNotifications } from "../notificationHelper.js";

const router = express.Router();

/**
 * POST /notificaciones
 * Envía una notificación por email (PB-13)
 * Requiere autenticación
 */
router.post("/", authGuard([]), async (req, res) => {
  try {
    const { email, evento, solicitudNumero, mensaje } = req.body;

    if (!email || !evento) {
      return res.status(400).json({
        error: "Email y evento son requeridos",
      });
    }

    // Si es un evento de contacto, enviar a admin y aprobadores
    if (evento === 'contacto') {
      console.log('[NOTIFICACIONES ROUTES] Procesando evento de contacto');
      console.log('[NOTIFICACIONES ROUTES] Datos recibidos:', { solicitudNumero, mensaje, solicitudId: req.body.solicitudId });
      
      const { findAll: findAllUsers } = await import('../../users/repository.js');
      const usuariosANotificar = await getAprobadoresYAdmin(findAllUsers);
      
      console.log(`[NOTIFICACIONES ROUTES] Enviando a ${usuariosANotificar.length} usuarios:`, usuariosANotificar.map(u => ({ id: u.id, email: u.email, role: u.role })));
      
      const resultados = [];
      for (const usuario of usuariosANotificar) {
        try {
          const resultado = await enviarNotificacion(usuario.email, evento, {
            solicitudNumero,
            mensaje,
            solicitudId: req.body.solicitudId || null,
            usuarioId: usuario.id, // Pasar usuarioId directamente
            compradorEmail: req.body.compradorEmail || null,
            compradorNombre: req.body.compradorNombre || null,
          }, 'admin');
          resultados.push(resultado);
          console.log(`[NOTIFICACIONES ROUTES] Notificación enviada a ${usuario.email}:`, resultado);
        } catch (error) {
          console.error(`[NOTIFICACIONES ROUTES] Error al enviar notificación a ${usuario.email}:`, error);
        }
      }
      console.log(`[NOTIFICACIONES ROUTES] Total notificaciones enviadas: ${resultados.length}`);
      return res.json({ enviado: resultados.length > 0, resultados, total: resultados.length });
    }

    const resultado = await enviarNotificacion(email, evento, req.body, 'comprador');
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al enviar notificación",
    });
  }
});

/**
 * GET /notificaciones
 * Obtiene las notificaciones del usuario autenticado
 */
router.get("/", authGuard([]), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;
    const { leida, tipo, evento, limite } = req.query;

    console.log(`[NOTIFICACIONES API] GET /notificaciones`);
    console.log(`[NOTIFICACIONES API] req.user completo:`, JSON.stringify(req.user, null, 2));
    console.log(`[NOTIFICACIONES API] userId extraído: ${userId} (tipo: ${typeof userId})`);
    console.log(`[NOTIFICACIONES API] userRole: ${userRole}`);
    console.log(`[NOTIFICACIONES API] Filtros solicitados - tipo: ${tipo}, leida: ${leida}, evento: ${evento}, limite: ${limite}`);

    if (!userId) {
      console.error('[NOTIFICACIONES API] ERROR: userId no disponible en req.user');
      console.error('[NOTIFICACIONES API] req.user contiene:', Object.keys(req.user));
      return res.status(400).json({
        error: "Usuario no identificado. Por favor, inicia sesión nuevamente.",
      });
    }

    const filters = {};
    if (leida !== undefined) filters.leida = leida === 'true';
    
    // Si es admin, no filtrar por tipo (ver todas sus notificaciones)
    // Si no es admin y viene el filtro de tipo, aplicarlo
    if (tipo && !shouldSeeAllNotifications(userRole)) {
      filters.tipo = tipo;
    }
    
    if (evento) filters.evento = evento;
    if (limite) filters.limite = parseInt(limite);

    console.log(`[NOTIFICACIONES API] Filtros aplicados (admin ve todas):`, JSON.stringify(filters, null, 2));
    
    const notificaciones = await notificacionesRepository.getNotificacionesByUsuario(userId, filters);
    
    console.log(`[NOTIFICACIONES API] Encontradas ${notificaciones.length} notificaciones para userId ${userId} (rol: ${userRole})`);
    if (notificaciones.length > 0) {
      console.log(`[NOTIFICACIONES API] Primera notificación:`, JSON.stringify(notificaciones[0], null, 2));
      console.log(`[NOTIFICACIONES API] Tipos de notificaciones encontradas:`, [...new Set(notificaciones.map(n => n.tipo))]);
    } else {
      console.warn(`[NOTIFICACIONES API] No se encontraron notificaciones para userId ${userId} con filtros:`, filters);
    }
    
    res.json(notificaciones);
  } catch (error) {
    console.error('[NOTIFICACIONES API] Error al obtener notificaciones:', error);
    console.error('[NOTIFICACIONES API] Stack:', error.stack);
    res.status(500).json({
      error: error.message || "Error al obtener notificaciones",
    });
  }
});

/**
 * GET /notificaciones/no-leidas
 * Cuenta las notificaciones no leídas del usuario
 */
router.get("/no-leidas", authGuard([]), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const count = await notificacionesRepository.contarNoLeidas(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al contar notificaciones",
    });
  }
});

/**
 * PATCH /notificaciones/:id/leida
 * Marca una notificación como leída
 */
router.patch("/:id/leida", authGuard([]), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    // Verificar que la notificación pertenece al usuario
    const notificacion = await notificacionesRepository.getNotificacionById(id);
    if (!notificacion) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }
    if (notificacion.usuarioId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para esta notificación" });
    }

    const actualizada = await notificacionesRepository.marcarComoLeida(id);
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al marcar notificación como leída",
    });
  }
});

/**
 * PATCH /notificaciones/marcar-todas-leidas
 * Marca todas las notificaciones del usuario como leídas
 */
router.patch("/marcar-todas-leidas", authGuard([]), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const resultado = await notificacionesRepository.marcarTodasComoLeidas(userId);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al marcar todas como leídas",
    });
  }
});

/**
 * GET /notificaciones/debug
 * Endpoint de debugging para verificar el estado del sistema de notificaciones
 */
router.get("/debug", authGuard([]), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // Obtener todas las notificaciones del usuario sin filtros
    const todas = await notificacionesRepository.getNotificacionesByUsuario(userId, {});
    
    // Obtener notificaciones por tipo
    const comprador = await notificacionesRepository.getNotificacionesByUsuario(userId, { tipo: 'comprador' });
    const aprobador = await notificacionesRepository.getNotificacionesByUsuario(userId, { tipo: 'aprobador' });
    
    // Contar no leídas
    const noLeidas = await notificacionesRepository.contarNoLeidas(userId);
    
    res.json({
      userId,
      userInfo: {
        email: req.user.email,
        role: req.user.role,
      },
      estadisticas: {
        total: todas.length,
        comprador: comprador.length,
        aprobador: aprobador.length,
        noLeidas,
      },
      todas,
      comprador,
      aprobador,
    });
  } catch (error) {
    console.error('[NOTIFICACIONES DEBUG] Error:', error);
    res.status(500).json({
      error: error.message || "Error en debugging",
    });
  }
});

export default router;
