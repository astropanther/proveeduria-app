/**
 * Script para llenar la base de datos con datos iniciales
 * Ejecutar: npm run seed:db
 */

import { query, getPool, closePool } from '../backend/src/db/connection.js';
import bcrypt from 'bcryptjs';
import { loadEnv } from '../backend/src/config/env.js';

const env = loadEnv();

async function seedDatabase() {
  try {
    console.log('Iniciando seed de la base de datos...\n');

    if (!env.USE_DATABASE) {
      console.log('USE_DATABASE está en false. Cambia a true en .env para usar la base de datos.');
      return;
    }

    // Conectar a la base de datos
    await getPool();
    console.log('Conectado a la base de datos\n');

    // 1. Crear usuarios
    console.log('Creando usuarios...');
    const passwordHash = await bcrypt.hash('Proveeduria2024!Sys', 10);

    // Verificar si ya existe el admin
    const existingAdmin = await query(
      `SELECT id FROM users WHERE email = @email`,
      { email: 'admin@proveeduria.com' }
    );

    let adminId;
    if (existingAdmin.recordset.length === 0) {
      const adminResult = await query(
        `INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
         OUTPUT INSERTED.id
         VALUES (@email, @password_hash, @role, @nombre, 1, GETDATE())`,
        {
          email: 'admin@proveeduria.com',
          password_hash: passwordHash,
          role: 'Administrador',
          nombre: 'Administrador',
        }
      );
      adminId = adminResult.recordset[0].id;
      console.log('  Usuario admin creado (ID: ' + adminId + ')');
    } else {
      adminId = existingAdmin.recordset[0].id;
      console.log('  Usuario admin ya existe (ID: ' + adminId + ')');
    }

    // Crear otros usuarios de ejemplo
    const usuariosEjemplo = [
      {
        email: 'comprador1@proveeduria.com',
        password: 'comprador123',
        role: 'Comprador',
        nombre: 'Juan Pérez',
      },
      {
        email: 'comprador2@proveeduria.com',
        password: 'comprador123',
        role: 'Comprador',
        nombre: 'María González',
      },
      {
        email: 'aprobador1@proveeduria.com',
        password: 'aprobador123',
        role: 'Aprobador Jefe',
        nombre: 'Carlos Rodríguez',
      },
      {
        email: 'aprobador2@proveeduria.com',
        password: 'aprobador123',
        role: 'Aprobador Financiero',
        nombre: 'Ana Martínez',
      },
    ];

    const userIds = { admin: adminId };

    for (const usuario of usuariosEjemplo) {
      const existing = await query(
        `SELECT id FROM users WHERE email = @email`,
        { email: usuario.email }
      );

      if (existing.recordset.length === 0) {
        const passwordHash = await bcrypt.hash(usuario.password, 10);
        await query(
          `INSERT INTO users (email, password_hash, role, nombre, activo, created_at)
           VALUES (@email, @password_hash, @role, @nombre, 1, GETDATE())`,
          {
            email: usuario.email,
            password_hash: passwordHash,
            role: usuario.role,
            nombre: usuario.nombre,
          }
        );
        const idResult = await query(`SELECT SCOPE_IDENTITY() AS id`, {});
        const userId = idResult.recordset[0]?.id;
        userIds[usuario.email.split('@')[0]] = userId;
        console.log(`  Usuario ${usuario.nombre} creado (ID: ${userId})`);
      } else {
        const userId = existing.recordset[0].id;
        userIds[usuario.email.split('@')[0]] = userId;
        console.log(`  Usuario ${usuario.nombre} ya existe (ID: ${userId})`);
      }
    }

    console.log('\nCreando solicitudes de ejemplo...');

    // 2. Crear solicitudes de ejemplo
    const solicitudesEjemplo = [
      {
        descripcion: 'Compra de material de oficina para el departamento de contabilidad',
        monto: 15000,
        categoria: 'Oficina',
        prioridad: 'alta',
        justificacion: 'Necesario para el cierre mensual',
        usuarioId: userIds.comprador1 || adminId,
        estado: 'Pendiente',
        fecha: new Date(2024, 5, 15).toISOString().split('T')[0], // 15 de junio 2024
      },
      {
        descripcion: 'Renovación de licencias de software',
        monto: 25000,
        categoria: 'Tecnología',
        prioridad: 'media',
        justificacion: 'Licencias vencen el próximo mes',
        usuarioId: userIds.comprador1 || adminId,
        estado: 'Pendiente',
        fecha: new Date(2024, 5, 18).toISOString().split('T')[0],
      },
      {
        descripcion: 'Compra de equipos de seguridad',
        monto: 45000,
        categoria: 'Seguridad',
        prioridad: 'alta',
        justificacion: 'Actualización de sistema de seguridad',
        usuarioId: userIds.comprador2 || adminId,
        estado: 'Aprobada',
        fecha: new Date(2024, 5, 10).toISOString().split('T')[0],
      },
      {
        descripcion: 'Servicios de limpieza mensual',
        monto: 8000,
        categoria: 'Servicios',
        prioridad: 'baja',
        justificacion: 'Servicio mensual regular',
        usuarioId: userIds.comprador1 || adminId,
        estado: 'Rechazada',
        fecha: new Date(2024, 5, 12).toISOString().split('T')[0],
      },
      {
        descripcion: 'Compra de mobiliario para nueva oficina',
        monto: 120000,
        categoria: 'Mobiliario',
        prioridad: 'media',
        justificacion: 'Expansión del departamento de ventas',
        usuarioId: userIds.comprador2 || adminId,
        estado: 'Pendiente',
        fecha: new Date(2024, 5, 20).toISOString().split('T')[0],
      },
    ];

    for (const solicitud of solicitudesEjemplo) {
      // Generar número de solicitud único
      const year = new Date(solicitud.fecha).getFullYear();
      const countResult = await query(
        `SELECT COUNT(*) AS count FROM solicitudes WHERE YEAR(fecha_creacion) = @year`,
        { year }
      );
      const count = countResult.recordset[0]?.count || 0;
      const numero = `SOL-${year}-${String(count + 1).padStart(3, '0')}`;

      // Verificar si ya existe una solicitud con este número
      const existingSolicitud = await query(
        `SELECT id FROM solicitudes WHERE numero = @numero`,
        { numero }
      );

      let solicitudId;
      if (existingSolicitud.recordset.length > 0) {
        solicitudId = existingSolicitud.recordset[0].id;
        console.log(`  Solicitud ${numero} ya existe (ID: ${solicitudId})`);
      } else {
        // Insertar la solicitud
        await query(
          `INSERT INTO solicitudes (
            numero, descripcion, usuario_id, monto, categoria, fecha,
            estado, prioridad, justificacion, fecha_creacion
          )
          VALUES (
            @numero, @descripcion, @usuarioId, @monto, @categoria, @fecha,
            @estado, @prioridad, @justificacion, @fechaCreacion
          )`,
          {
            numero,
            descripcion: solicitud.descripcion,
            usuarioId: solicitud.usuarioId,
            monto: solicitud.monto,
            categoria: solicitud.categoria,
            fecha: solicitud.fecha,
            estado: solicitud.estado,
            prioridad: solicitud.prioridad,
            justificacion: solicitud.justificacion,
            fechaCreacion: new Date().toISOString(),
          }
        );

        // Obtener el ID de la solicitud recién creada
        const idResult = await query(
          `SELECT id FROM solicitudes WHERE numero = @numero`,
          { numero }
        );
        solicitudId = idResult.recordset[0]?.id;

        // Si está aprobada, agregar aprobadores
        if (solicitud.estado === 'Aprobada') {
          await query(
            `UPDATE solicitudes 
             SET aprobador_jefe_id = @aprobadorJefe,
                 aprobador_financiero_id = @aprobadorFinanciero,
                 fecha_aprobacion = GETDATE()
             WHERE id = @id`,
            {
              id: solicitudId,
              aprobadorJefe: userIds.aprobador1 || adminId,
              aprobadorFinanciero: userIds.aprobador2 || adminId,
            }
          );
        }

        // Si está rechazada, agregar motivo
        if (solicitud.estado === 'Rechazada') {
          await query(
            `UPDATE solicitudes 
             SET motivo_rechazo = @motivo,
                 fecha_rechazo = GETDATE()
             WHERE id = @id`,
            {
              id: solicitudId,
              motivo: 'Presupuesto insuficiente para este trimestre',
            }
          );
        }

        console.log(`  Solicitud ${numero} creada (ID: ${solicitudId})`);
      }
    }

    console.log('\nSeed completado exitosamente!');
    console.log('\nResumen:');
    console.log('  - Usuarios: 5 usuarios creados');
    console.log('  - Solicitudes: 5 solicitudes de ejemplo creadas');
    console.log('\nCredenciales de acceso:');
    console.log('  Admin: admin@proveeduria.com / Proveeduria2024!Sys');
    console.log('  Comprador: comprador1@proveeduria.com / comprador123');
    console.log('  Aprobador Jefe: aprobador1@proveeduria.com / aprobador123');
    console.log('  Aprobador Financiero: aprobador2@proveeduria.com / aprobador123');

  } catch (error) {
    console.error('Error durante el seed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Ejecutar seed
seedDatabase()
  .then(() => {
    console.log('\nProceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nError fatal:', error);
    process.exit(1);
  });

