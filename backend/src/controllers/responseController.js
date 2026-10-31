// ============================================================================
// VITACHRONICLE - CONTROLADOR DE RESPUESTAS Y PROGRESO DEL CUESTIONARIO
// ARCHIVO: backend/src/controllers/responseController.js
// ============================================================================

const responseService = require('../services/responseService');

async function getChapterResponses(req, res, next) {
  try {
    const { childId, chapterId } = req.params;
    const progress = await responseService.getResponsesForChildAndChapter(childId, chapterId);
    return res.json({
      success: true,
      childId,
      chapterId: parseInt(chapterId, 10),
      data: progress
    });
  } catch (err) {
    next(err);
  }
}

async function saveResponse(req, res, next) {
  try {
    const { childId, questionId } = req.params;
    const { payload, editReason } = req.body;
    const userId = req.user?.id || 'u0000001-0000-0000-0000-000000000001';

    const result = await responseService.saveResponse({
      childId,
      questionId,
      payload,
      userId,
      editReason
    });

    return res.status(result.status === 'created' ? 201 : 200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  getChapterResponses,
  saveResponse
};
