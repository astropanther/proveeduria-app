// Pruebas de unidad para el servicio de autenticación
// Aquí se probó que la validación de tokens JWT funciona correctamente

import { verifyToken } from '../../backend/src/modules/auth/service.js';
import jwt from 'jsonwebtoken';
import { loadEnv } from '../../backend/src/config/env.js';

const env = loadEnv();

describe('Servicio de Autenticación - verifyToken', () => {
  const payloadValido = {
    userId: 1,
    email: 'test@example.com',
    role: 'Administrador',
  };

  describe('Validación de tokens válidos', () => {
    test('Debe verificar y decodificar un token válido', () => {
      const token = jwt.sign(payloadValido, env.JWT_SECRET, { expiresIn: '1h' });
      const resultado = verifyToken(token);
      
      expect(resultado).toHaveProperty('userId', 1);
      expect(resultado).toHaveProperty('email', 'test@example.com');
      expect(resultado).toHaveProperty('role', 'Administrador');
    });

    test('Debe verificar tokens con diferentes roles', () => {
      const payloadComprador = { ...payloadValido, role: 'Comprador', userId: 2 };
      const token = jwt.sign(payloadComprador, env.JWT_SECRET, { expiresIn: '1h' });
      const resultado = verifyToken(token);
      
      expect(resultado.role).toBe('Comprador');
      expect(resultado.userId).toBe(2);
    });
  });

  describe('Manejo de tokens inválidos', () => {
    test('Debe lanzar error para tokens con firma inválida', () => {
      const tokenInvalido = jwt.sign(payloadValido, 'secret-incorrecto', { expiresIn: '1h' });
      
      expect(() => {
        verifyToken(tokenInvalido);
      }).toThrow('Token inválido');
    });

    test('Debe lanzar error para tokens malformados', () => {
      const tokenMalformado = 'token.malformado.invalido';
      
      expect(() => {
        verifyToken(tokenMalformado);
      }).toThrow('Token inválido');
    });

    test('Debe lanzar error para tokens vacíos', () => {
      expect(() => {
        verifyToken('');
      }).toThrow('Token inválido');
    });
  });

  describe('Manejo de tokens expirados', () => {
    test('Debe lanzar error para tokens expirados', () => {
      const tokenExpirado = jwt.sign(payloadValido, env.JWT_SECRET, { expiresIn: '-1s' });
      
      expect(() => {
        verifyToken(tokenExpirado);
      }).toThrow('Token expirado');
    });
  });

  describe('Validación de payload', () => {
    test('Debe preservar todos los campos del payload', () => {
      const payloadCompleto = {
        userId: 5,
        email: 'usuario@test.com',
        role: 'Aprobador Jefe',
        nombre: 'Usuario Test',
      };
      const token = jwt.sign(payloadCompleto, env.JWT_SECRET, { expiresIn: '1h' });
      const resultado = verifyToken(token);
      
      expect(resultado.userId).toBe(5);
      expect(resultado.email).toBe('usuario@test.com');
      expect(resultado.role).toBe('Aprobador Jefe');
      expect(resultado.nombre).toBe('Usuario Test');
    });
  });
});

