/**
 * Seed script para crear usuario admin inicial
 * PB-6: Registrar Usuarios y Roles
 * 
 * Uso: node scripts/seedAdmin.js
 */

import * as userRepository from '../src/modules/users/repository.js';
import { ROLES } from '../src/modules/users/types.js';

async function seedAdmin() {
  try {
    console.log('Iniciando seed de usuario admin...');

    // Verificar si ya existe un admin
    const existingAdmin = await userRepository.findByEmail('admin@proveeduria.com');
    
    if (existingAdmin) {
      console.log('Usuario admin ya existe:', existingAdmin.email);
      return;
    }

    // Crear usuario admin
    const admin = await userRepository.create({
      email: 'admin@proveeduria.com',
      password: 'admin123', // Cambiar en producción
      role: ROLES.ADMIN,
      nombre: 'Administrador',
    });

    console.log('Usuario admin creado exitosamente:');
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    console.log('- ID:', admin.id);
    console.log('\nNota: Cambiar la contraseña en producción');

    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuario admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();

