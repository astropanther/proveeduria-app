import express from 'express';
import router from './routes.js';

const app = express();

// Parsear JSON con manejo de errores
app.use(express.json({ 
  strict: false 
}));

// Middleware para manejar errores de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    // Si hay error de parsing JSON, continuar con body vacío
    req.body = {};
    return next();
  }
  next(err);
});

app.use('/', router);

export default app;
