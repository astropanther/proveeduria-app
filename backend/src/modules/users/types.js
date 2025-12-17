/**
 * User roles constants
 * PB-6: Registrar Usuarios y Roles
 * Define los roles disponibles en el sistema
 */

export const ROLES =  {
    COMPRADOR: 'Comprador',
    APROBADOR_JEFE: 'Aprobador Jefe',
    APROBADOR_FINANCIERO: 'Aprobador Financiero',
    ADMIN: 'Administrador',
};

export const ROLE_KEYS = Object.keys(ROLES);

export function isValidRole(role) {
    return Object.values(ROLES).includes(role);
}