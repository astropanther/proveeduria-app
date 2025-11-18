# ProcureHub

Este es el repositorio del sistema ProcureHub, un sistema para gestionar solicitudes de compra con flujo de aprobaciones.

## Estructura del Proyecto

El proyecto tiene dos carpetas principales:

- `src/` - Aquí está todo el código del backend (la API)
- `frontend/` - Aquí está la interfaz que usa React
- `scripts/` - Algunos scripts útiles que he creado

## Lo que Necesitas para Empezar

Antes de empezar, asegúrate de tener instalado:
- Node.js (versión 18 o más nueva)
- npm (viene con Node.js)

## Instalación

### Backend

Primero instala las dependencias del backend:

```bash
npm install
```

Si quieres, puedes crear un archivo `.env` en la raíz del proyecto con estas variables (aunque por ahora no son obligatorias):

```
PORT=3000
JWT_SECRET=tu-secret-key
DB_SERVER=...
DB_USER=...
DB_PASSWORD=...
DB_DATABASE=...
```

### Frontend

Para el frontend, entra a la carpeta e instala las dependencias:

```bash
cd frontend
npm install
```

## Cómo Correr el Proyecto

Necesitas tener dos terminales abiertas, una para el backend y otra para el frontend.

**Terminal 1 - Backend:**
```bash
npm run dev
```
Esto inicia el servidor en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Esto inicia la interfaz en `http://localhost:5173`

## Crear el Usuario Administrador

Antes de poder usar el sistema, necesitas crear el usuario administrador. Hay dos formas:

**Opción 1 - Desde la terminal:**
```bash
npm run seed:admin
```

**Opción 2 - Desde Postman o cualquier cliente HTTP:**
```
POST http://localhost:3000/auth/init
```

Después de crear el admin, puedes iniciar sesión con:
- Email: `admin@proveeduria.com`
- Contraseña: `admin123`

## Endpoints Disponibles

### Autenticación
- `POST /auth/login` - Para iniciar sesión
- `POST /auth/init` - Para crear el admin (solo funciona en desarrollo)

### Usuarios (solo para administradores)
- `GET /users` - Ver todos los usuarios
- `GET /users/:id` - Ver un usuario específico
- `POST /users` - Crear un nuevo usuario
- `PUT /users/:id` - Actualizar un usuario

## Cosas Importantes que Debes Saber

- Por ahora los datos están guardados en memoria. Esto significa que si reinicias el servidor, se pierden todos los datos. Esto es temporal hasta que Roberto termine de conectar la base de datos.
- Cuando Roberto termine la conexión a SQL Server, solo necesitamos cambiar el archivo `src/modules/users/usersData.js` por consultas reales a la base de datos.
- El frontend se conecta al backend automáticamente. Cuando haces una petición a `/api`, se redirige a `http://localhost:3000`.
- El token de autenticación se guarda en el navegador para que no tengas que iniciar sesión cada vez.
- Si reinicias el servidor y pierdes los datos, solo vuelve a ejecutar `npm run seed:admin` o `POST /auth/init` para crear el admin de nuevo.

## Si Tienes Problemas

- Si el frontend no se conecta al backend, verifica que ambos estén corriendo en las terminales correctas.
- Si no puedes hacer login, asegúrate de haber creado el usuario admin primero.
- Si los datos desaparecen, es normal. Están en memoria y se pierden al reiniciar. Solo vuelve a crear el admin.
