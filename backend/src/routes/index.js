// ============================================================================
// VITACHRONICLE - ÍNDICE CENTRAL DE RUTAS DE LA API
// ARCHIVO: backend/src/routes/index.js
// ============================================================================

const express = require('express');
const router = express.Router();

const childrenRoutes = require('./children.routes');
const questionsRoutes = require('./questions.routes');
const responsesRoutes = require('./responses.routes');
const booksRoutes = require('./books.routes');

// Health Check
router.get('/health', (req, res) => {
  const db = require('../database/db');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    postgresConnected: db.isPostgresAvailable(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Montar sub-rutas
router.use('/children', childrenRoutes);
router.use('/', questionsRoutes);
router.use('/responses', responsesRoutes);
router.use('/books', booksRoutes);

module.exports = router;
