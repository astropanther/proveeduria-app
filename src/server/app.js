import express from 'express';
import router from './routes.js';

const app = express();

// Parsear JSON
app.use(express.json({ strict: false }));

// Montar todas las rutas PRIMERO
app.use('/', router);

// Middleware para manejar errores de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    req.body = {};
    return next();
  }
  next(err);
});

// Middleware para manejar errores (4 parámetros = error handler)
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor' 
  });
});

// Middleware para manejar rutas no encontradas (al final, sin next)
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

export default app;
