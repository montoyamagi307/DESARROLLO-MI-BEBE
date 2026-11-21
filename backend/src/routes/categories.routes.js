// ============================================================================
// VITACHRONICLE - RUTAS DE CATEGORÍAS (ÁREAS DEL DESARROLLO)
// ARCHIVO: backend/src/routes/categories.routes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Listar categorías (con conteo de preguntas)
router.get('/', categoryController.getCategories);

// Detalle de una categoría con sus preguntas
router.get('/:id', categoryController.getCategoryById);

// Crear nueva categoría
router.post('/', categoryController.createCategory);

// Editar categoría
router.put('/:id', categoryController.updateCategory);

// Eliminar categoría
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
