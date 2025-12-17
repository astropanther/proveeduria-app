/**
 * Report service
 * PB-14: Generar Reportes por Estado y Fecha
 */

import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllSolicitudes } from '../solicitudes/repository.js';
import { loadEnv } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

// Crear carpeta de reportes si no existe - usar path absoluto desde la raíz del proyecto
const reportsDir = path.resolve(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}
console.log('Reports directory configurado en:', reportsDir);

/**
 * Genera reportes (wrapper que genera ambos formatos)
 * @param {object} filtros - Filtros para las solicitudes (estado, fechaInicio, fechaFin, formato)
 * @returns {Promise<object>} Resultado con archivos generados
 */
export async function generarReportes(filtros = {}) {
  const { estado, fechaInicio, fechaFin, formato = 'ambos' } = filtros;

  // Obtener datos reales de la base de datos
  let solicitudes = [];
  
  try {
    const filters = {};
    if (estado && estado !== 'todos') {
      // Mapear estados del frontend a los del backend
      const estadoMap = {
        'pendiente': 'Pendiente',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada',
        'anulada': 'Anulada',
      };
      filters.estado = estadoMap[estado.toLowerCase()] || estado;
    }
    
    // Obtener todas las solicitudes desde la base de datos
    const todasLasSolicitudes = await getAllSolicitudes(filters);
    
    // Formatear solicitudes para los reportes
    solicitudes = todasLasSolicitudes.map(s => {
      // Formatear fecha correctamente
      let fechaFormateada = new Date().toISOString().split('T')[0];
      if (s.fecha) {
        fechaFormateada = new Date(s.fecha).toISOString().split('T')[0];
      } else if (s.fechaCreacion) {
        fechaFormateada = new Date(s.fechaCreacion).toISOString().split('T')[0];
      }
      
      return {
        id: s.id,
        folio: s.numero || `SOL-${s.id}`,
        numero: s.numero || `SOL-${s.id}`,
        usuario: s.usuario || 'N/A',
        categoria: s.categoria || 'N/A',
        estado: s.estado || 'Pendiente',
        fecha: fechaFormateada,
        monto: parseFloat(s.monto || 0),
        descripcion: s.descripcion || '',
      };
    });

    // Aplicar filtros de fecha
    if (fechaInicio) {
      solicitudes = solicitudes.filter(s => s.fecha >= fechaInicio);
    }
    if (fechaFin) {
      solicitudes = solicitudes.filter(s => s.fecha <= fechaFin);
    }
    
    console.log('Filtros aplicados:', { estado, fechaInicio, fechaFin });
    console.log('Solicitudes obtenidas de BD:', todasLasSolicitudes.length);
    console.log('Solicitudes después de filtros:', solicitudes.length);
  } catch (error) {
    console.error('Error al obtener solicitudes para reporte:', error);
    // Si hay error, usar array vacío en lugar de fallar completamente
    solicitudes = [];
  }

  // Crear timestamp más simple sin caracteres problemáticos
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  const nombreArchivo = `reporte_solicitudes_${timestamp}`;
  const archivos = {};

  console.log('Generando reportes con nombre base:', nombreArchivo);

  // Generar Excel si se solicita
  if (!formato || formato === 'excel' || formato === 'ambos') {
    const excelPath = await generarReporteExcel(solicitudes, nombreArchivo);
    const excelName = path.basename(excelPath);
    archivos.excel = excelName;
    console.log('Excel generado:', excelPath);
    console.log('Nombre del archivo Excel:', excelName);
  }

  // Generar PDF si se solicita
  if (!formato || formato === 'pdf' || formato === 'ambos') {
    const pdfPath = await generarReportePDF(solicitudes, nombreArchivo, filtros);
    const pdfName = path.basename(pdfPath);
    archivos.pdf = pdfName;
    console.log('PDF generado:', pdfPath);
    console.log('Nombre del archivo PDF:', pdfName);
  }

  return {
    message: 'Reportes generados exitosamente',
    total: solicitudes.length,
    archivos,
    filtros,
  };
}

/**
 * Genera un reporte en Excel
 * @param {Array} datos - Array de solicitudes
 * @param {string} nombreArchivo - Nombre del archivo (sin extensión)
 * @returns {Promise<string>} Ruta del archivo generado
 */
async function generarReporteExcel(datos, nombreArchivo = 'reporte_solicitudes') {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Solicitudes');

  // Definir columnas (matching frontend headers)
  sheet.columns = [
    { header: 'N° Solicitud', key: 'numero', width: 20 },
    { header: 'Usuario', key: 'usuario', width: 25 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Monto', key: 'monto', width: 15 },
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Estado', key: 'estado', width: 15 },
  ];

  // Agregar datos
  datos.forEach((solicitud) => {
    sheet.addRow({
      numero: solicitud.numero || solicitud.folio || '',
      usuario: solicitud.usuario || '',
      categoria: solicitud.categoria || '',
      monto: solicitud.monto || 0,
      fecha: solicitud.fecha || '',
      estado: solicitud.estado || '',
    });
  });

  // Estilizar encabezados
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  const filePath = path.join(reportsDir, `${nombreArchivo}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

/**
 * Genera un reporte en PDF
 * @param {Array} datos - Array de solicitudes
 * @param {string} nombreArchivo - Nombre del archivo (sin extensión)
 * @param {object} filtros - Filtros aplicados
 * @returns {Promise<string>} Ruta del archivo generado
 */
async function generarReportePDF(datos, nombreArchivo = 'reporte_solicitudes', filtros = {}) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(reportsDir, `${nombreArchivo}.pdf`);
    const pdf = new PDFDocument({ margin: 50, size: 'LETTER' });
    const stream = fs.createWriteStream(filePath);

    pdf.pipe(stream);

    // Colores que coinciden con el frontend (light mode)
    const colors = {
      primary: '#2563eb',      // Azul principal
      headerBg: '#F1F5F9',    // Gris claro para encabezado (bg-gray-100 equivalente)
      headerText: '#1E293B',   // Gris oscuro para texto
      rowEven: '#FFFFFF',      // Blanco para filas pares
      rowOdd: '#F8FAFC',       // Gris muy claro para filas impares (bg-gray-50)
      border: '#E2E8F0',       // Borde gris claro
      text: '#0F172A',         // Texto principal oscuro
      textMuted: '#64748B',    // Texto secundario (text-muted-foreground)
      success: '#10B981',      // Verde para aprobada
      warning: '#F59E0B',      // Naranja para pendiente
      danger: '#EF4444',       // Rojo para rechazada
      neutral: '#6B7280',      // Gris para anulada
    };

    // Título con estilo del frontend (encabezado general)
    pdf.fontSize(24).font('Helvetica-Bold').fillColor(colors.text).text('Reporte de Solicitudes', { align: 'center' });
    pdf.moveDown(0.3);
    pdf.fontSize(11).font('Helvetica').fillColor(colors.textMuted).text('ProcureHub - Sistema de Gestión de Proveeduría', { align: 'center' });
    pdf.moveDown(1.2);

    // Filtros aplicados (estilo card del frontend)
    if (filtros.estado || filtros.fechaInicio || filtros.fechaFin) {
      // Fondo tipo card
      const filterY = pdf.y;
      pdf.rect(50, filterY - 5, 495, 35).fillColor('#FFFFFF').fillAndStroke(colors.border, 1);
      pdf.fontSize(10).font('Helvetica-Bold').fillColor(colors.text).text('Filtros aplicados', 60, filterY);
      pdf.fontSize(9).font('Helvetica').fillColor(colors.textMuted);
      let filterText = [];
      if (filtros.estado) filterText.push(`Estado: ${filtros.estado}`);
      if (filtros.fechaInicio) filterText.push(`Desde: ${filtros.fechaInicio}`);
      if (filtros.fechaFin) filterText.push(`Hasta: ${filtros.fechaFin}`);
      pdf.text(filterText.join(' • '), 60, filterY + 12);
      pdf.y = filterY + 40;
    }

    // Total de registros
    pdf.fontSize(11).font('Helvetica-Bold').fillColor(colors.text).text(`Total de solicitudes: ${datos.length}`, {});
    pdf.moveDown(1);

    // Configuración de la tabla
    const tableTop = pdf.y;
    const itemHeight = 28;
    const footerHeight = 30;
    const pageHeight = pdf.page.height - footerHeight - 20; // Altura disponible menos pie de página y margen

    // Función para dibujar encabezados de columnas
    function drawTableHeaders(y) {
      const headers = ['N° Solicitud', 'Usuario', 'Categoría', 'Monto', 'Fecha', 'Estado'];
      const columnWidths = [90, 100, 100, 80, 80, 80];
      const startX = 50;
      const headerHeight = 22;
      
      // Fondo gris claro para encabezado (como bg-gray-100)
      pdf.rect(startX, y - 5, 495, headerHeight).fillColor(colors.headerBg).fill();
      pdf.rect(startX, y - 5, 495, headerHeight).strokeColor(colors.border).lineWidth(1).stroke();
      
      // Texto de encabezados
      pdf.fontSize(9).font('Helvetica-Bold').fillColor(colors.headerText);
      let currentX = startX;
      
      headers.forEach((header, i) => {
        pdf.text(header, currentX + 5, y + 2, { width: columnWidths[i] - 10, align: 'left' });
        // Línea vertical entre columnas
        if (i < headers.length - 1) {
          pdf.moveTo(currentX + columnWidths[i], y - 5)
             .lineTo(currentX + columnWidths[i], y + headerHeight - 5)
             .strokeColor(colors.border).lineWidth(0.5).stroke();
        }
        currentX += columnWidths[i];
      });
      
      return { startX, columnWidths, headers };
    }

    // Función para dibujar pie de página
    function drawFooter() {
      const footerY = pdf.page.height - footerHeight;
      pdf.fontSize(8).font('Helvetica').fillColor(colors.textMuted);
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 50, footerY, { align: 'left' });
      pdf.text('ProcureHub - Sistema de Gestión de Proveeduría', 50, footerY + 10, { align: 'left' });
    }

    // Encabezados de la tabla
    const tableConfig = drawTableHeaders(tableTop);
    const { startX, columnWidths, headers } = tableConfig;
    let currentY = tableTop + 22; // Posición después de los encabezados
    pdf.fillColor(colors.text);

    // Función para obtener color del estado
    function getEstadoColor(estado) {
      const estadoLower = (estado || '').toLowerCase();
      if (estadoLower.includes('aprobada')) return colors.success;
      if (estadoLower.includes('pendiente')) return colors.warning;
      if (estadoLower.includes('rechazada')) return colors.danger;
      if (estadoLower.includes('anulada')) return colors.neutral;
      return colors.text;
    }

    // Datos de la tabla
    let currentX = startX; // Declarar currentX fuera del forEach
    datos.forEach((solicitud, index) => {
      // Verificar si necesitamos una nueva página ANTES de dibujar la fila
      // Verificar si la fila cabe en la página actual
      if (currentY + itemHeight > pageHeight && index > 0) {
        // Agregar nueva página solo si hay más datos
        pdf.addPage();
        currentY = 50;
        
        // Redibujar encabezados de columnas en nueva página
        drawTableHeaders(currentY);
        currentY += 22; // Posición después de los encabezados
        pdf.fillColor(colors.text);
      }

      // Fondo alternado para filas (estilo light mode)
      const rowBg = index % 2 === 0 ? colors.rowEven : colors.rowOdd;
      pdf.rect(startX, currentY - 2, 495, itemHeight).fillColor(rowBg).fill();

      // Borde inferior de la fila
      pdf.moveTo(startX, currentY + itemHeight - 2)
         .lineTo(startX + 495, currentY + itemHeight - 2)
         .strokeColor(colors.border).lineWidth(0.5).stroke();

      // Líneas verticales entre columnas
      currentX = startX;
      headers.forEach((_, i) => {
        if (i > 0) {
          pdf.moveTo(currentX, currentY - 2)
             .lineTo(currentX, currentY + itemHeight - 2)
             .strokeColor(colors.border).lineWidth(0.5).stroke();
        }
        currentX += columnWidths[i];
      });

      // Contenido de las celdas
      pdf.fontSize(8).font('Helvetica');
      currentX = startX;
      
      const rowData = [
        solicitud.folio || solicitud.numero || 'N/A',  // N° Solicitud
        solicitud.usuario || 'N/A',                     // Usuario
        solicitud.categoria || 'N/A',                  // Categoría
        `$${(solicitud.monto || 0).toLocaleString('es-ES')}`, // Monto
        solicitud.fecha || 'N/A',                      // Fecha
        solicitud.estado || 'N/A'                      // Estado
      ];

      rowData.forEach((cell, i) => {
        // Color especial para la columna de estado (última columna, índice 5)
        if (i === 5) {
          pdf.fillColor(getEstadoColor(cell));
        } else {
          pdf.fillColor(colors.text);
        }
        pdf.text(cell, currentX + 5, currentY + 6, { width: columnWidths[i] - 10, align: 'left' });
        currentX += columnWidths[i];
      });

      currentY += itemHeight;
    });

    // Dibujar pie de página en la última página
    drawFooter();

    pdf.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

