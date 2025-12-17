// Pruebas de unidad para el validador de contraseñas
// Aquí se probó que el validador cumple con todos los requisitos de seguridad

import { validatePassword } from '../../backend/src/utils/passwordValidator.js';

describe('Validador de Contraseñas - Backend', () => {
  
  describe('Validación de longitud', () => {
    test('Debe rechazar contraseñas con menos de 8 caracteres', () => {
      const resultado = validatePassword('Pass123');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('8 caracteres');
    });

    test('Debe aceptar contraseñas con exactamente 8 caracteres', () => {
      const resultado = validatePassword('Pass123!');
      expect(resultado.valid).toBe(true);
    });

    test('Debe rechazar contraseñas con más de 128 caracteres', () => {
      const passwordLargo = 'A'.repeat(129) + '1';
      const resultado = validatePassword(passwordLargo);
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('128 caracteres');
    });

    test('Debe aceptar contraseñas con exactamente 128 caracteres', () => {
      const passwordLargo = 'A'.repeat(126) + 'a1';
      const resultado = validatePassword(passwordLargo);
      expect(resultado.valid).toBe(true);
    });
  });

  describe('Validación de caracteres requeridos', () => {
    test('Debe rechazar contraseñas sin letras mayúsculas', () => {
      const resultado = validatePassword('password123!');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('mayúscula');
    });

    test('Debe rechazar contraseñas sin letras minúsculas', () => {
      const resultado = validatePassword('PASSWORD123!');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('minúscula');
    });

    test('Debe rechazar contraseñas sin números', () => {
      const resultado = validatePassword('Password!');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('número');
    });
  });

  describe('Validación de contraseñas débiles', () => {
    test('Debe rechazar contraseñas comunes como "password"', () => {
      const resultado = validatePassword('Password123');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('común o débil');
    });

    test('Debe rechazar contraseñas comunes como "admin123"', () => {
      const resultado = validatePassword('Admin123');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('común o débil');
    });

    test('Debe rechazar contraseñas que contengan palabras débiles', () => {
      const resultado = validatePassword('MyPassword123');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('común o débil');
    });
  });

  describe('Validación de tipos de caracteres', () => {
    test('Debe rechazar contraseñas que sean solo números', () => {
      const resultado = validatePassword('12345678');
      expect(resultado.valid).toBe(false);
      // Primero valida que tenga mayúscula, por eso el error es diferente
      expect(resultado.error).toBeDefined();
    });

    test('Debe rechazar contraseñas que sean solo letras', () => {
      const resultado = validatePassword('Password');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('número');
    });
  });

  describe('Contraseñas válidas', () => {
    test('Debe aceptar contraseñas seguras con todos los requisitos', () => {
      const resultado = validatePassword('SecurePass2024!');
      expect(resultado.valid).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    test('Debe aceptar contraseñas con caracteres especiales', () => {
      const resultado = validatePassword('MyP@ssw0rd!');
      expect(resultado.valid).toBe(true);
    });

    test('Debe aceptar contraseñas con números al inicio', () => {
      const resultado = validatePassword('2024SecurePass');
      expect(resultado.valid).toBe(true);
    });
  });

  describe('Casos límite y validación de entrada', () => {
    test('Debe rechazar contraseñas vacías', () => {
      const resultado = validatePassword('');
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('requerida');
    });

    test('Debe rechazar valores null', () => {
      const resultado = validatePassword(null);
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('requerida');
    });

    test('Debe rechazar valores undefined', () => {
      const resultado = validatePassword(undefined);
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('requerida');
    });

    test('Debe rechazar valores que no sean strings', () => {
      const resultado = validatePassword(12345678);
      expect(resultado.valid).toBe(false);
      expect(resultado.error).toContain('requerida');
    });
  });
});

