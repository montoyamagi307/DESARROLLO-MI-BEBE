// ============================================================================
// VITACHRONICLE - SERVICIO DE CAPÍTULOS Y PREGUNTAS DEL DESARROLLO (CRUD)
// ARCHIVO: backend/src/services/questionService.js
// ============================================================================

const db = require('../database/db');
const { randomUUID } = require('crypto');

/**
 * Obtiene la lista completa de los capítulos del libro
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
 * Obtiene todas las preguntas con opciones y detalles de su área/categoría
 * Admite filtros opcionales por areaId, chapterId y búsqueda por texto
 */
async function getAllQuestions({ areaId, chapterId, search } = {}) {
  if (db.isPostgresAvailable()) {
    let whereClauses = ['q.is_active = TRUE'];
    let params = [];

    if (areaId) {
      params.push(parseInt(areaId, 10));
      whereClauses.push(`q.area_id = $${params.length}`);
    }

    if (chapterId) {
      params.push(parseInt(chapterId, 10));
      whereClauses.push(`q.chapter_id = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      whereClauses.push(`(q.question_text ILIKE $${params.length} OR q.objective ILIKE $${params.length} OR q.question_code ILIKE $${params.length})`);
    }

    const sql = `
      SELECT q.id, q.chapter_id, q.area_id, da.name AS area_name, da.icon_name AS area_icon,
             c.title AS chapter_title, q.question_code, q.question_text, q.objective,
             q.response_type, q.is_clinical, q.pediatric_alert_guidance,
             q.scientific_reference, q.help_text, q.sort_order, q.created_at
      FROM questions q
      JOIN development_areas da ON q.area_id = da.id
      LEFT JOIN chapters c ON q.chapter_id = c.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY da.id ASC, q.sort_order ASC, q.created_at ASC
    `;
    const res = await db.query(sql, params);

    // Obtener las opciones para todas las preguntas
    const optionsSql = `
      SELECT id, question_id, label, value, sort_order
      FROM question_options
      ORDER BY sort_order ASC
    `;
    const optionsResult = await db.query(optionsSql);
    const optionsByQ = {};
    for (const opt of optionsResult.rows) {
      if (!optionsByQ[opt.question_id]) optionsByQ[opt.question_id] = [];
      optionsByQ[opt.question_id].push({ id: opt.id, label: opt.label, value: opt.value, sort_order: opt.sort_order });
    }

    return res.rows.map(q => ({
      ...q,
      options: optionsByQ[q.id] || []
    }));
  }

  // Fallback en memoria
  let list = db.memoryStore.questions || [];
  if (areaId) list = list.filter(q => q.area_id === parseInt(areaId, 10));
  if (chapterId) list = list.filter(q => q.chapter_id === parseInt(chapterId, 10));
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(q => (q.question_text || '').toLowerCase().includes(s) || (q.question_code || '').toLowerCase().includes(s));
  }
  return list;
}

/**
 * Obtiene las preguntas asociadas a un capítulo específico
 */
async function getQuestionsByChapter(chapterId) {
  return getAllQuestions({ chapterId });
}

/**
 * Obtiene una pregunta individual por ID con sus opciones
 */
async function getQuestionById(questionId) {
  if (db.isPostgresAvailable()) {
    const sql = `
      SELECT q.id, q.chapter_id, q.area_id, da.name AS area_name, da.icon_name AS area_icon,
             q.question_code, q.question_text, q.objective, q.response_type, q.is_clinical,
             q.pediatric_alert_guidance, q.scientific_reference, q.help_text, q.sort_order
      FROM questions q
      JOIN development_areas da ON q.area_id = da.id
      WHERE q.id = $1
      LIMIT 1
    `;
    const result = await db.query(sql, [questionId]);
    if (result.rows.length === 0) return null;

    const optionsSql = `
      SELECT id, question_id, label, value, sort_order
      FROM question_options
      WHERE question_id = $1
      ORDER BY sort_order ASC
    `;
    const optRes = await db.query(optionsSql, [questionId]);

    return {
      ...result.rows[0],
      options: optRes.rows
    };
  }

  return (db.memoryStore.questions || []).find(q => q.id === questionId) || null;
}

/**
 * Crea una nueva pregunta con opciones normalizadas
 */
async function createQuestion(data) {
  const {
    area_id,
    chapter_id = 1,
    question_text,
    objective,
    response_type = 'open_text',
    is_clinical = false,
    pediatric_alert_guidance = null,
    scientific_reference = null,
    help_text = null,
    sort_order = 1,
    options = []
  } = data;

  if (!area_id) throw new Error('El ID de la categoría (area_id) es obligatorio.');
  if (!question_text || question_text.trim() === '') throw new Error('El texto de la pregunta es obligatorio.');

  const questionId = data.id || randomUUID();
  const areaIdNum = parseInt(area_id, 10);
  const chapterIdNum = parseInt(chapter_id, 10);
  const code = data.question_code && data.question_code.trim() !== ''
    ? data.question_code.trim()
    : `Q-A${areaIdNum}-${Date.now().toString().slice(-6)}`;

  if (db.isPostgresAvailable()) {
    const insertSql = `
      INSERT INTO questions (
        id, chapter_id, area_id, question_code, question_text, objective,
        response_type, is_clinical, pediatric_alert_guidance, scientific_reference,
        help_text, sort_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE)
      RETURNING *
    `;
    const res = await db.query(insertSql, [
      questionId, chapterIdNum, areaIdNum, code, question_text.trim(),
      objective || 'Registro del desarrollo infantil', response_type,
      Boolean(is_clinical), pediatric_alert_guidance, scientific_reference,
      help_text, parseInt(sort_order, 10) || 1
    ]);

    const createdQuestion = res.rows[0];
    const insertedOptions = [];

    if (Array.isArray(options) && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const label = typeof opt === 'string' ? opt : (opt.label || opt.value || `Opción ${i + 1}`);
        const value = typeof opt === 'string' ? opt.toLowerCase().replace(/\s+/g, '_') : (opt.value || `opt_${i + 1}`);
        const optRes = await db.query(
          `INSERT INTO question_options (question_id, label, value, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
          [questionId, label, value, i + 1]
        );
        insertedOptions.push(optRes.rows[0]);
      }
    }

    return {
      ...createdQuestion,
      options: insertedOptions
    };
  }

  // Fallback de memoria
  const memoryQ = {
    id: questionId,
    chapter_id: chapterIdNum,
    area_id: areaIdNum,
    question_code: code,
    question_text: question_text.trim(),
    objective: objective || 'Registro del desarrollo infantil',
    response_type,
    is_clinical: Boolean(is_clinical),
    pediatric_alert_guidance,
    scientific_reference,
    help_text,
    sort_order: parseInt(sort_order, 10) || 1,
    options: options.map((opt, i) => ({
      label: typeof opt === 'string' ? opt : opt.label,
      value: typeof opt === 'string' ? opt : opt.value,
      sort_order: i + 1
    }))
  };
  if (!db.memoryStore.questions) db.memoryStore.questions = [];
  db.memoryStore.questions.push(memoryQ);
  return memoryQ;
}

/**
 * Actualiza una pregunta existente y sus opciones
 */
async function updateQuestion(id, data) {
  if (db.isPostgresAvailable()) {
    const curRes = await db.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (curRes.rows.length === 0) throw new Error(`Pregunta con ID ${id} no encontrada.`);

    const current = curRes.rows[0];
    const updated = {
      chapter_id: data.chapter_id !== undefined ? parseInt(data.chapter_id, 10) : current.chapter_id,
      area_id: data.area_id !== undefined ? parseInt(data.area_id, 10) : current.area_id,
      question_code: data.question_code !== undefined ? data.question_code.trim() : current.question_code,
      question_text: data.question_text !== undefined ? data.question_text.trim() : current.question_text,
      objective: data.objective !== undefined ? data.objective : current.objective,
      response_type: data.response_type !== undefined ? data.response_type : current.response_type,
      is_clinical: data.is_clinical !== undefined ? Boolean(data.is_clinical) : current.is_clinical,
      pediatric_alert_guidance: data.pediatric_alert_guidance !== undefined ? data.pediatric_alert_guidance : current.pediatric_alert_guidance,
      scientific_reference: data.scientific_reference !== undefined ? data.scientific_reference : current.scientific_reference,
      help_text: data.help_text !== undefined ? data.help_text : current.help_text,
      sort_order: data.sort_order !== undefined ? parseInt(data.sort_order, 10) : current.sort_order
    };

    const sql = `
      UPDATE questions
      SET chapter_id = $1, area_id = $2, question_code = $3, question_text = $4,
          objective = $5, response_type = $6, is_clinical = $7,
          pediatric_alert_guidance = $8, scientific_reference = $9,
          help_text = $10, sort_order = $11
      WHERE id = $12
      RETURNING *
    `;
    const res = await db.query(sql, [
      updated.chapter_id, updated.area_id, updated.question_code, updated.question_text,
      updated.objective, updated.response_type, updated.is_clinical,
      updated.pediatric_alert_guidance, updated.scientific_reference,
      updated.help_text, updated.sort_order, id
    ]);

    // Si se enviaron nuevas opciones, reemplazarlas
    let currentOptions = [];
    if (data.options !== undefined && Array.isArray(data.options)) {
      await db.query('DELETE FROM question_options WHERE question_id = $1', [id]);
      for (let i = 0; i < data.options.length; i++) {
        const opt = data.options[i];
        const label = typeof opt === 'string' ? opt : (opt.label || opt.value || `Opción ${i + 1}`);
        const value = typeof opt === 'string' ? opt.toLowerCase().replace(/\s+/g, '_') : (opt.value || `opt_${i + 1}`);
        const optRes = await db.query(
          `INSERT INTO question_options (question_id, label, value, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
          [id, label, value, i + 1]
        );
        currentOptions.push(optRes.rows[0]);
      }
    } else {
      const optRes = await db.query('SELECT * FROM question_options WHERE question_id = $1 ORDER BY sort_order ASC', [id]);
      currentOptions = optRes.rows;
    }

    return {
      ...res.rows[0],
      options: currentOptions
    };
  }

  // Fallback de memoria
  const idx = (db.memoryStore.questions || []).findIndex(q => q.id === id);
  if (idx === -1) throw new Error(`Pregunta con ID ${id} no encontrada.`);
  const current = db.memoryStore.questions[idx];
  const updated = { ...current, ...data };
  db.memoryStore.questions[idx] = updated;
  return updated;
}

/**
 * Elimina una pregunta (y sus opciones en cascada)
 */
async function deleteQuestion(id) {
  if (db.isPostgresAvailable()) {
    const res = await db.query('DELETE FROM questions WHERE id = $1 RETURNING id, question_code, question_text', [id]);
    if (res.rows.length === 0) {
      throw new Error(`Pregunta con ID ${id} no encontrada.`);
    }
    return { success: true, deleted: res.rows[0] };
  }

  const idx = (db.memoryStore.questions || []).findIndex(q => q.id === id);
  if (idx === -1) throw new Error(`Pregunta con ID ${id} no encontrada.`);
  const deleted = db.memoryStore.questions.splice(idx, 1)[0];
  return { success: true, deleted };
}

module.exports = {
  getAllChapters,
  getAllQuestions,
  getQuestionsByChapter,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
