const nodemailer = require('nodemailer');

// Configuración del servidor de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña'
  }
});

// Función para enviar notificación
function enviarNotificacion(usuarioEmail, evento) {
  const mensajes = {
    creacion: 'Tu solicitud ha sido creada correctamente.',
    aprobacion: '¡Tu solicitud ha sido aprobada!',
    rechazo: 'Lo sentimos, tu solicitud fue rechazada.'
  };

  const mailOptions = {
    from: 'tu_correo@gmail.com',
    to: usuarioEmail,
    subject: `Notificación: ${evento}`,
    text: mensajes[evento]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}

// Ejemplo de uso
enviarNotificacion('usuario@ejemplo.com', 'aprobacion');
