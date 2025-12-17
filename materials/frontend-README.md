# ProcureHub - Frontend

Interfaz de usuario del sistema ProcureHub desarrollada con React y TypeScript.

## Instalación

Instala las dependencias del proyecto:

```bash
npm install
```

## Ejecución en Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Construcción para Producción

Genera la versión optimizada para producción:

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `build`.

## Notas

- El frontend se conecta al backend mediante un proxy configurado en Vite
- Las llamadas a la API se hacen a través de `/api` que se redirige automáticamente a `http://localhost:3000`
- El token de autenticación se almacena en localStorage del navegador
