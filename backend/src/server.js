// ============================================================================
// VITACHRONICLE - SERVIDOR HTTP PRINCIPAL
// ARCHIVO: backend/src/server.js
// ============================================================================

const app = require('./app');
const config = require('./config/env');

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
