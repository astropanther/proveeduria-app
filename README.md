# ProcureHub

Sistema de gestión de solicitudes de compra con flujo de aprobaciones.

## Inicio Rápido

### Instalación

**Backend:**

```bash
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### Ejecutar el Proyecto

**Terminal 1 - Backend:**

```bash
npm run dev
```

Servidor en `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Interfaz en `http://localhost:5173`

### Configuración

Crea un archivo `.env` en la raíz con:

```env
PORT=3000
JWT_SECRET=tu-secret-key
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=tu-password
DB_DATABASE=proveeduria_db
DB_ENCRYPT=true
DB_TRUST_CERT=true
USE_DATABASE=true
```

## Documentación

Toda la documentación detallada está en la carpeta `materials/`:

- `materials/README.md` - Documentación completa del proyecto
- `materials/CREDENCIALES_PRUEBA.md` - Credenciales de prueba
- `materials/GUIA_GIT.md` - Guía de Git para el equipo
- `materials/PENDIENTES.md` - Tareas pendientes
- `materials/SECURITY_REPORT.md` - Reporte de seguridad
