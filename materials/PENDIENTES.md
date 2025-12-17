# Tareas Pendientes y Mejoras por Implementar

## Estado del Proyecto - Diciembre 2024

### Funcionalidades Completadas

#### Sistema de Notificaciones
- [x] Tabla `notificaciones` creada en la base de datos
- [x] Repository para guardar/leer notificaciones implementado
- [x] Servicio de notificaciones guarda en BD automáticamente
- [x] `NotificacionesInbox` lee de BD (compradores)
- [x] `NotificacionesAprobador` implementado para aprobadores y admin
- [x] Funcionalidad de marcar como leída implementada
- [x] Notificaciones se crean en todos los eventos (creación, aprobación, rechazo, anulación)
- [x] Mensajes de contacto usan toast (Sonner) en lugar de alert()

#### Sistema de Reportes
- [x] Generación de reportes PDF funcional
- [x] Generación de reportes Excel funcional
- [x] Descarga de archivos corregida
- [x] Reportes usan datos reales de la base de datos
- [x] Paginación PDF corregida (sin páginas vacías)

#### Gestión de Usuarios
- [x] Indicador de fortaleza de contraseña (password strength meter) implementado
- [x] Barra de progreso visual para contraseñas
- [x] Validación de contraseñas en tiempo real
- [x] Error de inactivación de usuarios corregido (OUTPUT clause)

#### Pruebas Unitarias
- [x] Configuración de Jest para ES Modules
- [x] Pruebas unitarias para `passwordValidator`
- [x] Pruebas unitarias para `permissions`
- [x] Pruebas unitarias para `authService`
- [x] Documentación de pruebas unitarias
- [x] Reporte de cobertura de código

## 🟡 Mejoras Pendientes (No Críticas)

### 1. Actualización en Tiempo Real
**Estado:** Funcional con polling (30s)  
**Descripción:** Actualmente hay un intervalo de 30 segundos. Podría mejorarse para actualización instantánea.

**Tareas:**
- [ ] Considerar WebSockets para actualización instantánea
- [ ] O mejorar polling con debounce/throttle
- [ ] Agregar indicador visual cuando hay actualizaciones

### 2. Validaciones de Formularios
**Estado:** Parcialmente implementado  
**Descripción:** Algunos formularios tienen validación, pero podría ser más consistente.

**Tareas:**
- [ ] Revisar todos los formularios
- [ ] Agregar validación en tiempo real en todos los campos
- [ ] Mensajes de error más claros y consistentes
- [ ] Validar formato de email, montos, fechas, etc. en todos los formularios

### 3. Sistema de Búsqueda Avanzada
**Estado:** Búsqueda básica implementada  
**Descripción:** Búsqueda básica existe, pero podría mejorarse.

**Tareas:**
- [ ] Búsqueda avanzada en solicitudes (por múltiples criterios)
- [ ] Filtros combinados
- [ ] Búsqueda en historial de auditoría

### 4. Exportar Datos Adicionales
**Estado:** Reportes de solicitudes implementados  
**Descripción:** Ya existe exportación de reportes de solicitudes, pero podría expandirse.

**Tareas:**
- [ ] Exportar listado de usuarios
- [ ] Exportar historial de auditoría
- [ ] Opciones de formato adicionales

### 5. Dashboard Mejorado
**Estado:** Funcional pero mejorable  
**Descripción:** Los dashboards funcionan pero podrían tener más métricas.

**Tareas:**
- [ ] Agregar más gráficos y métricas
- [ ] Filtros de fecha en dashboards
- [ ] Comparativas mes a mes
- [ ] Tendencias y predicciones

### 6. Sistema de Permisos Granular
**Estado:** Implementado básicamente  
**Descripción:** Ya existe control de permisos, pero podría expandirse.

**Tareas:**
- [ ] Permisos más granulares por acción
- [ ] Roles personalizables
- [ ] Permisos temporales
- [ ] Delegación de permisos

## 🟢 Opcionales (Mejoras Futuras)

### 7. Mejoras de UX Adicionales
- [ ] Mejorar animaciones y transiciones
- [ ] Agregar modo oscuro persistente (guardar preferencia)
- [ ] Mejorar accesibilidad (ARIA labels, keyboard navigation)
- [ ] Agregar tooltips informativos

### 8. Optimizaciones de Rendimiento
- [ ] Implementar paginación en listas grandes
- [ ] Lazy loading de componentes
- [ ] Optimizar queries de base de datos
- [ ] Implementar caché donde sea apropiado

### 9. Documentación Técnica
- [ ] Documentar arquitectura del sistema
- [ ] Crear diagramas de flujo
- [ ] Documentar decisiones de diseño
- [ ] Guía de contribución para desarrolladores

## 📝 Notas Técnicas

### Archivos Relevantes:
1. `frontend/src/components/NotificacionesInbox.tsx` - Inbox de notificaciones para compradores
2. `frontend/src/components/NotificacionesAprobador.tsx` - Inbox de notificaciones para aprobadores
3. `src/modules/notificaciones/service.js` - Servicio de notificaciones (guarda en BD)
4. `src/modules/notificaciones/repository.js` - Repository de notificaciones
5. `database/schema.sql` - Tabla `notificaciones` definida
6. `src/modules/reportes/service.js` - Generación de reportes PDF y Excel
7. `frontend/src/components/GestionUsuarios.tsx` - Gestión de usuarios con password strength meter
8. `tests/unit/` - Pruebas unitarias implementadas

### Prioridad Sugerida:
1. **Media:** Items 1, 2 (Mejoras de UX)
2. **Baja:** Items 3-6 (Mejoras futuras)
3. **Opcional:** Items 7-9 (Mejoras adicionales)
