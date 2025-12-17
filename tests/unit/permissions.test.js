// Pruebas de unidad para el sistema de permisos
// Aquí se probó que los permisos funcionan correctamente para diferentes roles

import {
  puedeVerSolicitud,
  puedeAprobarSolicitud,
  ROLES,
  LIMITES_APROBACION,
} from '../../backend/src/modules/solicitudes/permissions.js';

describe('Sistema de Permisos - puedeVerSolicitud', () => {
  const solicitudBase = {
    id: 1,
    numero: 'SOL-001',
    usuarioId: 10,
    monto: 25000,
    estado: 'Pendiente',
  };

  describe('Rol Administrador', () => {
    test('Admin puede ver cualquier solicitud', () => {
      const resultado = puedeVerSolicitud(ROLES.ADMIN, 1, solicitudBase);
      expect(resultado).toBe(true);
    });

    test('Admin puede ver solicitudes en cualquier estado', () => {
      const solicitudAprobada = { ...solicitudBase, estado: 'Aprobada' };
      const resultado = puedeVerSolicitud(ROLES.ADMIN, 1, solicitudAprobada);
      expect(resultado).toBe(true);
    });
  });

  describe('Rol Comprador', () => {
    test('Comprador puede ver sus propias solicitudes', () => {
      const resultado = puedeVerSolicitud(ROLES.COMPRADOR, 10, solicitudBase);
      expect(resultado).toBe(true);
    });

    test('Comprador NO puede ver solicitudes de otros usuarios', () => {
      const resultado = puedeVerSolicitud(ROLES.COMPRADOR, 20, solicitudBase);
      expect(resultado).toBe(false);
    });

    test('Comprador puede ver sus solicitudes en cualquier estado', () => {
      const solicitudAprobada = { ...solicitudBase, estado: 'Aprobada' };
      const resultado = puedeVerSolicitud(ROLES.COMPRADOR, 10, solicitudAprobada);
      expect(resultado).toBe(true);
    });
  });

  describe('Rol Aprobador Jefe', () => {
    test('Aprobador Jefe puede ver solicitudes pendientes', () => {
      const resultado = puedeVerSolicitud(ROLES.APROBADOR_JEFE, 30, solicitudBase);
      expect(resultado).toBe(true);
    });

    test('Aprobador Jefe puede ver solicitudes que aprobó', () => {
      const solicitudAprobada = {
        ...solicitudBase,
        estado: 'Aprobada',
        aprobadorJefe: 30,
      };
      const resultado = puedeVerSolicitud(ROLES.APROBADOR_JEFE, 30, solicitudAprobada);
      expect(resultado).toBe(true);
    });

    test('Aprobador Jefe NO puede ver solicitudes aprobadas por otros', () => {
      const solicitudAprobada = {
        ...solicitudBase,
        estado: 'Aprobada',
        aprobadorJefe: 40,
      };
      const resultado = puedeVerSolicitud(ROLES.APROBADOR_JEFE, 30, solicitudAprobada);
      expect(resultado).toBe(false);
    });
  });

  describe('Rol Aprobador Financiero', () => {
    test('Aprobador Financiero puede ver solicitudes pendientes', () => {
      const resultado = puedeVerSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitudBase);
      expect(resultado).toBe(true);
    });

    test('Aprobador Financiero puede ver solicitudes que aprobó', () => {
      const solicitudAprobada = {
        ...solicitudBase,
        estado: 'Aprobada',
        aprobadorFinanciero: 50,
      };
      const resultado = puedeVerSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitudAprobada);
      expect(resultado).toBe(true);
    });
  });

  describe('Casos límite', () => {
    test('Debe retornar false si la solicitud es null', () => {
      const resultado = puedeVerSolicitud(ROLES.ADMIN, 1, null);
      expect(resultado).toBe(false);
    });

    test('Debe retornar false si el rol es null', () => {
      const resultado = puedeVerSolicitud(null, 1, solicitudBase);
      expect(resultado).toBe(false);
    });

    test('Debe retornar false si el userId es null', () => {
      const resultado = puedeVerSolicitud(ROLES.ADMIN, null, solicitudBase);
      expect(resultado).toBe(false);
    });
  });
});

describe('Sistema de Permisos - puedeAprobarSolicitud', () => {
  describe('Rol Administrador', () => {
    test('Admin puede aprobar cualquier solicitud pendiente', () => {
      const solicitud = {
        id: 1,
        monto: 100000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.ADMIN, 1, solicitud);
      expect(resultado).toBe(true);
    });

    test('Admin puede aprobar solicitudes de cualquier monto', () => {
      const solicitud = {
        id: 1,
        monto: 500000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.ADMIN, 1, solicitud);
      expect(resultado).toBe(true);
    });
  });

  describe('Rol Comprador', () => {
    test('Comprador NO puede aprobar solicitudes', () => {
      const solicitud = {
        id: 1,
        monto: 10000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.COMPRADOR, 10, solicitud);
      expect(resultado).toBe(false);
    });
  });

  describe('Rol Aprobador Jefe', () => {
    test('Aprobador Jefe puede aprobar solicitudes < $50,000', () => {
      const solicitud = {
        id: 1,
        monto: 25000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_JEFE, 30, solicitud);
      expect(resultado).toBe(true);
    });

    test('Aprobador Jefe puede aprobar solicitudes >= $50,000', () => {
      const solicitud = {
        id: 1,
        monto: 75000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_JEFE, 30, solicitud);
      expect(resultado).toBe(true);
    });

    test('Aprobador Jefe NO puede aprobar si ya aprobó la solicitud', () => {
      const solicitud = {
        id: 1,
        monto: 25000,
        estado: 'Pendiente',
        aprobadorJefe: 30,
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_JEFE, 30, solicitud);
      expect(resultado).toBe(false);
    });

    test('Aprobador Jefe NO puede aprobar solicitudes no pendientes', () => {
      const solicitud = {
        id: 1,
        monto: 25000,
        estado: 'Aprobada',
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_JEFE, 30, solicitud);
      expect(resultado).toBe(false);
    });
  });

  describe('Rol Aprobador Financiero', () => {
    test('Aprobador Financiero puede aprobar solicitudes >= $50,000', () => {
      const solicitud = {
        id: 1,
        monto: 75000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      expect(resultado).toBe(true);
    });

    test('Aprobador Financiero NO puede aprobar solicitudes < $50,000 sin aprobación previa', () => {
      const solicitud = {
        id: 1,
        monto: 25000,
        estado: 'Pendiente',
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      expect(resultado).toBe(false);
    });

    test('Aprobador Financiero puede aprobar solicitudes < $50,000 si ya tiene aprobación del jefe', () => {
      const solicitud = {
        id: 1,
        monto: 25000,
        estado: 'Pendiente',
        aprobadorJefe: 30,
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      expect(resultado).toBe(true);
    });

    test('Aprobador Financiero NO puede aprobar si ya aprobó la solicitud', () => {
      const solicitud = {
        id: 1,
        monto: 75000,
        estado: 'Pendiente',
        aprobadorFinanciero: 50,
      };
      const resultado = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      expect(resultado).toBe(false);
    });
  });

  describe('Límites de monto', () => {
    test('Solicitud de $49,999 requiere solo Aprobador Jefe', () => {
      const solicitud = {
        id: 1,
        monto: 49999,
        estado: 'Pendiente',
      };
      const resultadoJefe = puedeAprobarSolicitud(ROLES.APROBADOR_JEFE, 30, solicitud);
      const resultadoFinanciero = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      
      expect(resultadoJefe).toBe(true);
      expect(resultadoFinanciero).toBe(false);
    });

    test('Solicitud de $50,000 requiere Aprobador Financiero', () => {
      const solicitud = {
        id: 1,
        monto: 50000,
        estado: 'Pendiente',
      };
      const resultadoFinanciero = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      
      expect(resultadoFinanciero).toBe(true);
    });

    test('Solicitud de $100,000 requiere ambos aprobadores', () => {
      const solicitud = {
        id: 1,
        monto: 100000,
        estado: 'Pendiente',
      };
      const resultadoJefe = puedeAprobarSolicitud(ROLES.APROBADOR_JEFE, 30, solicitud);
      const resultadoFinanciero = puedeAprobarSolicitud(ROLES.APROBADOR_FINANCIERO, 50, solicitud);
      
      expect(resultadoJefe).toBe(true);
      expect(resultadoFinanciero).toBe(true);
    });
  });
});

