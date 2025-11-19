/**
 * User repository
 * PB-6: Registrar Usuarios y Roles
 * PB-7: Editar e Inactivar Usuarios
 * TODO: Implementar consultas a base de datos (PB-20/PB-21)
 */

import bcrypt from 'bcryptjs';
import * as usersData from './usersData.js';

export async function findByEmail(email) {
  return usersData.findUserByEmail(email);
}

export async function create(userData) {
  const { email, password, role, nombre } = userData;
  const password_hash = await bcrypt.hash(password, 10);
  const newUser = usersData.addUser({
    email,
    password_hash,
    role,
    nombre: nombre || email.split('@')[0],
    activo: true,
  });
  return newUser;
}

export async function findById(id) {
  return usersData.findUserById(id);
}

export async function findAll(filters = {}) {
  let users = usersData.getAllUsers();
  if (filters.role) {
    users = users.filter(u => u.role === filters.role);
  }
  if (filters.activo !== undefined) {
    users = users.filter(u => u.activo === filters.activo);
  }
  return users;
}

export async function update(id, updates) {
  // Si se actualiza la contraseña, encriptarla
  if (updates.password) {
    updates.password_hash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }
  return usersData.updateUser(id, updates);
}
