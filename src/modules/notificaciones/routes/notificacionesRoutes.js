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
    const { email, evento } = req.body;

    if (!email || !evento) {
      return res.status(400).json({
        error: "Email y evento son requeridos",
      });
    }

    const resultado = await enviarNotificacion(email, evento);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al enviar notificación",
    });
  }
});

export default router;
