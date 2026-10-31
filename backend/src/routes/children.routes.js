// ============================================================================
// VITACHRONICLE - RUTAS DE PERFILES INFANTILES
// ARCHIVO: backend/src/routes/children.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');

// GET /api/children - Listar perfiles infantiles de la familia
router.get('/', childController.getChildren);

// GET /api/children/:id - Detalle de un perfil infantil con cálculo de edad
router.get('/:id', childController.getChildById);

module.exports = router;
