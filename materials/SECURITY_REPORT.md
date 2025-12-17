# Reporte de Seguridad y Funcionalidad

## Estado del Sistema: FUNCIONAL

### Funcionalidades Probadas y Funcionando

1. **Autenticación (PB-8)**
   - Login con JWT
   - Validación de tokens
   - Expiración de sesiones (30 minutos de inactividad)
   - Protección de rutas con `authGuard`

2. **Gestión de Usuarios (PB-6, PB-7)**
   - Crear usuarios con validación de roles
   - Listar usuarios (solo admin)
   - Editar usuarios
   - Activar/Inactivar usuarios
   - Validación de email y roles

3. **Solicitudes (PB-10, PB-11, PB-12)**
   - Crear solicitudes (compradores y admin)
   - Listar solicitudes con filtros por rol
   - Aprobar solicitudes (con niveles de acceso granular)
   - Rechazar solicitudes (con motivo requerido)
   - Anular solicitudes (solo creador o admin)

4. **Niveles de Acceso Granular (Feedback del Profesor)**
   - Compradores: Solo ven sus propias solicitudes
   - Aprobador Jefe: Ve solicitudes pendientes y puede aprobar según monto
   - Aprobador Financiero: Ve solicitudes >= $50,000 y puede aprobar
   - Admin: Ve y puede gestionar todo
   - Filtrado de campos según rol (privacidad de datos)

5. **Dashboard (PB-22)**
   - Resumen de solicitudes
   - Estadísticas por mes
   - Solicitudes recientes
   - Conectado a base de datos

6. **Reportes (PB-14)**
   - Generación de Excel
   - Generación de PDF
   - Descarga de archivos
   - Filtros por estado y fecha

7. **Notificaciones (PB-13)**
   - Envío de emails (con fallback a console en desarrollo)
   - Notificaciones por evento (creación, aprobación, rechazo, anulación)

8. **Base de Datos**
   - Conexión a SQL Server funcionando
   - Queries parametrizadas (protección contra SQL injection)
   - Triggers de auditoría funcionando
   - Stored procedures disponibles

## Mejoras de Seguridad Implementadas

### 1. Validador de Contraseñas Seguras


- **Ubicación**: `src/utils/passwordValidator.js`
- **Requisitos**:
  - Mínimo 8 caracteres (antes era 6)
  - Máximo 128 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - No puede ser solo números o solo letras
  - Bloquea contraseñas comunes/débiles (password, admin123, etc.)

### 2. Contraseñas Actualizadas en Seed Data

- **Antes**: `admin123`, `comprador123`, `aprobador123` (débiles, en bases de datos comprometidas)
- **Ahora**: `Admin2024!Secure`, `Comprador2024!Secure`, `Aprobador2024!Secure`
- **Nota**: Los usuarios existentes en la base de datos aún tienen las contraseñas antiguas. Se debe ejecutar `seed_data.sql` actualizado o actualizar manualmente.

### 3. Protección SQL Injection

- Todas las queries usan parámetros (`@parametro`)
- No hay concatenación de strings en queries SQL
- Uso de `mssql` con prepared statements

### 4. JWT Security

- Tokens con expiración (24h por defecto)
- Secret key configurable en `.env`
- Validación de tokens en cada request protegido

### 5. Validaciones de Entrada

- Validación de email con regex
- Validación de roles
- Validación de tipos de datos
- Sanitización de inputs

## Recomendaciones Adicionales de Seguridad

### 1. Rate Limiting (Pendiente)

- Implementar límite de requests por IP
- Prevenir ataques de fuerza bruta en login
- **Sugerencia**: Usar `express-rate-limit`

### 2. CORS Configuration (Pendiente)

- Configurar CORS para permitir solo el frontend
- Bloquear requests de otros orígenes
- **Sugerencia**: Usar `cors` middleware

### 3. Helmet.js (Pendiente)

- Headers de seguridad HTTP
- Prevenir XSS, clickjacking, etc.
- **Sugerencia**: Usar `helmet` middleware

### 4. HTTPS en Producción

- Usar certificados SSL/TLS
- Forzar HTTPS en producción
- No enviar tokens en URLs

### 5. Logging de Seguridad

- Registrar intentos de login fallidos
- Alertar sobre múltiples fallos
- Monitorear actividad sospechosa

## Credenciales de Prueba (Actualizadas)

**IMPORTANTE**: Estas contraseñas son más seguras. Si aún tienes usuarios con contraseñas antiguas en la base de datos, actualízalos ejecutando el `seed_data.sql` actualizado.

- **Admin**: `admin@proveeduria.com` / `Admin2024!Secure`
- **Comprador 1**: `comprador1@proveeduria.com` / `Comprador2024!Secure`
- **Comprador 2**: `comprador2@proveeduria.com` / `Comprador2024!Secure`
- **Aprobador Jefe**: `aprobador1@proveeduria.com` / `Aprobador2024!Secure`
- **Aprobador Financiero**: `aprobador2@proveeduria.com` / `Aprobador2024!Secure`

## Próximos Pasos

1. **Actualizar Base de Datos**: Ejecutar `seed_data.sql` actualizado para cambiar las contraseñas
2. **Implementar Rate Limiting**: Agregar protección contra fuerza bruta
3. **Configurar CORS**: Restringir acceso al frontend
4. **Agregar Helmet**: Headers de seguridad HTTP
5. **Revisar Queries de Azure Data Studio**: Verificar que no haya problemas de seguridad o performance

## Notas sobre el Security Breach Warning

El warning de Google Password Manager apareció porque las contraseñas antiguas (`admin123`, `comprador123`, etc.) están en bases de datos de contraseñas comprometidas. Esto es común con contraseñas débiles y predecibles.

**Solución implementada**:

- Contraseñas más fuertes con el nuevo validador
- Seed data actualizado con contraseñas seguras
- Validación de contraseñas al crear/actualizar usuarios

**Acción requerida**: Actualizar los usuarios existentes en la base de datos con las nuevas contraseñas.
