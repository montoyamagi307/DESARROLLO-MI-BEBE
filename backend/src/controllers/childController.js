// ============================================================================
// VITACHRONICLE - CONTROLADOR DE PERFILES INFANTILES
// ARCHIVO: backend/src/controllers/childController.js
// ============================================================================

const childService = require('../services/childService');

async function getChildren(req, res, next) {
  try {
    const familyId = req.query.familyId || 'f0000001-0000-0000-0000-000000000001';
    const children = await childService.getChildrenByFamily(familyId);
    return res.json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (err) {
    next(err);
  }
}

async function getChildById(req, res, next) {
  try {
    const { id } = req.params;
    const child = await childService.getChildById(id);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: `Perfil infantil con id ${id} no encontrado.`
      });
    }
    return res.json({
      success: true,
      data: child
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChildren,
  getChildById
};
