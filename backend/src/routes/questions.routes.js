// ============================================================================
// VITACHRONICLE - RUTAS DE CAPÍTULOS Y PREGUNTAS (CRUD)
// ARCHIVO: backend/src/routes/questions.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Capítulos
router.get('/chapters', questionController.getChapters);
router.get('/chapters/:chapterId/questions', questionController.getQuestionsByChapter);

// CRUD de Preguntas
router.get('/questions', questionController.getAllQuestions);
router.get('/questions/:id', questionController.getQuestionById);
router.post('/questions', questionController.createQuestion);
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);

module.exports = router;
