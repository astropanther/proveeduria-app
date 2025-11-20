# Guía de Trabajo con Git y GitHub

Esta guía les va a ayudar a trabajar en el proyecto. Sigan estos pasos desde que clonan el repo hasta que crean un Pull Request para que yo lo revise.

## Paso 1: Clonar el Repositorio (Solo la primera vez)

Si es la primera vez que trabajan en el proyecto, hagan esto:

```bash
# Clonar el repositorio
git clone https://github.com/astropanther/proveeduria-app.git

# Entrar a la carpeta del proyecto
cd proveeduria-app

# Instalar dependencias del backend
npm install

# Si van a trabajar en frontend, también instalen esas dependencias
cd frontend
npm install
cd ..
```

## Paso 2: Crear su Branch de Trabajo

**MUY IMPORTANTE:** Siempre trabajen en una branch nueva, nunca directamente en `main`. Si trabajan en `main` pueden romper el código de los demás.

```bash
# Asegúrense de estar en la carpeta del proyecto
cd proveeduria-app

# Actualizar main con los últimos cambios
git checkout main
git pull origin main

# Crear su branch nueva (reemplacen PB-XX con su número de story de JIRA)
git checkout -b feature/PB-XX-nombre-corto

# Ejemplos:
# git checkout -b feature/PB-10-crear-solicitudes
# git checkout -b feature/PB-13-notificaciones
```

## Paso 3: Trabajar en su Parte

Ahora sí, trabajen en lo que les toca:
- Editen los archivos que necesiten
- Prueben que todo funcione
- Guarden sus cambios normalmente

## Paso 4: Ver qué Cambios Hicieron

Antes de hacer commit, vean qué archivos modificaron:

```bash
git status
```

Esto les va a mostrar todos los archivos que cambiaron.

## Paso 5: Agregar sus Cambios

Agreguen los archivos que quieren incluir en el commit:

```bash
# Agregar todos los archivos modificados (lo más fácil)
git add .

# O si quieren agregar archivos específicos
git add src/modules/solicitudes/controller.js
git add src/modules/solicitudes/routes.js
```

## Paso 6: Hacer Commit con Mensaje que Conecte con JIRA

**IMPORTANTE:** El mensaje del commit DEBE incluir el número de su story de JIRA. Esto es para que yo pueda rastrear qué trabajo corresponde a qué story.

```bash
git commit -m "PB-XX: Descripción corta de lo que hicieron"

# Ejemplos:
# git commit -m "PB-10: Crear endpoint para crear solicitudes de compra"
# git commit -m "PB-11: Implementar aprobación y rechazo de solicitudes"
# git commit -m "PB-13: Configurar envío de notificaciones por email"
```

**Formato del mensaje:**
- Empiecen con `PB-XX:` (donde XX es su número de story)
- Sigan con una descripción corta y clara de lo que hicieron
- Pueden agregar más líneas si necesitan más detalle

## Paso 7: Subir sus Cambios a GitHub

```bash
# La primera vez que suben su branch
git push -u origin feature/PB-XX-nombre-corto

# Las siguientes veces (si hacen más commits en la misma branch)
git push
```

## Paso 8: Crear Pull Request (PR) en GitHub

Esto es lo que necesito para revisar su trabajo:

1. **Vayan a GitHub:**
   - Abran su navegador y vayan a: https://github.com/astropanther/proveeduria-app

2. **Verán un mensaje amarillo arriba:**
   - Dice algo como "feature/PB-XX-nombre-corto had recent pushes"
   - Hagan clic en el botón verde "Compare & pull request"

3. **O si no ven el mensaje, háganlo manualmente:**
   - Hagan clic en "Pull requests" (arriba en el menú)
   - Hagan clic en "New pull request"
   - En "base:" seleccionen `main`
   - En "compare:" seleccionen su branch `feature/PB-XX-nombre-corto`

4. **Completen el formulario del PR:**
   - **Título:** `PB-XX: Nombre de su Story`
     - Ejemplo: `PB-10: Crear Solicitud de Compra`
   
   - **Descripción (esto me ayuda a entender qué hicieron):**
     ```
     ## PB-XX: Nombre de su Story
     
     Descripción de lo que implementaron.
     
     ### Cambios realizados:
     - Cambio 1
     - Cambio 2
     - Cambio 3
     
     ### Testing:
     - Probar endpoint X
     - Probar validación Y
     ```

5. **Hagan clic en "Create pull request"**

## Paso 9: Esperar mi Revisión

- Yo voy a revisar su PR
- Si hay algo que necesite cambio, se los voy a pedir
- Una vez que esté todo bien, yo hago el merge a `main`

## Comandos Útiles

### Ver el estado de sus cambios
```bash
git status
```

### Ver qué cambió en un archivo específico
```bash
git diff nombre-del-archivo.js
```

### Deshacer cambios que NO han agregado (git add)
```bash
git restore nombre-del-archivo.js
```

### Actualizar su branch con cambios de main
```bash
git checkout main
git pull origin main
git checkout feature/PB-XX-su-branch
git merge main
```

### Ver sus commits
```bash
git log --oneline
```

## Errores Comunes y Soluciones

### "fatal: not a git repository"
- **Solución:** Asegúrense de estar en la carpeta `proveeduria-app`

### "error: failed to push"
- **Solución:** Asegúrense de haber hecho `git push -u origin feature/PB-XX-su-branch` la primera vez

### "Your branch is behind 'origin/main'"
- **Solución:** Actualicen su branch (ver comando arriba en "Actualizar su branch")

### "Please commit your changes or stash them"
- **Solución:** Tienen cambios sin guardar. Hagan commit o descarten los cambios con `git restore .`

## Recordatorios Importantes

✅ **SIEMPRE** trabajen en una branch nueva, nunca en `main`  
✅ **SIEMPRE** incluyan `PB-XX:` en el mensaje del commit (esto es el codigo que aparece en JIRA de su story)  
✅ **SIEMPRE** creen un PR (Pull Request) para que yo lo revise  
✅ **SIEMPRE** prueben su código antes de hacer commit  
✅ **NUNCA** hagan commit de archivos `.env` o `node_modules`

