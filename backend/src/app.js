// ============================================================================
// VITACHRONICLE - CONFIGURACIÓN DE LA APLICACIÓN EXPRESS
// ARCHIVO: backend/src/app.js
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const apiRoutes = require('./routes');

const app = express();

// 1. Middlewares de Seguridad y Cabeceras
app.use(helmet({
  contentSecurityPolicy: false // Permite previsualizar PDFs embebidos en el frontend
}));

// 2. Habilitar CORS para el cliente React
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// 3. Parseo de Cuerpos JSON y URL-Encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Logger de Peticiones en Desarrollo
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// 5. Directorio estático para descarga de PDFs
app.use('/uploads', express.static(config.storage.baseDir));

// 6. Montar Rutas de la API
app.use('/api', apiRoutes);

// 7. Servir la aplicación web interactiva en la raíz
const frontendDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'standalone-preview.html'));
});

// 8. Manejo de Rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// 8. Middleware Central de Control de Errores (500)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Error interno del servidor.',
    ...(config.env === 'development' ? { stack: err.stack } : {})
  });
});

module.exports = app;
