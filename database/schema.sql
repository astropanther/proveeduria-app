-- =============================================
-- Base de Datos: ProcureHub
-- PB-20: Optimización y Normalización de la Base de Datos
-- =============================================

-- Crear base de datos (si no existe)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'proveeduria_db')
BEGIN
    CREATE DATABASE proveeduria_db;
END
GO

USE proveeduria_db;
GO

-- =============================================
-- Tabla: users
-- PB-6: Registrar Usuarios y Roles
-- =============================================
IF OBJECT_ID('users', 'U') IS NOT NULL
    DROP TABLE users;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Comprador', 'Aprobador Jefe', 'Aprobador Financiero')),
    nombre NVARCHAR(255) NOT NULL,
    activo BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_users_activo ON users(activo);
GO

-- =============================================
-- Tabla: solicitudes
-- PB-10: Crear Solicitud de Compra
-- PB-11: Aprobar o Rechazar Solicitud
-- PB-12: Anular Solicitud Pendiente
-- =============================================
IF OBJECT_ID('solicitudes', 'U') IS NOT NULL
    DROP TABLE solicitudes;
GO

CREATE TABLE solicitudes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero NVARCHAR(50) NOT NULL UNIQUE,
    descripcion NVARCHAR(500) NOT NULL,
    usuario_id INT NOT NULL,
    monto DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    categoria NVARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'Anulada')),
    prioridad NVARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('alta', 'media', 'baja')),
    justificacion NVARCHAR(1000),
    aprobador_jefe_id INT NULL,
    aprobador_financiero_id INT NULL,
    motivo_rechazo NVARCHAR(500) NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_aprobacion DATETIME2 NULL,
    fecha_rechazo DATETIME2 NULL,
    fecha_anulacion DATETIME2 NULL,
    FOREIGN KEY (usuario_id) REFERENCES users(id),
    FOREIGN KEY (aprobador_jefe_id) REFERENCES users(id),
    FOREIGN KEY (aprobador_financiero_id) REFERENCES users(id)
);
GO

CREATE INDEX IX_solicitudes_usuario_id ON solicitudes(usuario_id);
CREATE INDEX IX_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IX_solicitudes_fecha ON solicitudes(fecha);
CREATE INDEX IX_solicitudes_numero ON solicitudes(numero);
GO

-- =============================================
-- Tabla: auditoria
-- PB-15: Registro de Actividades del Sistema
-- =============================================
IF OBJECT_ID('auditoria', 'U') IS NOT NULL
    DROP TABLE auditoria;
GO

CREATE TABLE auditoria (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion NVARCHAR(100) NOT NULL,
    entidad NVARCHAR(100) NOT NULL,
    entidad_id INT NULL,
    detalles NVARCHAR(1000) NULL,
    fecha DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
GO

CREATE INDEX IX_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IX_auditoria_entidad ON auditoria(entidad, entidad_id);
CREATE INDEX IX_auditoria_fecha ON auditoria(fecha);
GO

-- =============================================
-- Tabla: notificaciones_log
-- PB-13: Envío de Notificaciones Automáticas (Log de envíos)
-- =============================================
IF OBJECT_ID('notificaciones_log', 'U') IS NOT NULL
    DROP TABLE notificaciones_log;
GO

CREATE TABLE notificaciones_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    evento NVARCHAR(50) NOT NULL,
    enviado BIT NOT NULL DEFAULT 0,
    modo NVARCHAR(20) NULL, -- 'produccion' o 'desarrollo'
    error_message NVARCHAR(500) NULL,
    fecha_envio DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

CREATE INDEX IX_notificaciones_log_email ON notificaciones_log(email);
CREATE INDEX IX_notificaciones_log_fecha ON notificaciones_log(fecha_envio);
GO

-- =============================================
-- Tabla: notificaciones
-- PB-13: Notificaciones Persistentes para Inbox
-- =============================================
IF OBJECT_ID('notificaciones', 'U') IS NOT NULL
    DROP TABLE notificaciones;
GO

CREATE TABLE notificaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo NVARCHAR(50) NOT NULL, -- 'comprador', 'aprobador', 'admin'
    evento NVARCHAR(50) NOT NULL, -- 'creacion', 'aprobacion', 'rechazo', 'anulacion', 'nueva_solicitud', 'contacto'
    titulo NVARCHAR(255) NOT NULL,
    mensaje NVARCHAR(1000) NOT NULL,
    leida BIT NOT NULL DEFAULT 0,
    solicitud_id INT NULL, -- ID de la solicitud relacionada (si aplica)
    detalles NVARCHAR(MAX) NULL, -- JSON con detalles adicionales
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES users(id),
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IX_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IX_notificaciones_fecha ON notificaciones(fecha_creacion);
CREATE INDEX IX_notificaciones_tipo ON notificaciones(tipo);
GO

-- =============================================
-- Procedimientos Almacenados
-- PB-21: Configurar Procedimientos Almacenados y Triggers de Auditoría
-- =============================================

-- Procedimiento para obtener estadísticas de solicitudes
IF OBJECT_ID('sp_obtener_estadisticas_solicitudes', 'P') IS NOT NULL
    DROP PROCEDURE sp_obtener_estadisticas_solicitudes;
GO

CREATE PROCEDURE sp_obtener_estadisticas_solicitudes
AS
BEGIN
    SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) AS aprobadas,
        SUM(CASE WHEN estado = 'Rechazada' THEN 1 ELSE 0 END) AS rechazadas,
        SUM(CASE WHEN estado = 'Anulada' THEN 1 ELSE 0 END) AS anuladas,
        SUM(CASE WHEN estado = 'Aprobada' THEN monto ELSE 0 END) AS monto_aprobado,
        SUM(monto) AS monto_total
    FROM solicitudes;
END
GO

-- Procedimiento para obtener solicitudes por usuario
IF OBJECT_ID('sp_obtener_solicitudes_usuario', 'P') IS NOT NULL
    DROP PROCEDURE sp_obtener_solicitudes_usuario;
GO

CREATE PROCEDURE sp_obtener_solicitudes_usuario
    @usuario_id INT
AS
BEGIN
    SELECT 
        s.*,
        u.nombre AS usuario_nombre,
        u.email AS usuario_email
    FROM solicitudes s
    INNER JOIN users u ON s.usuario_id = u.id
    WHERE s.usuario_id = @usuario_id
    ORDER BY s.fecha_creacion DESC;
END
GO

-- =============================================
-- Triggers de Auditoría
-- PB-21: Configurar Procedimientos Almacenados y Triggers de Auditoría
-- =============================================

-- Trigger para auditar cambios en solicitudes
IF OBJECT_ID('tr_auditar_solicitudes', 'TR') IS NOT NULL
    DROP TRIGGER tr_auditar_solicitudes;
GO

CREATE TRIGGER tr_auditar_solicitudes
ON solicitudes
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Para INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalles)
        SELECT 
            i.usuario_id,
            'CREAR_SOLICITUD',
            'Solicitud',
            i.id,
            'Solicitud ' + i.numero + ' creada'
        FROM inserted i;
    END
    
    -- Para UPDATE
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalles)
        SELECT 
            COALESCE(i.aprobador_jefe_id, i.aprobador_financiero_id, i.usuario_id),
            CASE 
                WHEN i.estado = 'Aprobada' AND d.estado != 'Aprobada' THEN 'APROBAR_SOLICITUD'
                WHEN i.estado = 'Rechazada' AND d.estado != 'Rechazada' THEN 'RECHAZAR_SOLICITUD'
                WHEN i.estado = 'Anulada' AND d.estado != 'Anulada' THEN 'ANULAR_SOLICITUD'
                ELSE 'ACTUALIZAR_SOLICITUD'
            END,
            'Solicitud',
            i.id,
            'Solicitud ' + i.numero + ' actualizada: ' + d.estado + ' -> ' + i.estado
        FROM inserted i
        INNER JOIN deleted d ON i.id = d.id
        WHERE i.estado != d.estado;
    END
    
    -- Para DELETE (si se implementa en el futuro)
    IF EXISTS (SELECT * FROM deleted) AND NOT EXISTS (SELECT * FROM inserted)
    BEGIN
        INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalles)
        SELECT 
            d.usuario_id,
            'ELIMINAR_SOLICITUD',
            'Solicitud',
            d.id,
            'Solicitud ' + d.numero + ' eliminada'
        FROM deleted d;
    END
END
GO

-- Trigger para auditar cambios en usuarios
IF OBJECT_ID('tr_auditar_usuarios', 'TR') IS NOT NULL
    DROP TRIGGER tr_auditar_usuarios;
GO

CREATE TRIGGER tr_auditar_usuarios
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalles)
    SELECT 
        i.id,
        CASE 
            WHEN i.activo = 0 AND d.activo = 1 THEN 'INACTIVAR_USUARIO'
            WHEN i.activo = 1 AND d.activo = 0 THEN 'ACTIVAR_USUARIO'
            ELSE 'ACTUALIZAR_USUARIO'
        END,
        'Usuario',
        i.id,
        'Usuario ' + i.email + ' actualizado'
    FROM inserted i
    INNER JOIN deleted d ON i.id = d.id
    WHERE i.activo != d.activo OR i.role != d.role;
END
GO

-- =============================================
-- Datos Iniciales
-- =============================================

-- Insertar usuario administrador inicial
-- Password: admin123 (hash bcrypt generado con: node scripts/generatePasswordHash.js admin123)
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@proveeduria.com')
BEGIN
    INSERT INTO users (email, password_hash, role, nombre, activo)
    VALUES (
        'admin@proveeduria.com',
        '$2b$10$YwajdlW3hkilRC5YWouCreO85IqKABarBud4K2.RLrnmJCCMx8uxW', -- admin123
        'Administrador',
        'Administrador',
        1
    );
END
GO

PRINT 'Base de datos creada exitosamente!';
GO

