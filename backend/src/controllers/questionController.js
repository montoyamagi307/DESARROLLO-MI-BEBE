// ============================================================================
// VITACHRONICLE - CONTROLADOR DE CAPÍTULOS Y PREGUNTAS
// ARCHIVO: backend/src/controllers/questionController.js
// ============================================================================

const questionService = require('../services/questionService');

async function getChapters(req, res, next) {
  try {
    const chapters = await questionService.getAllChapters();
    return res.json({
      success: true,
      data: chapters
    });
  } catch (err) {
    next(err);
  }
}

async function getQuestionsByChapter(req, res, next) {
  try {
    const { chapterId } = req.params;
    const questions = await questionService.getQuestionsByChapter(chapterId);
    return res.json({
      success: true,
      chapterId: parseInt(chapterId, 10),
      count: questions.length,
      data: questions
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChapters,
  getQuestionsByChapter
};
