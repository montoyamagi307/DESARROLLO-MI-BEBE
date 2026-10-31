// ============================================================================
// VITACHRONICLE - RUTAS DE RESPUESTAS Y CUESTIONARIOS
// ARCHIVO: backend/src/routes/responses.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');

// GET /api/responses/children/:childId/chapters/:chapterId - Respuestas y progreso de un capítulo
router.get('/children/:childId/chapters/:chapterId', responseController.getChapterResponses);

// POST /api/responses/children/:childId/questions/:questionId - Guardar o editar respuesta con versión
router.post('/children/:childId/questions/:questionId', responseController.saveResponse);

module.exports = router;
