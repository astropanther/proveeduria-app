from flask import Flask
from flask_mail import Mail, Message

app = Flask(__name__)

# Configuración del servidor de correo
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tu_correo@gmail.com'  # <-- cámbialo por el tuyo
app.config['MAIL_PASSWORD'] = 'tu_contraseña'        # <-- cámbialo por tu contraseña
mail = Mail(app)

# Función para enviar notificación
def enviar_notificacion(usuario_email, evento):
    mensajes = {
        'creacion': 'Tu solicitud ha sido creada correctamente.',
        'aprobacion': '¡Tu solicitud ha sido aprobada!',
        'rechazo': 'Lo sentimos, tu solicitud fue rechazada.'
    }
    msg = Message(subject=f"Notificación: {evento}",
                  sender='tu_correo@gmail.com',
                  recipients=[usuario_email],
                  body=mensajes[evento])
    mail.send(msg)
    print(f"Correo enviado a {usuario_email} por {evento}")

# Ejemplo de prueba
if __name__ == "__main__":
    with app.app_context():
        enviar_notificacion("usuario@ejemplo.com", "aprobacion")
