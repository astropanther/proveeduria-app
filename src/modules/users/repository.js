/**
 * User repository
 * PB-6: Registrar Usuarios y Roles
 * PB-7: Editar e Inactivar Usuarios
 */

import bcrypt from 'bcryptjs';
import { query } from '../../db/connection.js';
import { loadEnv } from '../../config/env.js';
import * as usersData from './usersData.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

export async function findByEmail(email) {
  if (!USE_DB) {
    return usersData.findUserByEmail(email);
  }

  try {
    const sql = `SELECT * FROM users WHERE email = @email AND activo = 1`;
    const result = await query(sql, { email });
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error al buscar usuario por email:', error);
    throw error;
  }
}

export async function create(userData) {
  const { email, password, role, nombre } = userData;
  const password_hash = await bcrypt.hash(password, 10);

  if (!USE_DB) {
    return usersData.addUser({
      email,
      password_hash,
      role,
      nombre: nombre || email.split('@')[0],
      activo: true,
    });
  }

  try {
    const sql = `
      INSERT INTO users (email, password_hash, role, nombre, activo)
      VALUES (@email, @password_hash, @role, @nombre, 1)
    `;
    await query(sql, {
      email,
      password_hash,
      role,
      nombre: nombre || email.split('@')[0],
    });
    
    // Obtener el usuario recién creado usando el email
    const userResult = await query(
      `SELECT * FROM users WHERE email = @email`,
      { email }
    );
    
    if (!userResult.recordset || userResult.recordset.length === 0) {
      throw new Error('No se pudo crear el usuario');
    }
    
    return userResult.recordset[0];
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

export async function findById(id) {
  if (!USE_DB) {
    return usersData.findUserById(id);
  }

  try {
    const sql = `SELECT * FROM users WHERE id = @id`;
    const result = await query(sql, { id: parseInt(id) });
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error al buscar usuario por ID:', error);
    throw error;
  }
}

export async function findAll(filters = {}) {
  if (!USE_DB) {
    let users = usersData.getAllUsers();
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters.activo !== undefined) {
      users = users.filter(u => u.activo === filters.activo);
    }
    return users;
  }

  try {
    let sql = `SELECT * FROM users WHERE 1=1`;
    const params = {};

    if (filters.role) {
      sql += ` AND role = @role`;
      params.role = filters.role;
    }
    if (filters.activo !== undefined) {
      sql += ` AND activo = @activo`;
      params.activo = filters.activo ? 1 : 0;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

export async function update(id, updates) {
  // Si se actualiza la contraseña, encriptarla
  if (updates.password) {
    updates.password_hash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  if (!USE_DB) {
    return usersData.updateUser(id, updates);
  }

  try {
    const fields = [];
    const params = { id: parseInt(id) };

    if (updates.email !== undefined) {
      fields.push('email = @email');
      params.email = updates.email;
    }
    if (updates.password_hash !== undefined) {
      fields.push('password_hash = @password_hash');
      params.password_hash = updates.password_hash;
    }
    if (updates.role !== undefined) {
      fields.push('role = @role');
      params.role = updates.role;
    }
    if (updates.nombre !== undefined) {
      fields.push('nombre = @nombre');
      params.nombre = updates.nombre;
    }
    if (updates.activo !== undefined) {
      fields.push('activo = @activo');
      params.activo = updates.activo ? 1 : 0;
    }

    if (fields.length === 0) {
      return findById(id);
    }

    fields.push('updated_at = GETDATE()');

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `;

    const result = await query(sql, params);
    
    if (!result.recordset || result.recordset.length === 0) {
      return null;
    }
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}
