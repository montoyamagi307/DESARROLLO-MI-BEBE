// ============================================================================
// VITACHRONICLE - SERVICIO DE CAPÍTULOS Y PREGUNTAS DEL DESARROLLO
// ARCHIVO: backend/src/services/questionService.js
// ============================================================================

const db = require('../database/db');

/**
 * Obtiene la lista completa de los 15 capítulos del libro
 */
async function getAllChapters() {
  const sql = `
    SELECT id, chapter_number, stage_id, title, subtitle, introductory_quote, introductory_text, sort_order
    FROM chapters
    ORDER BY sort_order ASC
  `;
  const result = await db.query(sql);
  return result.rows;
}

/**
 * Obtiene las preguntas asociadas a un capítulo específico con sus opciones
 * @param {number} chapterId
 */
async function getQuestionsByChapter(chapterId) {
  // Si estamos en modo PostgreSQL real
  if (db.isPostgresAvailable()) {
    const questionsSql = `
      SELECT q.id, q.chapter_id, q.area_id, da.name AS area_name, q.question_code,
             q.question_text, q.objective, q.response_type, q.is_clinical,
             q.pediatric_alert_guidance, q.scientific_reference, q.help_text, q.sort_order
      FROM questions q
      JOIN development_areas da ON q.area_id = da.id
      WHERE q.chapter_id = $1 AND q.is_active = TRUE
      ORDER BY q.sort_order ASC
    `;
    const questionsResult = await db.query(questionsSql, [chapterId]);

    const optionsSql = `
      SELECT id, question_id, label, value, sort_order
      FROM question_options
      ORDER BY sort_order ASC
    `;
    const optionsResult = await db.query(optionsSql);
    const optionsByQ = {};
    for (const opt of optionsResult.rows) {
      if (!optionsByQ[opt.question_id]) optionsByQ[opt.question_id] = [];
      optionsByQ[opt.question_id].push({ label: opt.label, value: opt.value });
    }

    return questionsResult.rows.map(q => ({
      ...q,
      options: optionsByQ[q.id] || []
    }));
  }

  // Fallback para modo memoria
  const questions = db.memoryStore.questions.filter(q => q.chapter_id === parseInt(chapterId, 10));
  return questions;
}

/**
 * Obtiene una pregunta individual por ID
 */
async function getQuestionById(questionId) {
  if (db.isPostgresAvailable()) {
    const sql = `
      SELECT id, chapter_id, area_id, question_code, question_text, objective,
             response_type, is_clinical, pediatric_alert_guidance, scientific_reference, help_text
      FROM questions
      WHERE id = $1
      LIMIT 1
    `;
    const result = await db.query(sql, [questionId]);
    return result.rows[0] || null;
  }

  return db.memoryStore.questions.find(q => q.id === questionId) || null;
}

module.exports = {
  getAllChapters,
  getQuestionsByChapter,
  getQuestionById
};
