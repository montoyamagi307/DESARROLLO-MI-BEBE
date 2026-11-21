// ============================================================================
// VITACHRONICLE - CONFIGURACIÓN CENTRALIZADA DE ENTORNO
// ARCHIVO: backend/src/config/env.js
// ============================================================================

const path = require('path');
const dotenv = require('dotenv');

// Cargar .env si existe
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Soporte y parseo inteligente de DATABASE_URL si está presente
let dbFromUrl = {};
if (process.env.DATABASE_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    dbFromUrl = {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: parsed.searchParams.get('sslmode') === 'require'
    };
  } catch (err) {
    // Si la URL no sigue formato estándar URL, continúa con variables individuales
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  db: {
    host: process.env.DB_HOST || dbFromUrl.host || 'localhost',
    port: parseInt(process.env.DB_PORT || dbFromUrl.port || '5432', 10),
    database: process.env.DB_NAME || dbFromUrl.database || 'vitachronicle_db',
    user: process.env.DB_USER || dbFromUrl.user || 'vitadev',
    password: process.env.DB_PASSWORD || dbFromUrl.password || 'vitasecret2026',
    ssl: (process.env.DB_SSL === 'true' || dbFromUrl.ssl === true) ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: 30000,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'vitachronicle_dev_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  storage: {
    baseDir: path.resolve(__dirname, '../../', process.env.STORAGE_DIR || './uploads'),
    pdfDir: path.resolve(__dirname, '../../', process.env.PDF_OUTPUT_DIR || './uploads/books'),
    maxFileSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '15', 10),
  }
};

module.exports = config;
