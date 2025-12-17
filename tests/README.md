# Pruebas de Unidad

Este folder contiene todas las pruebas de unidad realizadas para el sistema de proveeduría.

## Estructura

```
tests/
├── unit/                    # Pruebas de unidad
│   ├── passwordValidator.test.js
│   ├── permissions.test.js
│   └── authService.test.js
├── PRUEBAS_UNIDAD.md        # Documentación completa de las pruebas
└── README.md                # Este archivo
```

## Cómo ejecutar las pruebas

Para ejecutar todas las pruebas:

```bash
npm test
```

Para ejecutar las pruebas en modo watch (se ejecutan automáticamente al cambiar archivos):

```bash
npm run test:watch
```

Para generar un reporte de cobertura:

```bash
npm run test:coverage
```

El reporte de cobertura se generará en la carpeta `coverage/` en la raíz del proyecto.

## Módulos probados

1. **Validador de Contraseñas**: 20 casos de prueba
2. **Sistema de Permisos**: 25 casos de prueba
3. **Servicio de Autenticación**: 7 casos de prueba

**Total: 52 casos de prueba (53 pruebas ejecutadas - una prueba adicional en límites de monto)**

Para más detalles sobre cada prueba, ver el archivo `PRUEBAS_UNIDAD.md`.

