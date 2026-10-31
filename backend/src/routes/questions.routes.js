// ============================================================================
// VITACHRONICLE - RUTAS DE CAPÍTULOS Y PREGUNTAS
// ARCHIVO: backend/src/routes/questions.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// GET /api/chapters - Listar todos los capítulos
router.get('/chapters', questionController.getChapters);

// GET /api/chapters/:chapterId/questions - Obtener preguntas del capítulo con opciones y referencias
router.get('/chapters/:chapterId/questions', questionController.getQuestionsByChapter);

module.exports = router;
