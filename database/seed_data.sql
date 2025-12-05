-- Script para insertar datos iniciales en la base de datos

USE proveeduria_db;
GO

-- Insertar usuarios
-- Nota: Las contraseñas están hasheadas con bcrypt. Para generar nuevas:
-- node scripts/generatePasswordHash.js

-- Admin (password: Admin2024!Secure)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@proveeduria.com')
BEGIN
    INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
    VALUES (
        'admin@proveeduria.com',
        '$2b$10$nxBCrmndj9u3Q9RRrfVIxeD416tFdJ/P0aGfIbYtNyUVDS30y0qxq',
        'Administrador',
        'Administrador',
        1,
        GETDATE()
    );
END
GO

-- Comprador 1 (password: Comprador2024!Secure)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'comprador1@proveeduria.com')
BEGIN
    INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
    VALUES (
        'comprador1@proveeduria.com',
        '$2b$10$j0g4Lm/dZCmgIYQoMd3GceDsxWo.2jrQnGdk6KfdTyOeyhH8wXg4S',
        'Comprador',
        'Juan Pérez',
        1,
        GETDATE()
    );
END
GO

-- Comprador 2 (password: Comprador2024!Secure)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'comprador2@proveeduria.com')
BEGIN
    INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
    VALUES (
        'comprador2@proveeduria.com',
        '$2b$10$j0g4Lm/dZCmgIYQoMd3GceDsxWo.2jrQnGdk6KfdTyOeyhH8wXg4S',
        'Comprador',
        'María González',
        1,
        GETDATE()
    );
END
GO

-- Aprobador Jefe (password: Aprobador2024!Secure)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'aprobador1@proveeduria.com')
BEGIN
    INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
    VALUES (
        'aprobador1@proveeduria.com',
        '$2b$10$LwPoVjQ9n1PtCsvNG6fgCubgFcChSo6raPK2PyFRX3krwlDLFiyHi',
        'Aprobador Jefe',
        'Carlos Rodríguez',
        1,
        GETDATE()
    );
END
GO

-- Aprobador Financiero (password: Aprobador2024!Secure)
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'aprobador2@proveeduria.com')
BEGIN
    INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
    VALUES (
        'aprobador2@proveeduria.com',
        '$2b$10$LwPoVjQ9n1PtCsvNG6fgCubgFcChSo6raPK2PyFRX3krwlDLFiyHi',
        'Aprobador Financiero',
        'Ana Martínez',
        1,
        GETDATE()
    );
END
GO


-- Insertar solicitudes de ejemplo
-- Solicitud 1: Pendiente
IF NOT EXISTS (SELECT 1 FROM solicitudes WHERE numero = 'SOL-2024-001')
BEGIN
    INSERT INTO solicitudes (
        numero, descripcion, usuario_id, monto, categoria, fecha,
        estado, prioridad, justificacion, fecha_creacion
    )
    VALUES (
        'SOL-2024-001',
        'Compra de material de oficina para el departamento de contabilidad',
        (SELECT id FROM users WHERE email = 'comprador1@proveeduria.com'),
        15000,
        'Oficina',
        '2024-06-15',
        'Pendiente',
        'alta',
        'Necesario para el cierre mensual',
        GETDATE()
    );
END
GO

-- Solicitud 2: Pendiente
IF NOT EXISTS (SELECT 1 FROM solicitudes WHERE numero = 'SOL-2024-002')
BEGIN
    INSERT INTO solicitudes (
        numero, descripcion, usuario_id, monto, categoria, fecha,
        estado, prioridad, justificacion, fecha_creacion
    )
    VALUES (
        'SOL-2024-002',
        'Renovación de licencias de software',
        (SELECT id FROM users WHERE email = 'comprador1@proveeduria.com'),
        25000,
        'Tecnología',
        '2024-06-18',
        'Pendiente',
        'media',
        'Licencias vencen el próximo mes',
        GETDATE()
    );
END
GO

-- Solicitud 3: Aprobada
IF NOT EXISTS (SELECT 1 FROM solicitudes WHERE numero = 'SOL-2024-003')
BEGIN
    INSERT INTO solicitudes (
        numero, descripcion, usuario_id, monto, categoria, fecha,
        estado, prioridad, justificacion, fecha_creacion,
        aprobador_jefe_id, aprobador_financiero_id, fecha_aprobacion
    )
    VALUES (
        'SOL-2024-003',
        'Compra de equipos de seguridad',
        (SELECT id FROM users WHERE email = 'comprador2@proveeduria.com'),
        45000,
        'Seguridad',
        '2024-06-10',
        'Aprobada',
        'alta',
        'Actualización de sistema de seguridad',
        GETDATE(),
        (SELECT id FROM users WHERE email = 'aprobador1@proveeduria.com'),
        (SELECT id FROM users WHERE email = 'aprobador2@proveeduria.com'),
        GETDATE()
    );
END
GO

-- Solicitud 4: Rechazada
IF NOT EXISTS (SELECT 1 FROM solicitudes WHERE numero = 'SOL-2024-004')
BEGIN
    INSERT INTO solicitudes (
        numero, descripcion, usuario_id, monto, categoria, fecha,
        estado, prioridad, justificacion, fecha_creacion,
        motivo_rechazo, fecha_rechazo
    )
    VALUES (
        'SOL-2024-004',
        'Servicios de limpieza mensual',
        (SELECT id FROM users WHERE email = 'comprador1@proveeduria.com'),
        8000,
        'Servicios',
        '2024-06-12',
        'Rechazada',
        'baja',
        'Servicio mensual regular',
        GETDATE(),
        'Presupuesto insuficiente para este trimestre',
        GETDATE()
    );
END
GO

-- Solicitud 5: Pendiente
IF NOT EXISTS (SELECT 1 FROM solicitudes WHERE numero = 'SOL-2024-005')
BEGIN
    INSERT INTO solicitudes (
        numero, descripcion, usuario_id, monto, categoria, fecha,
        estado, prioridad, justificacion, fecha_creacion
    )
    VALUES (
        'SOL-2024-005',
        'Compra de mobiliario para nueva oficina',
        (SELECT id FROM users WHERE email = 'comprador2@proveeduria.com'),
        120000,
        'Mobiliario',
        '2024-06-20',
        'Pendiente',
        'media',
        'Expansión del departamento de ventas',
        GETDATE()
    );
END
GO

PRINT 'Datos iniciales insertados correctamente';
GO

