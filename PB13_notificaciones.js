const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "tu_correo@gmail.com", // cámbialo
    pass: "tu_contraseña"        // cámbialo
  },
});

// Endpoint para enviar notificación
app.post("/notificar", async (req, res) => {
  const { email, evento } = req.body;

  const mensajes = {
    creacion: "Tu solicitud ha sido creada correctamente.",
    aprobacion: "¡Tu solicitud ha sido aprobada!",
    rechazo: "Lo sentimos, tu solicitud fue rechazada.",
  };

  try {
    await transporter.sendMail({
      from: "tu_correo@gmail.com",
      to: email,
      subject: `Notificación: ${evento}`,
      text: mensajes[evento] || "Evento desconocido.",
    });

    res.json({ ok: true, mensaje: `Correo enviado por evento: ${evento}` });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(3001, () => console.log("PB13_notificaciones corriendo en http://localhost:3001"));
