# Pruebas de Unidad - Sistema de Proveeduría

## Introducción

Este documento describe las pruebas de unidad que se implementaron para el sistema de proveeduría. Las pruebas de unidad permiten verificar que cada componente del sistema funciona de manera independiente y correcta antes de integrarse con otros módulos.

## Objetivo

El objetivo principal de estas pruebas es verificar que los módulos críticos del sistema funcionan correctamente según sus especificaciones. Se validaron los siguientes aspectos:

- La lógica de negocio implementada en cada módulo
- Las validaciones de entrada de datos
- El manejo de casos límite y valores extremos
- El control de errores y excepciones

## Framework Utilizado

Para la implementación de las pruebas se utilizó Jest, que es un framework de pruebas para JavaScript y Node.js. La configuración del proyecto utiliza ES Modules con soporte experimental de Node.js para mantener la consistencia con el resto del código del proyecto.

## Módulos Probados

### 1. Validador de Contraseñas (Backend)

**Ubicación**: `src/utils/passwordValidator.js`

**Objetivo**: Aquí se verificó que el validador de contraseñas cumple con todos los requisitos de seguridad establecidos.

#### Pruebas Implementadas

##### 1.1 Validación de Longitud

| Prueba | Valor de Entrada | Resultado Esperado | Control Utilizado |
|--------|------------------|-------------------|-------------------|
| Contraseña < 8 caracteres | `'Pass123'` | `{valid: false, error: '8 caracteres'}` | `expect(resultado.valid).toBe(false)` |
| Contraseña = 8 caracteres | `'Pass123!'` | `{valid: true}` | `expect(resultado.valid).toBe(true)` |
| Contraseña > 128 caracteres | `'A' * 129 + '1'` | `{valid: false, error: '128 caracteres'}` | `expect(resultado.valid).toBe(false)` |
| Contraseña = 128 caracteres | `'A' * 127 + '1'` | `{valid: true}` | `expect(resultado.valid).toBe(true)` |

##### 1.2 Validación de Caracteres Requeridos

| Prueba | Valor de Entrada | Resultado Esperado | Control Utilizado |
|--------|------------------|-------------------|-------------------|
| Sin mayúsculas | `'password123!'` | `{valid: false, error: 'mayúscula'}` | `expect(resultado.error).toContain('mayúscula')` |
| Sin minúsculas | `'PASSWORD123!'` | `{valid: false, error: 'minúscula'}` | `expect(resultado.error).toContain('minúscula')` |
| Sin números | `'Password!'` | `{valid: false, error: 'número'}` | `expect(resultado.error).toContain('número')` |

##### 1.3 Validación de Contraseñas Débiles

| Prueba | Valor de Entrada | Resultado Esperado | Control Utilizado |
|--------|------------------|-------------------|-------------------|
| Contraseña común "password" | `'password123'` | `{valid: false, error: 'común o débil'}` | `expect(resultado.error).toContain('común')` |
| Contraseña común "admin123" | `'admin123'` | `{valid: false, error: 'común o débil'}` | `expect(resultado.error).toContain('común')` |
| Contraseña común "12345678" | `'12345678'` | `{valid: false, error: 'común o débil'}` | `expect(resultado.error).toContain('común')` |
| Contiene palabra débil | `'MyPassword123'` | `{valid: false, error: 'común o débil'}` | `expect(resultado.error).toContain('común')` |

##### 1.4 Validación de Tipos de Caracteres

| Prueba | Valor de Entrada | Resultado Esperado | Control Utilizado |
|--------|------------------|-------------------|-------------------|
| Solo números | `'12345678'` | `{valid: false, error: 'solo números'}` | `expect(resultado.error).toContain('solo números')` |
| Solo letras | `'Password'` | `{valid: false, error: 'número'}` | `expect(resultado.error).toContain('número')` |

##### 1.5 Contraseñas Válidas

| Prueba | Valor de Entrada | Resultado Esperado | Control Utilizado |
|--------|------------------|-------------------|-------------------|
| Contraseña segura completa | `'SecurePass2024!'` | `{valid: true}` | `expect(resultado.valid).toBe(true)` |
| Con caracteres especiales | `'MyP@ssw0rd!'` | `{valid: true}` | `expect(resultado.valid).toBe(true)` |
| Números al inicio | `'2024SecurePass'` | `{valid: true}` | `expect(resultado.valid).toBe(true)` |

##### 1.6 Casos Límite

| Prueba | Valor de Entrada | Resultado Esperado | Control Utilizado |
|--------|------------------|-------------------|-------------------|
| Contraseña vacía | `''` | `{valid: false, error: 'requerida'}` | `expect(resultado.error).toContain('requerida')` |
| Valor null | `null` | `{valid: false, error: 'requerida'}` | `expect(resultado.valid).toBe(false)` |
| Valor undefined | `undefined` | `{valid: false, error: 'requerida'}` | `expect(resultado.valid).toBe(false)` |
| No es string | `12345678` | `{valid: false, error: 'requerida'}` | `expect(resultado.valid).toBe(false)` |

**Total de Pruebas**: 20 casos de prueba

### 2. Sistema de Permisos

**Ubicación**: `src/modules/solicitudes/permissions.js`

**Objetivo**: Aquí se verificó que el sistema de permisos controla correctamente el acceso a las solicitudes según roles y montos.

#### 2.1 Pruebas de `puedeVerSolicitud`

##### Rol Administrador

| Prueba | Rol | userId | Solicitud | Resultado Esperado | Control Utilizado |
|--------|-----|--------|-----------|-------------------|-------------------|
| Ver cualquier solicitud | `Administrador` | `1` | `{id: 1, estado: 'Pendiente'}` | `true` | `expect(resultado).toBe(true)` |
| Ver solicitud aprobada | `Administrador` | `1` | `{id: 1, estado: 'Aprobada'}` | `true` | `expect(resultado).toBe(true)` |

##### Rol Comprador

| Prueba | Rol | userId | Solicitud | Resultado Esperado | Control Utilizado |
|--------|-----|--------|-----------|-------------------|-------------------|
| Ver propia solicitud | `Comprador` | `10` | `{usuarioId: 10}` | `true` | `expect(resultado).toBe(true)` |
| Ver solicitud de otro | `Comprador` | `20` | `{usuarioId: 10}` | `false` | `expect(resultado).toBe(false)` |
| Ver propia aprobada | `Comprador` | `10` | `{usuarioId: 10, estado: 'Aprobada'}` | `true` | `expect(resultado).toBe(true)` |

##### Rol Aprobador Jefe

| Prueba | Rol | userId | Solicitud | Resultado Esperado | Control Utilizado |
|--------|-----|--------|-----------|-------------------|-------------------|
| Ver pendiente | `Aprobador Jefe` | `30` | `{estado: 'Pendiente'}` | `true` | `expect(resultado).toBe(true)` |
| Ver que aprobó | `Aprobador Jefe` | `30` | `{estado: 'Aprobada', aprobadorJefe: 30}` | `true` | `expect(resultado).toBe(true)` |
| Ver aprobada por otro | `Aprobador Jefe` | `30` | `{estado: 'Aprobada', aprobadorJefe: 40}` | `false` | `expect(resultado).toBe(false)` |

##### Casos Límite

| Prueba | Rol | userId | Solicitud | Resultado Esperado | Control Utilizado |
|--------|-----|--------|-----------|-------------------|-------------------|
| Solicitud null | `Administrador` | `1` | `null` | `false` | `expect(resultado).toBe(false)` |
| Rol null | `null` | `1` | `{id: 1}` | `false` | `expect(resultado).toBe(false)` |
| userId null | `Administrador` | `null` | `{id: 1}` | `false` | `expect(resultado).toBe(false)` |

#### 2.2 Pruebas de `puedeAprobarSolicitud`

##### Rol Administrador

| Prueba | Rol | Monto | Estado | Resultado Esperado | Control Utilizado |
|--------|-----|-------|--------|-------------------|-------------------|
| Aprobar cualquier monto | `Administrador` | `100000` | `Pendiente` | `true` | `expect(resultado).toBe(true)` |
| Aprobar monto alto | `Administrador` | `500000` | `Pendiente` | `true` | `expect(resultado).toBe(true)` |

##### Rol Comprador

| Prueba | Rol | Monto | Estado | Resultado Esperado | Control Utilizado |
|--------|-----|-------|--------|-------------------|-------------------|
| No puede aprobar | `Comprador` | `10000` | `Pendiente` | `false` | `expect(resultado).toBe(false)` |

##### Rol Aprobador Jefe

| Prueba | Rol | Monto | Estado | AprobadorJefe | Resultado Esperado | Control Utilizado |
|--------|-----|-------|--------|---------------|-------------------|-------------------|
| Aprobar < $50,000 | `Aprobador Jefe` | `25000` | `Pendiente` | `null` | `true` | `expect(resultado).toBe(true)` |
| Aprobar >= $50,000 | `Aprobador Jefe` | `75000` | `Pendiente` | `null` | `true` | `expect(resultado).toBe(true)` |
| Ya aprobó | `Aprobador Jefe` | `25000` | `Pendiente` | `30` | `false` | `expect(resultado).toBe(false)` |
| No pendiente | `Aprobador Jefe` | `25000` | `Aprobada` | `null` | `false` | `expect(resultado).toBe(false)` |

##### Rol Aprobador Financiero

| Prueba | Rol | Monto | Estado | AprobadorJefe | Resultado Esperado | Control Utilizado |
|--------|-----|-------|--------|---------------|-------------------|-------------------|
| Aprobar >= $50,000 | `Aprobador Financiero` | `75000` | `Pendiente` | `null` | `true` | `expect(resultado).toBe(true)` |
| No aprobar < $50,000 sin jefe | `Aprobador Financiero` | `25000` | `Pendiente` | `null` | `false` | `expect(resultado).toBe(false)` |
| Aprobar < $50,000 con jefe | `Aprobador Financiero` | `25000` | `Pendiente` | `30` | `true` | `expect(resultado).toBe(true)` |
| Ya aprobó | `Aprobador Financiero` | `75000` | `Pendiente` | `null`, aprobadorFinanciero: 50 | `false` | `expect(resultado).toBe(false)` |

##### Límites de Monto

| Prueba | Monto | Aprobador Jefe | Aprobador Financiero | Control Utilizado |
|--------|-------|----------------|---------------------|-------------------|
| $49,999 | `49999` | `true` | `false` | Verificar ambos resultados |
| $50,000 | `50000` | - | `true` | `expect(resultadoFinanciero).toBe(true)` |
| $100,000 | `100000` | `true` | `true` | Verificar ambos resultados |

**Total de Pruebas**: 25 casos de prueba

### 3. Servicio de Autenticación

**Ubicación**: `src/modules/auth/service.js`

**Objetivo**: Aquí se verificó que el servicio de autenticación valida tokens JWT correctamente.

#### 3.1 Validación de Tokens Válidos

| Prueba | Token | Resultado Esperado | Control Utilizado |
|--------|-------|-------------------|-------------------|
| Token válido | JWT firmado con secret correcto | `{userId: 1, email: 'test@example.com', role: 'Administrador'}` | Verificar propiedades del payload |
| Diferentes roles | Token con rol 'Comprador' | `{role: 'Comprador', userId: 2}` | `expect(resultado.role).toBe('Comprador')` |

#### 3.2 Manejo de Tokens Inválidos

| Prueba | Token | Resultado Esperado | Control Utilizado |
|--------|-------|-------------------|-------------------|
| Firma inválida | JWT con secret incorrecto | Lanza error 'Token inválido' | `expect(() => verifyToken(token)).toThrow()` |
| Token malformado | `'token.malformado.invalido'` | Lanza error 'Token inválido' | `expect(() => verifyToken(token)).toThrow()` |
| Token vacío | `''` | Lanza error 'Token inválido' | `expect(() => verifyToken(token)).toThrow()` |

#### 3.3 Manejo de Tokens Expirados

| Prueba | Token | Resultado Esperado | Control Utilizado |
|--------|-------|-------------------|-------------------|
| Token expirado | JWT con expiresIn: '-1s' | Lanza error 'Token expirado' | `expect(() => verifyToken(token)).toThrow('Token expirado')` |

#### 3.4 Validación de Payload

| Prueba | Payload | Resultado Esperado | Control Utilizado |
|--------|---------|-------------------|-------------------|
| Payload completo | `{userId: 5, email: 'usuario@test.com', role: 'Aprobador Jefe', nombre: 'Usuario Test'}` | Preserva todos los campos | Verificar cada propiedad |

**Total de Pruebas**: 7 casos de prueba

## Resumen de Pruebas

| Módulo | Casos de Prueba | Estado |
|--------|----------------|--------|
| Validador de Contraseñas | 20 | Implementado |
| Sistema de Permisos | 25 | Implementado |
| Servicio de Autenticación | 7 | Implementado |
| **TOTAL** | **52** | **Completado** |

**Nota**: Se ejecutan 53 pruebas en total debido a que una prueba adicional verifica múltiples roles en los límites de monto.

## Cómo Ejecutar las Pruebas

### Instalación de Dependencias

```bash
npm install
```

### Ejecutar Todas las Pruebas

```bash
npm test
```

### Ejecutar Pruebas en Modo Watch

```bash
npm run test:watch
```

### Generar Reporte de Cobertura

```bash
npm run test:coverage
```

El reporte de cobertura se generará en la carpeta `coverage/` con un reporte HTML detallado.

## Controles Utilizados

### Assertions de Jest

- `expect(value).toBe(expected)`: Comparación estricta (===)
- `expect(value).toContain(substring)`: Verifica que un string contenga un substring
- `expect(value).toHaveProperty(prop)`: Verifica que un objeto tenga una propiedad
- `expect(() => function()).toThrow(message)`: Verifica que una función lance un error

### Estructura de Pruebas

Cada suite de pruebas utiliza:
- `describe()`: Agrupa pruebas relacionadas
- `test()` o `it()`: Define un caso de prueba individual
- `expect()`: Realiza las aserciones

## Resultados Esperados

Al ejecutar las pruebas, se espera que:

1. Todas las pruebas pasen correctamente (53 de 53 pruebas ejecutadas)
2. La cobertura de código sea mayor al 80% en los módulos críticos
3. No existan errores de sintaxis o lógica en las pruebas
4. El tiempo de ejecución sea menor a 5 segundos

## Evidencia de Pruebas

Las pruebas se ejecutan automáticamente y generan los siguientes reportes:

1. Reporte en consola con resultados detallados de cada prueba ejecutada
2. Reporte de cobertura en formato HTML que muestra qué líneas de código fueron probadas
3. Logs de cada prueba ejecutada con información sobre el tiempo de ejecución

Para generar y ver la evidencia visual de las pruebas, se debe ejecutar el siguiente comando:

```bash
npm run test:coverage
```

Posteriormente, se puede abrir el archivo `coverage/lcov-report/index.html` en el navegador para ver el reporte detallado de cobertura de código.

## Conclusión

Las pruebas de unidad que se implementaron cubren los módulos críticos del sistema de proveeduría. Se validaron los siguientes aspectos:

- La validación de contraseñas seguras según los requisitos de seguridad establecidos
- El control de acceso basado en roles de usuario
- Los permisos de aprobación según los montos de las solicitudes
- La validación de tokens JWT para la autenticación

Todas las pruebas están documentadas de manera clara, son reproducibles en cualquier entorno que tenga las dependencias instaladas, y proporcionan una cobertura adecuada de los casos de uso principales y casos límite del sistema. Esto garantiza que los módulos probados funcionen correctamente antes de ser integrados con el resto del sistema.

