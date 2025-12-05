import express from "express";
import { enviarNotificacion } from "../service.js";
import { authGuard } from "../../../middleware/authGuard.js";

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
      const { findAll: findAllUsers } = await import('../../users/repository.js');
      const adminUsers = await findAllUsers({ role: 'Administrador', activo: true });
      const aprobadoresJefe = await findAllUsers({ role: 'Aprobador Jefe', activo: true });
      const aprobadoresFinancieros = await findAllUsers({ role: 'Aprobador Financiero', activo: true });
      const usuariosANotificar = [...adminUsers, ...aprobadoresJefe, ...aprobadoresFinancieros];
      
      const resultados = [];
      for (const usuario of usuariosANotificar) {
        try {
          const resultado = await enviarNotificacion(usuario.email, evento, {
            solicitudNumero,
            mensaje,
          }, 'admin');
          resultados.push(resultado);
        } catch (error) {
          console.error(`Error al enviar notificación a ${usuario.email}:`, error);
        }
      }
      return res.json({ enviado: resultados.length > 0, resultados });
    }

    const resultado = await enviarNotificacion(email, evento, req.body, 'comprador');
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al enviar notificación",
    });
  }
});

export default router;
