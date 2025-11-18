/**
 * Authentication service
 * PB-8: Inicio de Sesión Seguro
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findByEmail } from '../users/repository.js';
import { loadEnv } from '../../config/env.js';

const env = loadEnv();

/**
 * Compara un password plano con un hash
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Inicia sesión validando credenciales y generando JWT
 * @param {string} email - Email del usuario
 * @param {string} password - Password plano
 * @returns {Promise<{token: string, user: object}>} Token JWT y datos del usuario
 * @throws {Error} Si las credenciales son inválidas
 */
export async function login(email, password) {
  // 1. Buscar usuario por email
  const user = await findByEmail(email);
  
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // 2. Comparar password hasheado con bcrypt.compare
  const isPasswordValid = await comparePassword(password, user.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  // 3. Generar JWT con jsonwebtoken
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // 4. Retornar token y datos del usuario (sin password)
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...userWithoutPassword } = user;
  
  return {
    token,
    user: userWithoutPassword,
  };
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT
 * @returns {object} Payload decodificado (userId, email, role)
 * @throws {Error} Si el token es inválido o expiró
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch {
    throw new Error('Token inválido o expirado');
  }
}

