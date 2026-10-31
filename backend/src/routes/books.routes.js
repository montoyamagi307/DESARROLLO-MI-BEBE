// ============================================================================
// VITACHRONICLE - RUTAS DE GENERACIÓN DE LIBRO EDITORIAL
// ARCHIVO: backend/src/routes/books.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// POST /api/books/generate/:childId/:chapterId - Compilar y generar PDF
router.post('/generate/:childId/:chapterId', bookController.generateChapterPdf);

// GET /api/books/download/:filename - Descarga directa del archivo PDF
router.get('/download/:filename', bookController.downloadPdf);

module.exports = router;
