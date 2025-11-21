import express from "express";
import { generarReportes } from "../service.js";
import { authGuard } from "../../../middleware/authGuard.js";
import { ROLES } from "../../users/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /reportes
 * Genera reportes (PB-14)
 * Requiere autenticación (admin o aprobador financiero)
 */
router.post("/", authGuard([ROLES.ADMIN, ROLES.APROBADOR_FINANCIERO]), async (req, res) => {
  try {
    const resultado = await generarReportes(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al generar reportes",
    });
  }
});

/**
 * GET /reportes/descargar/:archivo
 * Descarga un archivo de reporte generado
 * Requiere autenticación
 */
router.get("/descargar/:archivo", authGuard([ROLES.ADMIN, ROLES.APROBADOR_FINANCIERO]), (req, res) => {
  try {
    const { archivo } = req.params;
    const decodedArchivo = decodeURIComponent(archivo);
    // Usar path absoluto desde la raíz del proyecto (debe coincidir con service.js)
    const reportsDir = path.resolve(process.cwd(), 'reports');
    const filePath = path.join(reportsDir, decodedArchivo);

    // Normalizar paths para comparación segura
    const normalizedReportsDir = path.normalize(reportsDir);
    const normalizedFilePath = path.normalize(filePath);

    console.log('Intentando descargar archivo:');
    console.log('- Archivo recibido:', archivo);
    console.log('- Archivo decodificado:', decodedArchivo);
    console.log('- Reports dir:', normalizedReportsDir);
    console.log('- File path:', normalizedFilePath);
    console.log('- Existe?', fs.existsSync(normalizedFilePath));

    // Listar archivos en la carpeta para debugging
    if (fs.existsSync(normalizedReportsDir)) {
      const archivos = fs.readdirSync(normalizedReportsDir);
      console.log('- Archivos en carpeta:', archivos);
    }

    // Validar que el archivo existe y está en la carpeta de reportes
    if (!fs.existsSync(normalizedFilePath)) {
      console.error(`Archivo no encontrado: ${normalizedFilePath}`);
      // Intentar buscar el archivo sin decodificar
      const altPath = path.join(reportsDir, archivo);
      if (fs.existsSync(altPath)) {
        console.log('Archivo encontrado con nombre alternativo:', altPath);
        const fileStream = fs.createReadStream(altPath);
        const contentType = archivo.endsWith(".pdf") ? "application/pdf" : 
                           archivo.endsWith(".xlsx") ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                           "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${archivo}"`);
        fileStream.pipe(res);
        return;
      }
      return res.status(404).json({ error: `Archivo no encontrado: ${decodedArchivo}` });
    }

    // Validar que el archivo está dentro de la carpeta de reportes (seguridad)
    if (!normalizedFilePath.startsWith(normalizedReportsDir)) {
      console.error(`Intento de acceso fuera de carpeta: ${normalizedFilePath}`);
      return res.status(403).json({ error: "Acceso no permitido" });
    }

    // Determinar content-type
    let contentType = "application/octet-stream";
    if (decodedArchivo.endsWith(".pdf")) {
      contentType = "application/pdf";
    } else if (decodedArchivo.endsWith(".xlsx")) {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${decodedArchivo}"`
    );

    const fileStream = fs.createReadStream(normalizedFilePath);
    fileStream.on("error", (err) => {
      console.error("Error al leer archivo:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error al leer archivo" });
      }
    });
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error en descarga:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || "Error al descargar archivo",
      });
    }
  }
});

export default router;
