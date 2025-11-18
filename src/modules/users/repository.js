/**
 * User repository
 * PB-6: Registrar Usuarios y Roles
 * TODO: Implementar consultas a base de datos (PB-20/PB-21)
 */

// eslint-disable-next-line no-unused-vars
export async function findByEmail(_email) {
  // TODO: Implementar consulta SQL por email
  // SELECT * FROM users WHERE email = @email
  return null;
}

// eslint-disable-next-line no-unused-vars
export async function create(_userData) {
  // TODO: Implementar inserción SQL
  // INSERT INTO users (email, password_hash, role, ...) VALUES (...)
  // Retornar el usuario creado con su ID
  return null;
}

// eslint-disable-next-line no-unused-vars
export async function findById(_id) {
  // TODO: Implementar consulta SQL por ID
  // SELECT * FROM users WHERE id = @id
  return null;
}

// eslint-disable-next-line no-unused-vars
export async function findAll(_filters = {}) {
  // TODO: Implementar consulta SQL para listar usuarios
  // Con filtros opcionales (role, estado activo/inactivo, etc.)
  return [];
}