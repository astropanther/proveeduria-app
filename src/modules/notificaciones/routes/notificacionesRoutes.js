import express from "express";
import { enviarNotificacion } from "../service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, evento } = req.body;
  const resultado = await enviarNotificacion(email, evento);
  res.json(resultado);
});

export default router;
