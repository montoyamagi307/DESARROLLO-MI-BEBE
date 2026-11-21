// ============================================================================
// VITACHRONICLE - SERVIDOR HTTP PRINCIPAL
// ARCHIVO: backend/src/server.js
// ============================================================================

const fs = require('fs');
const app = require('./app');
const config = require('./config/env');

// Asegurar existencia de directorios de uploads en producción/Render
try {
  if (!fs.existsSync(config.storage.baseDir)) {
    fs.mkdirSync(config.storage.baseDir, { recursive: true });
  }
  if (!fs.existsSync(config.storage.pdfDir)) {
    fs.mkdirSync(config.storage.pdfDir, { recursive: true });
  }
} catch (err) {
  console.warn('[STORAGE] Aviso al inicializar directorios:', err.message);
}

const server = app.listen(config.port, () => {
  console.log('================================================================');
  console.log(`🌟 VitaChronicle API iniciada en el puerto ${config.port}`);
  console.log(`📡 URL Base: http://localhost:${config.port}/api`);
  console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`🌍 Entorno: ${config.env}`);
  console.log('================================================================');
});

// Manejo elegante de cierre
process.on('SIGTERM', () => {
  console.log('Señal SIGTERM recibida. Cerrando servidor HTTP...');
  server.close(() => {
    console.log('Servidor finalizado limpiamente.');
    process.exit(0);
  });
});

module.exports = server;
