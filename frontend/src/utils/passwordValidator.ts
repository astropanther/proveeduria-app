/**
 * Validador de contraseñas seguras (Frontend)
 */

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'medium' | 'strong';
  color: 'red' | 'orange' | 'green';
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  error?: string;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  let score = 0;
  if (requirements.length) score += 20;
  if (requirements.uppercase) score += 20;
  if (requirements.lowercase) score += 20;
  if (requirements.number) score += 20;
  if (requirements.special) score += 20;

  let level: 'weak' | 'medium' | 'strong' = 'weak';
  let color: 'red' | 'orange' | 'green' = 'red';

  if (score < 40) {
    level = 'weak';
    color = 'red';
  } else if (score < 80) {
    level = 'medium';
    color = 'orange';
  } else {
    level = 'strong';
    color = 'green';
  }

  // Validar errores específicos
  let error: string | undefined;
  if (password.length > 0 && password.length < 8) {
    error = 'La contraseña debe tener al menos 8 caracteres';
  } else if (password.length > 0 && !requirements.uppercase) {
    error = 'Debe contener al menos una letra mayúscula';
  } else if (password.length > 0 && !requirements.lowercase) {
    error = 'Debe contener al menos una letra minúscula';
  } else if (password.length > 0 && !requirements.number) {
    error = 'Debe contener al menos un número';
  }

  return {
    score,
    level,
    color,
    requirements,
    error,
  };
}

