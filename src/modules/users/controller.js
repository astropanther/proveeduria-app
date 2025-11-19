/**
 * User controller
 * PB-6: Registrar Usuarios y Roles
 * PB-7: Editar e Inactivar Usuarios
 */

import * as userRepository from './repository.js';
import { ROLES, isValidRole } from './types.js';

/**
 * Crea un nuevo usuario
 */
export async function createUser(req, res) {
  try {
    const { email, password, role, nombre } = req.body;

    // Validaciones
    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Email, password y role son requeridos',
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
      });
    }

    // Validar que el rol sea válido
    if (!isValidRole(role)) {
      return res.status(400).json({
        error: `Rol inválido. Roles permitidos: ${Object.values(ROLES).join(', ')}`,
      });
    }

    // Validar que el email no esté duplicado
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'El email ya está registrado',
      });
    }

    // Validar longitud mínima de password
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Crear usuario
    const newUser = await userRepository.create({
      email,
      password,
      role,
      nombre,
    });

    // Retornar usuario sin password_hash
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al crear usuario',
    });
  }
}

/**
 * Lista todos los usuarios
 */
export async function listUsers(req, res) {
  try {
    const { role, activo } = req.query;

    const filters = {};
    if (role) filters.role = role;
    if (activo !== undefined) filters.activo = activo === 'true';

    const users = await userRepository.findAll(filters);

    // Remover password_hash de todos los usuarios
    // eslint-disable-next-line no-unused-vars
    const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);

    return res.status(200).json({
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al listar usuarios',
    });
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await userRepository.findById(parseInt(id));

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    // Remover password_hash
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al obtener usuario',
    });
  }
}

/**
 * Actualiza un usuario existente
 * PB-7: Editar e Inactivar Usuarios
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, password, role, nombre, activo } = req.body;

    // Verificar que el usuario existe
    const existingUser = await userRepository.findById(parseInt(id));
    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    // Preparar actualizaciones
    const updates = {};

    // Si se actualiza el email, validar formato y duplicados
    if (email !== undefined) {
      if (email !== existingUser.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            error: 'Email inválido',
          });
        }

        // Verificar que el nuevo email no esté en uso
        const emailInUse = await userRepository.findByEmail(email);
        if (emailInUse && emailInUse.id !== parseInt(id)) {
          return res.status(409).json({
            error: 'El email ya está registrado',
          });
        }
        updates.email = email;
      }
    }

    // Si se actualiza el password, validar longitud
    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 6 caracteres',
        });
      }
      updates.password = password;
    }

    // Si se actualiza el rol, validar que sea válido
    if (role !== undefined) {
      if (!isValidRole(role)) {
        return res.status(400).json({
          error: `Rol inválido. Roles permitidos: ${Object.values(ROLES).join(', ')}`,
        });
      }
      updates.role = role;
    }

    // Actualizar nombre si se proporciona
    if (nombre !== undefined) {
      updates.nombre = nombre;
    }

    // Actualizar estado activo si se proporciona
    if (activo !== undefined) {
      updates.activo = activo === true || activo === 'true';
    }

    // Si no hay actualizaciones, retornar error
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron campos para actualizar',
      });
    }

    // Actualizar usuario
    const updatedUser = await userRepository.update(parseInt(id), updates);

    // Remover password_hash de la respuesta
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al actualizar usuario',
    });
  }
}

/**
 * Inactiva un usuario
 * PB-7: Editar e Inactivar Usuarios
 */
export async function inactivateUser(req, res) {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await userRepository.findById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    // Verificar que no esté intentando inactivarse a sí mismo
    if (req.user && req.user.userId === parseInt(id)) {
      return res.status(400).json({
        error: 'No puedes inactivar tu propio usuario',
      });
    }

    // Verificar que el usuario no esté ya inactivo
    if (user.activo === false) {
      return res.status(400).json({
        error: 'El usuario ya está inactivo',
      });
    }

    // Inactivar usuario
    const updatedUser = await userRepository.update(parseInt(id), { activo: false });

    // Remover password_hash de la respuesta
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'Usuario inactivado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al inactivar usuario',
    });
  }
}

/**
 * Activa un usuario
 * PB-7: Editar e Inactivar Usuarios
 */
export async function activateUser(req, res) {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await userRepository.findById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    // Verificar que el usuario no esté ya activo
    if (user.activo === true) {
      return res.status(400).json({
        error: 'El usuario ya está activo',
      });
    }

    // Activar usuario
    const updatedUser = await userRepository.update(parseInt(id), { activo: true });

    // Remover password_hash de la respuesta
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'Usuario activado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al activar usuario',
    });
  }
}

