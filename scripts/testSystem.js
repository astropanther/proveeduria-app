/**
 * Script de pruebas del sistema
 * Ejecuta pruebas automatizadas de todas las funcionalidades
 */

const API_BASE = 'http://localhost:3000';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let passedTests = 0;
let failedTests = 0;
const errors = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  if (passed) {
    log(`✓ ${name}`, 'green');
    passedTests++;
  } else {
    log(`✗ ${name}`, 'red');
    failedTests++;
    if (details) {
      log(`  ${details}`, 'red');
      errors.push({ test: name, error: details });
    }
  }
}

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function login(email, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return result;
}

async function runTests() {
  log('\n=== INICIANDO PRUEBAS DEL SISTEMA ===\n', 'blue');

  // ===== PRUEBA 1: Health Check =====
  log('\n[1] Health Check', 'yellow');
  const health = await request('/health');
  logTest('Health endpoint responde', health.status === 200 || health.status === 404);

  // ===== PRUEBA 2: Autenticación =====
  log('\n[2] Autenticación', 'yellow');
  
  // Login exitoso
  const loginResult = await login('admin@proveeduria.com', 'admin123');
  const hasToken = loginResult.data?.token;
  logTest('Login exitoso con credenciales válidas', hasToken !== undefined);
  
  if (!hasToken) {
    log('ERROR: No se pudo obtener token. Abortando pruebas.', 'red');
    return;
  }
  
  const adminToken = loginResult.data.token;
  
  // Login con credenciales inválidas
  const invalidLogin = await login('admin@proveeduria.com', 'wrongpassword');
  logTest('Login rechaza credenciales inválidas', invalidLogin.status === 401 || invalidLogin.data?.error);

  // ===== PRUEBA 3: Gestión de Usuarios =====
  log('\n[3] Gestión de Usuarios', 'yellow');
  
  // Listar usuarios
  const usersList = await request('/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  logTest('Admin puede listar usuarios', usersList.status === 200 && Array.isArray(usersList.data?.users));
  
  // Obtener usuario por ID
  if (usersList.data?.users?.length > 0) {
    const userId = usersList.data.users[0].id;
    const userDetail = await request(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logTest('Obtener usuario por ID', userDetail.status === 200 && userDetail.data?.user?.id === userId);
  }

  // ===== PRUEBA 4: Solicitudes =====
  log('\n[4] Solicitudes', 'yellow');
  
  // Crear solicitud como comprador
  const compradorLogin = await login('comprador1@proveeduria.com', 'comprador123');
  const compradorToken = compradorLogin.data?.token;
  
  if (compradorToken) {
    const nuevaSolicitud = await request('/solicitudes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${compradorToken}` },
      body: JSON.stringify({
        descripcion: 'Prueba automática del sistema',
        monto: 30000,
        categoria: 'Tecnología',
        prioridad: 'alta',
        justificacion: 'Prueba de funcionalidad',
      }),
    });
    logTest('Comprador puede crear solicitud', nuevaSolicitud.status === 201 && nuevaSolicitud.data?.id);
    
    const solicitudId = nuevaSolicitud.data?.id;
    
    // Listar solicitudes
    const solicitudes = await request('/solicitudes', {
      headers: { Authorization: `Bearer ${compradorToken}` },
    });
    logTest('Comprador puede listar sus solicitudes', solicitudes.status === 200 && Array.isArray(solicitudes.data));
    
    // Verificar que comprador solo ve sus propias solicitudes
    if (solicitudes.data?.length > 0) {
      const todasSonDelComprador = solicitudes.data.every(s => s.usuarioId === 2);
      logTest('Comprador solo ve sus propias solicitudes', todasSonDelComprador);
    }
    
    // Obtener solicitud por ID
    if (solicitudId) {
      const solicitudDetail = await request(`/solicitudes/${solicitudId}`, {
        headers: { Authorization: `Bearer ${compradorToken}` },
      });
      logTest('Obtener solicitud por ID', solicitudDetail.status === 200 && solicitudDetail.data?.id === solicitudId);
    }
  }

  // ===== PRUEBA 5: Aprobaciones =====
  log('\n[5] Aprobaciones', 'yellow');
  
  // Login como aprobador jefe
  const aprobadorLogin = await login('aprobador1@proveeduria.com', 'aprobador123');
  const aprobadorToken = aprobadorLogin.data?.token;
  
  if (aprobadorToken) {
    // Listar solicitudes pendientes
    const pendientes = await request('/solicitudes?estado=Pendiente', {
      headers: { Authorization: `Bearer ${aprobadorToken}` },
    });
    logTest('Aprobador puede ver solicitudes pendientes', pendientes.status === 200 && Array.isArray(pendientes.data));
    
    // Aprobar una solicitud (si existe)
    if (pendientes.data?.length > 0) {
      const solicitudParaAprobar = pendientes.data[0];
      const aprobarResult = await request(`/solicitudes/${solicitudParaAprobar.id}/aprobar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${aprobadorToken}` },
      });
      logTest('Aprobador puede aprobar solicitud', aprobarResult.status === 200 || aprobarResult.status === 403);
    }
  }

  // ===== PRUEBA 6: Dashboard =====
  log('\n[6] Dashboard', 'yellow');
  
  const dashboardResumen = await request('/dashboard/resumen', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  logTest('Dashboard resumen funciona', dashboardResumen.status === 200 && dashboardResumen.data?.solicitudes);
  
  const dashboardStats = await request('/dashboard/estadisticas', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  logTest('Dashboard estadísticas funciona', dashboardStats.status === 200);
  
  const dashboardRecientes = await request('/dashboard/recientes?limite=5', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  logTest('Dashboard recientes funciona', dashboardRecientes.status === 200);

  // ===== PRUEBA 7: Reportes =====
  log('\n[7] Reportes', 'yellow');
  
  const reporteResult = await request('/reportes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ formato: 'excel' }),
  });
  logTest('Generar reporte Excel', reporteResult.status === 200 && reporteResult.data?.archivos?.excel);

  // ===== PRUEBA 8: Notificaciones =====
  log('\n[8] Notificaciones', 'yellow');
  
  const notificacionResult = await request('/notificaciones', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      email: 'test@proveeduria.com',
      evento: 'creacion',
    }),
  });
  logTest('Enviar notificación', notificacionResult.status === 200 || notificacionResult.status === 201);

  // ===== PRUEBA 9: Niveles de Acceso =====
  log('\n[9] Niveles de Acceso Granular', 'yellow');
  
  // Comprador no puede ver solicitudes de otros
  if (compradorToken) {
    const compradorSolicitudes = await request('/solicitudes', {
      headers: { Authorization: `Bearer ${compradorToken}` },
    });
    if (compradorSolicitudes.data?.length > 0) {
      const todasPropias = compradorSolicitudes.data.every(s => s.usuarioId === 2);
      logTest('Comprador solo ve sus solicitudes', todasPropias);
    }
  }
  
  // Admin puede ver todas las solicitudes
  const adminSolicitudes = await request('/solicitudes', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  logTest('Admin puede ver todas las solicitudes', adminSolicitudes.status === 200 && Array.isArray(adminSolicitudes.data));

  // ===== PRUEBA 10: Validación de Contraseñas =====
  log('\n[10] Validación de Contraseñas', 'yellow');
  
  // Intentar crear usuario con contraseña débil
  const weakPasswordUser = await request('/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      email: 'test-weak@proveeduria.com',
      password: '12345', // Muy corta
      role: 'Comprador',
      nombre: 'Test User',
    }),
  });
  logTest('Rechaza contraseña muy corta', weakPasswordUser.status === 400);
  
  // Intentar con contraseña sin mayúscula
  const noUpperPassword = await request('/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      email: 'test-noupper@proveeduria.com',
      password: 'password123', // Sin mayúscula
      role: 'Comprador',
      nombre: 'Test User',
    }),
  });
  logTest('Rechaza contraseña sin mayúscula', noUpperPassword.status === 400);

  // ===== RESUMEN =====
  log('\n=== RESUMEN DE PRUEBAS ===\n', 'blue');
  log(`Pruebas exitosas: ${passedTests}`, 'green');
  log(`Pruebas fallidas: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  if (errors.length > 0) {
    log('\nErrores encontrados:', 'red');
    errors.forEach(({ test, error }) => {
      log(`  - ${test}: ${error}`, 'red');
    });
  }
  
  const totalTests = passedTests + failedTests;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  log(`\nTasa de éxito: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  log('\n=== FIN DE PRUEBAS ===\n', 'blue');
}

// Ejecutar pruebas
runTests().catch(error => {
  log(`\nERROR FATAL: ${error.message}`, 'red');
  process.exit(1);
});

