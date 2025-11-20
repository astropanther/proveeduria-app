import express from "express";
import { generarReportes } from "../service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const resultado = await generarReportes(req.body);
  res.json(resultado);
});

export default router;
