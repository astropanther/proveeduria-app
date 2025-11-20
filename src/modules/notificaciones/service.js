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
 * @returns {Promise<object>} Resultado de la operación
 */
export async function enviarNotificacion(email, evento) {
  const mensajes = {
    creacion: 'Tu solicitud ha sido creada correctamente.',
    aprobacion: '¡Tu solicitud ha sido aprobada!',
    rechazo: 'Lo sentimos, tu solicitud fue rechazada.',
    anulacion: 'Tu solicitud ha sido anulada.',
  };

  const asuntos = {
    creacion: 'Solicitud Creada',
    aprobacion: 'Solicitud Aprobada',
    rechazo: 'Solicitud Rechazada',
    anulacion: 'Solicitud Anulada',
  };

  // Si no hay configuración de email, solo loguear (para desarrollo)
  if (!env.MAIL_USER || !env.MAIL_PASSWORD) {
    console.log(`[NOTIFICACIÓN] Email a ${email}: ${mensajes[evento] || 'Evento desconocido'}`);
    return { enviado: false, modo: 'desarrollo', email, evento };
  }

  try {
    const mailTransporter = getTransporter();

    const mensaje = mensajes[evento] || 'Notificación del sistema.';
    const asunto = asuntos[evento] || 'Notificación';

    await mailTransporter.sendMail({
      from: env.MAIL_USER,
      to: email,
      subject: `ProcureHub - ${asunto}`,
      text: mensaje,
    });

    return { enviado: true, email, evento };
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw new Error(`Error al enviar notificación: ${error.message}`);
  }
}

