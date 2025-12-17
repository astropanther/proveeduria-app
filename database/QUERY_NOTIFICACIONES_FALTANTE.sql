-- =============================================
-- QUERY PARA AGREGAR LA TABLA NOTIFICACIONES
-- Esta tabla es CRÍTICA para que el sistema de notificaciones funcione
-- Agregar este bloque después de la tabla notificaciones_log
-- =============================================

USE proveeduria_db;
GO

-- =============================================
-- Tabla: notificaciones
-- PB-13: Notificaciones Persistentes para Inbox
-- IMPORTANTE: Esta tabla permite que las notificaciones aparezcan en el área de notificaciones
-- =============================================
IF OBJECT_ID('notificaciones', 'U') IS NOT NULL
    DROP TABLE notificaciones;
GO

CREATE TABLE notificaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo NVARCHAR(50) NOT NULL CHECK (tipo IN ('comprador', 'aprobador', 'admin')),
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

PRINT 'Tabla notificaciones creada exitosamente!';
GO


