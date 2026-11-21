// ============================================================================
// VITACHRONICLE - CONTROLADOR DE CATEGORÍAS (ÁREAS DEL DESARROLLO)
// ARCHIVO: backend/src/controllers/categoryController.js
// ============================================================================

const categoryService = require('../services/categoryService');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    return res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada.' });
    }
    return res.json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { code, name, description, icon_name } = req.body;
    const created = await categoryService.createCategory({ code, name, description, icon_name });
    return res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente.',
      data: created
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, description, icon_name } = req.body;
    const updated = await categoryService.updateCategory(id, { code, name, description, icon_name });
    return res.json({
      success: true,
      message: 'Categoría actualizada exitosamente.',
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
    return res.json({
      success: true,
      message: 'Categoría eliminada exitosamente.',
      data: result.deleted
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
