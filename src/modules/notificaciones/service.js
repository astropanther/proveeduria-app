/**
 * Notification service
 * PB-13: Envío de Notificaciones Automáticas
 */

import nodemailer from 'nodemailer';
import { loadEnv } from '../../config/env.js';

const env = loadEnv();

// Configurar transporte SMTP
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST || 'smtp.gmail.com',
      port: env.MAIL_PORT || 587,
      secure: false,
      auth: {
        user: env.MAIL_USER || '',
        pass: env.MAIL_PASSWORD || '',
      },
    });
  }
  return transporter;
}

/**
 * Envía una notificación por email
 * @param {string} email - Email del destinatario
 * @param {string} evento - Tipo de evento (creacion, aprobacion, rechazo, anulacion)
 * @param {object} detalles - Detalles adicionales (folio, motivo, aprobador, etc.)
 * @param {string} tipo - Tipo de notificación: 'comprador' (general) o 'admin' (específica)
 * @returns {Promise<object>} Resultado de la operación
 */
export async function enviarNotificacion(email, evento, detalles = {}, tipo = 'comprador') {
  let mensaje = '';
  let asunto = '';

  if (tipo === 'comprador') {
    // Notificaciones generales para compradores
    const mensajes = {
      creacion: 'Tu solicitud ha sido creada correctamente.',
      aprobacion: '¡Tu solicitud ha sido aprobada!',
      rechazo: detalles.motivo 
        ? `Lo sentimos, tu solicitud fue rechazada. Motivo: ${detalles.motivo}`
        : 'Lo sentimos, tu solicitud fue rechazada.',
      anulacion: 'Tu solicitud ha sido anulada.',
    };

    const asuntos = {
      creacion: 'Solicitud Creada',
      aprobacion: 'Solicitud Aprobada',
      rechazo: 'Solicitud Rechazada',
      anulacion: 'Solicitud Anulada',
    };

    mensaje = mensajes[evento] || 'Notificación del sistema.';
    asunto = asuntos[evento] || 'Notificación';
  } else {
    // Notificaciones específicas para admin/aprobadores
    const mensajes = {
      nueva_solicitud: detalles.usuario && detalles.descripcion
        ? `${detalles.usuario} ha creado una nueva solicitud: "${detalles.descripcion}" (${detalles.numero || ''})`
        : 'Nueva solicitud creada',
      aprobada: detalles.aprobador && detalles.numero
        ? `${detalles.aprobador} aprobó la solicitud ${detalles.numero}`
        : 'Una solicitud ha sido aprobada',
      rechazada: detalles.aprobador && detalles.numero
        ? `${detalles.aprobador} rechazó la solicitud ${detalles.numero}${detalles.motivo ? `. Motivo: ${detalles.motivo}` : ''}`
        : 'Una solicitud ha sido rechazada',
      anulada: detalles.usuario && detalles.numero
        ? `${detalles.usuario} anuló la solicitud ${detalles.numero}`
        : 'Una solicitud ha sido anulada',
      contacto: detalles.solicitudNumero && detalles.mensaje
        ? `Un comprador tiene una duda sobre la solicitud ${detalles.solicitudNumero}: "${detalles.mensaje}"`
        : 'Un usuario tiene una duda sobre una solicitud',
    };

    const asuntos = {
      nueva_solicitud: 'Nueva Solicitud Creada',
      aprobada: 'Solicitud Aprobada',
      rechazada: 'Solicitud Rechazada',
      anulada: 'Solicitud Anulada',
      contacto: 'Consulta de Usuario',
    };

    mensaje = mensajes[evento] || 'Notificación del sistema.';
    asunto = asuntos[evento] || 'Notificación';
  }

  // Si no hay configuración de email, solo loguear (para desarrollo)
  if (!env.MAIL_USER || !env.MAIL_PASSWORD) {
    console.log(`[NOTIFICACIÓN ${tipo.toUpperCase()}] Email a ${email}: ${mensaje}`);
    return { enviado: false, modo: 'desarrollo', email, evento, tipo };
  }

  try {
    const mailTransporter = getTransporter();

    await mailTransporter.sendMail({
      from: env.MAIL_USER,
      to: email,
      subject: `ProcureHub - ${asunto}`,
      text: mensaje,
    });

    return { enviado: true, email, evento, tipo };
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw new Error(`Error al enviar notificación: ${error.message}`);
  }
}

