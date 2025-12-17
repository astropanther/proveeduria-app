-- =============================================
-- Script para crear la tabla notificaciones
-- Ejecutar este script en SQL Server Management Studio o Azure Data Studio
-- =============================================

USE proveeduria_db;
GO

-- Verificar si la tabla existe y eliminarla si es necesario (opcional)
IF OBJECT_ID('notificaciones', 'U') IS NOT NULL
BEGIN
    PRINT 'La tabla notificaciones ya existe.';
    -- Si quieres recrearla, descomenta la siguiente línea:
    -- DROP TABLE notificaciones;
END
GO

-- Crear la tabla notificaciones
IF OBJECT_ID('notificaciones', 'U') IS NULL
BEGIN
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
    
    PRINT 'Tabla notificaciones creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla notificaciones ya existe.';
END
GO

-- Crear índices para optimizar las consultas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificaciones_usuario_id' AND object_id = OBJECT_ID('notificaciones'))
BEGIN
    CREATE INDEX IX_notificaciones_usuario_id ON notificaciones(usuario_id);
    PRINT 'Índice IX_notificaciones_usuario_id creado.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificaciones_leida' AND object_id = OBJECT_ID('notificaciones'))
BEGIN
    CREATE INDEX IX_notificaciones_leida ON notificaciones(leida);
    PRINT 'Índice IX_notificaciones_leida creado.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificaciones_fecha' AND object_id = OBJECT_ID('notificaciones'))
BEGIN
    CREATE INDEX IX_notificaciones_fecha ON notificaciones(fecha_creacion);
    PRINT 'Índice IX_notificaciones_fecha creado.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notificaciones_tipo' AND object_id = OBJECT_ID('notificaciones'))
BEGIN
    CREATE INDEX IX_notificaciones_tipo ON notificaciones(tipo);
    PRINT 'Índice IX_notificaciones_tipo creado.';
END
GO

PRINT 'Script completado exitosamente.';
GO


