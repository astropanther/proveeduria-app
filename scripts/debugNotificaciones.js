/**
 * Script de debugging para notificaciones
 * Ejecutar: node scripts/debugNotificaciones.js
 */

import { query } from '../backend/src/db/connection.js';
import { loadEnv } from '../backend/src/config/env.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

async function debugNotificaciones() {
  if (!USE_DB) {
    console.log('⚠️  Base de datos no está habilitada (USE_DATABASE=false)');
    return;
  }

  try {
    console.log('\n=== DEBUGGING NOTIFICACIONES ===\n');

    // 1. Ver todas las notificaciones
    console.log('1. Todas las notificaciones en la BD:');
    const allNotifs = await query(`
      SELECT 
        n.id,
        n.usuario_id,
        n.tipo,
        n.evento,
        n.titulo,
        n.leida,
        n.fecha_creacion,
        u.email AS usuario_email,
        u.role AS usuario_role
      FROM notificaciones n
      LEFT JOIN users u ON n.usuario_id = u.id
      ORDER BY n.fecha_creacion DESC
    `);
    
    if (allNotifs.recordset.length === 0) {
      console.log('   ❌ No hay notificaciones en la BD');
    } else {
      console.log(`   ✅ Encontradas ${allNotifs.recordset.length} notificaciones:`);
      allNotifs.recordset.forEach((n, i) => {
        console.log(`   ${i + 1}. ID: ${n.id}, Usuario: ${n.usuario_email} (${n.usuario_id}), Tipo: ${n.tipo}, Evento: ${n.evento}, Leída: ${n.leida}`);
      });
    }

    // 2. Ver usuarios y sus IDs
    console.log('\n2. Usuarios en la BD:');
    const users = await query(`
      SELECT id, email, role, nombre
      FROM users
      ORDER BY id
    `);
    
    if (users.recordset.length === 0) {
      console.log('   ❌ No hay usuarios en la BD');
    } else {
      console.log(`   ✅ Encontrados ${users.recordset.length} usuarios:`);
      users.recordset.forEach((u) => {
        console.log(`   - ID: ${u.id}, Email: ${u.email}, Rol: ${u.role}, Nombre: ${u.nombre || 'N/A'}`);
      });
    }

    // 3. Ver notificaciones por tipo
    console.log('\n3. Notificaciones por tipo:');
    const byType = await query(`
      SELECT tipo, COUNT(*) AS count
      FROM notificaciones
      GROUP BY tipo
    `);
    
    byType.recordset.forEach((t) => {
      console.log(`   - ${t.tipo}: ${t.count} notificaciones`);
    });

    // 4. Ver notificaciones no leídas
    console.log('\n4. Notificaciones no leídas:');
    const noLeidas = await query(`
      SELECT COUNT(*) AS count
      FROM notificaciones
      WHERE leida = 0
    `);
    console.log(`   Total no leídas: ${noLeidas.recordset[0].count}`);

    // 5. Ver últimas 5 notificaciones con detalles
    console.log('\n5. Últimas 5 notificaciones (detalles):');
    const last5 = await query(`
      SELECT TOP 5
        n.*,
        u.email AS usuario_email,
        u.role AS usuario_role,
        s.numero AS solicitud_numero
      FROM notificaciones n
      LEFT JOIN users u ON n.usuario_id = u.id
      LEFT JOIN solicitudes s ON n.solicitud_id = s.id
      ORDER BY n.fecha_creacion DESC
    `);
    
    last5.recordset.forEach((n, i) => {
      console.log(`\n   Notificación ${i + 1}:`);
      console.log(`   - ID: ${n.id}`);
      console.log(`   - Usuario ID: ${n.usuario_id}`);
      console.log(`   - Usuario Email: ${n.usuario_email || 'N/A'}`);
      console.log(`   - Usuario Rol: ${n.usuario_role || 'N/A'}`);
      console.log(`   - Tipo: ${n.tipo}`);
      console.log(`   - Evento: ${n.evento}`);
      console.log(`   - Título: ${n.titulo}`);
      console.log(`   - Leída: ${n.leida === 1 ? 'Sí' : 'No'}`);
      console.log(`   - Solicitud: ${n.solicitud_numero || 'N/A'}`);
      console.log(`   - Fecha: ${n.fecha_creacion}`);
    });

    console.log('\n=== FIN DEL DEBUGGING ===\n');
  } catch (error) {
    console.error('❌ Error en debugging:', error);
    console.error(error.stack);
  }
}

debugNotificaciones();

