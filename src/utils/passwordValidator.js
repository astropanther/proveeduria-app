/**
 * Validador de contraseñas seguras
 * Previene el uso de contraseñas débiles o comprometidas
 */

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {{valid: boolean, error?: string}} Resultado de la validación
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'La contraseña es requerida' };
  }

  // Longitud mínima: 8 caracteres
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  // Longitud máxima: 128 caracteres (prevenir ataques DoS)
  if (password.length > 128) {
    return { valid: false, error: 'La contraseña no puede exceder 128 caracteres' };
  }

  // Debe contener al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una letra mayúscula' };
  }

  // Debe contener al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una letra minúscula' };
  }

  // Debe contener al menos un número
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' };
  }

  // Lista de contraseñas comunes/debiles que no se permiten
  const weakPasswords = [
    'password', 'password123', 'admin', 'admin123', '12345678',
    'qwerty', 'abc123', 'letmein', 'welcome', 'monkey',
    '123456789', 'password1', 'iloveyou', 'princess', 'rockyou',
    '1234567', '123456', 'qwerty123', 'admin1234', 'comprador123',
    'aprobador123', 'usuario123', 'test123', 'demo123'
  ];

  const passwordLower = password.toLowerCase();
  if (weakPasswords.some(weak => passwordLower.includes(weak))) {
    return { valid: false, error: 'La contraseña es demasiado común o débil. Por favor, elige una contraseña más segura' };
  }

  // Verificar que no sea solo números o solo letras
  if (/^\d+$/.test(password)) {
    return { valid: false, error: 'La contraseña no puede ser solo números' };
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' };
  }

  return { valid: true };
}

