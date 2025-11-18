# ProcureHub

Sistema de gestión de solicitudes de compra con flujo de aprobaciones.

## Estructura del Proyecto

El proyecto tiene dos partes principales:

- `src/` - Backend (servidor API)
- `frontend/` - Interfaz de usuario
- `scripts/` - Scripts de utilidad

## Requisitos

Necesitas tener instalado:
- Node.js versión 18 o superior
- npm

## Instalación

### Backend

Instala las dependencias del backend:

```bash
npm install
```

Opcional: Crea un archivo `.env` con las siguientes variables:

```
PORT=3000
JWT_SECRET=tu-secret-key
DB_SERVER=...
DB_USER=...
DB_PASSWORD=...
DB_DATABASE=...
```

### Frontend

Instala las dependencias del frontend:

```bash
cd frontend
npm install
```

## Cómo Ejecutar el Sistema

### Desarrollo

Necesitas abrir dos terminales:

**Terminal 1 - Backend:**
```bash
npm run dev
```
El backend estará disponible en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará disponible en `http://localhost:5173`

### Crear Usuario Administrador

Antes de usar el sistema, necesitas crear el usuario administrador:

```bash
npm run seed:admin
```

O desde Postman o cualquier cliente HTTP:
```
POST http://localhost:3000/auth/init
```

Luego puedes iniciar sesión con:
- Email: `admin@proveeduria.com`
- Contraseña: `admin123`

## Endpoints de la API

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/init` - Crear usuario admin (solo en desarrollo)

### Usuarios (requiere ser administrador)
- `GET /users` - Ver lista de usuarios
- `GET /users/:id` - Ver un usuario específico
- `POST /users` - Crear nuevo usuario
- `PUT /users/:id` - Actualizar usuario

## Tecnologías Utilizadas

### Backend
- Node.js
- Express
- JWT para autenticación
- bcryptjs para encriptar contraseñas
- SQL Server (pendiente de implementación)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI

## Notas Importantes

- Los datos están guardados en memoria temporalmente. Esto significa que si reinicias el servidor, los datos se pierden. Esto es solo para desarrollo.
- Cuando se complete la conexión a SQL Server, los datos se guardarán permanentemente en la base de datos.
- El frontend se conecta al backend automáticamente mediante un proxy.
- El token de autenticación se guarda en el navegador para mantener la sesión activa.
- Si reinicias el servidor, necesitas volver a crear el usuario admin usando `npm run seed:admin` o `POST /auth/init`.
