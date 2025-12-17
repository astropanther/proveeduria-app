/**
 * Script para crear la tabla notificaciones si no existe
 * Ejecutar: node scripts/createNotificacionesTable.js
 */

import { query } from '../backend/src/db/connection.js';
import { loadEnv } from '../backend/src/config/env.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

async function createNotificacionesTable() {
  if (!USE_DB) {
    console.log('⚠️  Base de datos no está habilitada (USE_DATABASE=false)');
    console.log('   Por favor, configura USE_DATABASE=true en tu archivo .env');
    return;
  }

  try {
    console.log('\n=== CREANDO TABLA NOTIFICACIONES ===\n');

    // Verificar si la tabla existe
    console.log('1. Verificando si la tabla existe...');
    const checkTable = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'notificaciones'
    `);

    if (checkTable.recordset.length > 0) {
      console.log('   ✅ La tabla "notificaciones" ya existe');
      console.log('   No es necesario crearla nuevamente.');
      return;
    }

    console.log('   ⚠️  La tabla "notificaciones" NO existe');
    console.log('   Creando tabla...\n');

    // Crear la tabla notificaciones
    const createTableSQL = `
      CREATE TABLE notificaciones (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo NVARCHAR(50) NOT NULL,
        evento NVARCHAR(50) NOT NULL,
        titulo NVARCHAR(255) NOT NULL,
        mensaje NVARCHAR(1000) NOT NULL,
        leida BIT NOT NULL DEFAULT 0,
        solicitud_id INT NULL,
        detalles NVARCHAR(MAX) NULL,
        fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (usuario_id) REFERENCES users(id),
        FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
      );
    `;

    await query(createTableSQL);
    console.log('   ✅ Tabla "notificaciones" creada exitosamente');

    // Crear índices
    console.log('\n2. Creando índices...');
    
    const indexes = [
      'CREATE INDEX IX_notificaciones_usuario_id ON notificaciones(usuario_id);',
      'CREATE INDEX IX_notificaciones_leida ON notificaciones(leida);',
      'CREATE INDEX IX_notificaciones_fecha ON notificaciones(fecha_creacion);',
      'CREATE INDEX IX_notificaciones_tipo ON notificaciones(tipo);',
    ];

    for (const indexSQL of indexes) {
      try {
        await query(indexSQL);
        console.log(`   ✅ Índice creado: ${indexSQL.split(' ')[2]}`);
      } catch (error) {
        // Si el índice ya existe, ignorar el error
        if (error.message.includes('already exists') || error.message.includes('ya existe')) {
          console.log(`   ⚠️  Índice ya existe: ${indexSQL.split(' ')[2]}`);
        } else {
          console.error(`   ❌ Error al crear índice: ${error.message}`);
        }
      }
    }

    console.log('\n=== TABLA NOTIFICACIONES CREADA EXITOSAMENTE ===\n');
    console.log('✅ Ahora puedes usar el sistema de notificaciones');
    console.log('   Las notificaciones se guardarán automáticamente cuando:');
    console.log('   - Se cree una solicitud');
    console.log('   - Se apruebe una solicitud');
    console.log('   - Se rechace una solicitud');
    console.log('   - Se anule una solicitud\n');

  } catch (error) {
    console.error('\n❌ Error al crear la tabla:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    
    if (error.message.includes('users')) {
      console.error('\n⚠️  Posible causa: La tabla "users" no existe.');
      console.error('   Por favor, ejecuta primero el schema.sql completo.');
    } else if (error.message.includes('solicitudes')) {
      console.error('\n⚠️  Posible causa: La tabla "solicitudes" no existe.');
      console.error('   Por favor, ejecuta primero el schema.sql completo.');
    }
  }
}

createNotificacionesTable();

