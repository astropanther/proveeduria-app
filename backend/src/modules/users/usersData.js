/**
 * Dummy data storage for users (in-memory)
 * PB-6: Registrar Usuarios y Roles
 * TODO: Reemplazar con conexión a BD cuando PB-20 esté completo
 */

// Almacenamiento en memoria (simula tabla users)
let users = [];

// Contador para IDs únicos
let nextId = 1;

export function getAllUsers() {
  return users;
}

export function addUser(user) {
  const newUser = {
    id: nextId++,
    ...user,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

export function findUserByEmail(email) {
  return users.find(u => u.email === email) || null;
}

export function findUserById(id) {
  return users.find(u => u.id === id) || null;
}

export function updateUser(id, updates) {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return users[index];
}

