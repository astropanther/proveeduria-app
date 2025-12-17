# Credenciales de Prueba

## Usuarios Disponibles en el Sistema

### Administrador
- **Email**: `admin@proveeduria.com`
- **Contraseña**: `admin123`
- **Rol**: Administrador
- **Permisos**: Acceso completo al sistema
  - Ver y gestionar todos los usuarios
  - Ver todas las solicitudes
  - Crear, aprobar, rechazar y anular solicitudes
  - Generar reportes
  - Deshacer rechazos (dentro de 15 minutos)

### Comprador 1
- **Email**: `comprador1@proveeduria.com`
- **Contraseña**: `comprador123`
- **Rol**: Comprador
- **Nombre**: Juan Pérez
- **Permisos**:
  - Ver solo sus propias solicitudes
  - Crear nuevas solicitudes
  - Anular sus solicitudes pendientes
  - Ver detalles de sus solicitudes

### Comprador 2
- **Email**: `comprador2@proveeduria.com`
- **Contraseña**: `comprador123`
- **Rol**: Comprador
- **Nombre**: María González
- **Permisos**:
  - Ver solo sus propias solicitudes
  - Crear nuevas solicitudes
  - Anular sus solicitudes pendientes
  - Ver detalles de sus solicitudes

### Aprobador Jefe
- **Email**: `aprobador1@proveeduria.com`
- **Contraseña**: `aprobador123`
- **Rol**: Aprobador Jefe
- **Nombre**: Carlos Rodríguez
- **Permisos**:
  - Ver solicitudes pendientes
  - Aprobar solicitudes < $50,000 (solo)
  - Aprobar solicitudes >= $50,000 (requiere también aprobación financiera)
  - Rechazar solicitudes
  - Ver detalles de solicitudes pendientes

### Aprobador Financiero
- **Email**: `aprobador2@proveeduria.com`
- **Contraseña**: `aprobador123`
- **Rol**: Aprobador Financiero
- **Nombre**: Ana Martínez
- **Permisos**:
  - Ver solicitudes pendientes >= $50,000
  - Aprobar solicitudes >= $50,000 (completa aprobación si ya tiene aprobación del jefe)
  - Rechazar solicitudes
  - Generar reportes
  - Ver detalles de solicitudes pendientes

## Notas Importantes

1. **Contraseñas**: Las contraseñas actuales son temporales para desarrollo. En producción deben cambiarse por contraseñas más seguras.

2. **Niveles de Aprobación**:
   - Solicitudes < $50,000: Solo requiere aprobación del Aprobador Jefe
   - Solicitudes >= $50,000: Requiere aprobación del Aprobador Jefe Y del Aprobador Financiero
   - Administrador: Puede aprobar cualquier solicitud directamente

3. **Deshacer Rechazo**: 
   - Solo disponible para Administradores
   - Solo funciona dentro de 15 minutos después del rechazo
   - El botón aparece automáticamente en el diálogo de detalles de solicitudes rechazadas

4. **Filtros de Reportes**:
   - Los filtros de fecha y estado actualizan la tabla automáticamente
   - Los botones de exportar (PDF, Excel, Ambos) generan y descargan archivos
   - El botón "Actualizar" recarga los datos con los filtros aplicados

## Cómo Probar Cada Rol

### Como Administrador:
1. Login con `admin@proveeduria.com` / `admin123`
2. Ver dashboard completo con todas las estadísticas
3. Gestionar usuarios (crear, editar, activar/inactivar)
4. Ver todas las solicitudes
5. Crear, aprobar, rechazar solicitudes
6. Deshacer rechazos (si han pasado menos de 15 minutos)
7. Generar reportes

### Como Comprador:
1. Login con `comprador1@proveeduria.com` / `comprador123`
2. Ver dashboard personal con sus estadísticas
3. Ver solo sus propias solicitudes
4. Crear nuevas solicitudes
5. Anular sus solicitudes pendientes
6. Ver detalles de sus solicitudes

### Como Aprobador Jefe:
1. Login con `aprobador1@proveeduria.com` / `aprobador123`
2. Ver dashboard de aprobador
3. Ver solicitudes pendientes
4. Aprobar/rechazar solicitudes según el monto
5. Ver detalles de solicitudes

### Como Aprobador Financiero:
1. Login con `aprobador2@proveeduria.com` / `aprobador123`
2. Ver dashboard de aprobador
3. Ver solicitudes pendientes (principalmente >= $50,000)
4. Aprobar/rechazar solicitudes
5. Generar reportes
6. Ver detalles de solicitudes

