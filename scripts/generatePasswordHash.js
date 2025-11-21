/**
 * Script para generar hash de contraseña
 * Útil para crear usuarios iniciales en la base de datos
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error al generar hash:', err);
    process.exit(1);
  }
  
  console.log('\n========================================');
  console.log('Hash generado para la contraseña:', password);
  console.log('========================================\n');
  console.log(hash);
  console.log('\n========================================\n');
  console.log('Copia este hash y úsalo en el INSERT del schema.sql');
  console.log('Ejemplo:');
  console.log(`INSERT INTO users (email, password_hash, role, nombre, activo)`);
  console.log(`VALUES ('admin@proveeduria.com', '${hash}', 'Administrador', 'Administrador', 1);`);
  console.log('\n');
});

