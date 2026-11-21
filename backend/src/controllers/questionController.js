// ============================================================================
// VITACHRONICLE - CONTROLADOR DE CAPÍTULOS Y PREGUNTAS (CRUD)
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

async function getAllQuestions(req, res, next) {
  try {
    const { areaId, chapterId, search } = req.query;
    const questions = await questionService.getAllQuestions({ areaId, chapterId, search });
    return res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    next(err);
  }
}

async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionById(id);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });
    }
    return res.json({
      success: true,
      data: question
    });
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const created = await questionService.createQuestion(req.body);
    return res.status(201).json({
      success: true,
      message: 'Pregunta creada exitosamente.',
      data: created
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await questionService.updateQuestion(id, req.body);
    return res.json({
      success: true,
      message: 'Pregunta actualizada exitosamente.',
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const result = await questionService.deleteQuestion(id);
    return res.json({
      success: true,
      message: 'Pregunta eliminada exitosamente.',
      data: result.deleted
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getChapters,
  getQuestionsByChapter,
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
