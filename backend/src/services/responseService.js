// ============================================================================
// VITACHRONICLE - SERVICIO DE GUARDADO DE RESPUESTAS CON CONTROL DE VERSIONES
// ARCHIVO: backend/src/services/responseService.js
// ============================================================================

const db = require('../database/db');
const questionService = require('./questionService');
const { validateResponse } = require('../validators/responseValidator');

/**
 * Guarda o actualiza una respuesta en la base de datos, incrementando versión
 * y guardando el histórico para auditoría inmutable.
 */
async function saveResponse({ childId, questionId, payload, userId, editReason }) {
  // 1. Obtener metadatos de la pregunta
  const questionMeta = await questionService.getQuestionById(questionId);
  if (!questionMeta) {
    throw new Error(`Pregunta con ID ${questionId} no encontrada.`);
  }

  // 2. Validar sintaxis y coherencia
  const validation = validateResponse(payload, questionMeta);
  if (!validation.isValid) {
    throw new Error(`Error de validación: ${validation.error}`);
  }

  const { value, is_unknown_or_na, unknown_na_reason, parent_notes } = validation.sanitizedValue;

  // 3. Manejo en PostgreSQL con Transacción
  if (db.isPostgresAvailable()) {
    // Buscar respuesta previa
    const checkSql = `
      SELECT id, current_version, response_value, is_unknown_or_na, parent_notes
      FROM user_responses
      WHERE child_id = $1 AND question_id = $2
    `;
    const existing = await db.query(checkSql, [childId, questionId]);

    if (existing.rows.length === 0) {
      // INSERTAR NUEVA RESPUESTA
      const insertSql = `
        INSERT INTO user_responses (
          child_id, question_id, response_value, is_unknown_or_na,
          unknown_na_reason, parent_notes, current_version, created_by_user, last_updated_by_user
        ) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $7)
        RETURNING id, current_version, updated_at
      `;
      const res = await db.query(insertSql, [
        childId,
        questionId,
        JSON.stringify(value),
        is_unknown_or_na,
        unknown_na_reason || null,
        parent_notes || null,
        userId || null
      ]);

      const newId = res.rows[0].id;

      // Registrar versión 1 en el histórico
      const histSql = `
        INSERT INTO response_history (response_id, version, response_value, is_unknown_or_na, parent_notes, edited_by_user, edit_reason)
        VALUES ($1, 1, $2, $3, $4, $5, 'Creación inicial')
      `;
      await db.query(histSql, [newId, JSON.stringify(value), is_unknown_or_na, parent_notes, userId || null]);

      return {
        id: newId,
        version: 1,
        status: 'created',
        message: 'Respuesta guardada con éxito.'
      };
    } else {
      // ACTUALIZAR RESPUESTA EXISTENTE
      const current = existing.rows[0];
      const newVersion = current.current_version + 1;

      const updateSql = `
        UPDATE user_responses
        SET response_value = $1,
            is_unknown_or_na = $2,
            unknown_na_reason = $3,
            parent_notes = $4,
            current_version = $5,
            last_updated_by_user = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING id, current_version, updated_at
      `;
      await db.query(updateSql, [
        JSON.stringify(value),
        is_unknown_or_na,
        unknown_na_reason || null,
        parent_notes || null,
        newVersion,
        userId || null,
        current.id
      ]);

      // Guardar en histórico
      const histSql = `
        INSERT INTO response_history (response_id, version, response_value, is_unknown_or_na, parent_notes, edited_by_user, edit_reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await db.query(histSql, [
        current.id,
        newVersion,
        JSON.stringify(value),
        is_unknown_or_na,
        parent_notes,
        userId || null,
        editReason || 'Actualización de respuesta por el usuario'
      ]);

      return {
        id: current.id,
        version: newVersion,
        status: 'updated',
        message: 'Respuesta actualizada y versión archivada.'
      };
    }
  }

  // 4. Fallback en Modo Memoria (Desarrollo local sin PostgreSQL)
  const storeKey = `${childId}:${questionId}`;
  const existing = db.memoryStore.user_responses[storeKey];
  const currentVersion = existing ? existing.current_version + 1 : 1;

  const record = {
    id: existing ? existing.id : `resp_${Date.now()}`,
    child_id: childId,
    question_id: questionId,
    response_value: value,
    is_unknown_or_na,
    unknown_na_reason,
    parent_notes,
    current_version: currentVersion,
    updated_at: new Date().toISOString()
  };

  db.memoryStore.user_responses[storeKey] = record;
  db.memoryStore.response_history.push({
    response_id: record.id,
    version: currentVersion,
    response_value: value,
    is_unknown_or_na,
    parent_notes,
    recorded_at: new Date().toISOString()
  });

  return {
    id: record.id,
    version: currentVersion,
    status: existing ? 'updated' : 'created',
    message: 'Respuesta procesada en memoria local.'
  };
}

/**
 * Obtiene todas las respuestas de un niño para un capítulo específico
 */
async function getResponsesForChildAndChapter(childId, chapterId) {
  const questions = await questionService.getQuestionsByChapter(chapterId);
  const qIds = questions.map(q => q.id);

  if (db.isPostgresAvailable()) {
    const sql = `
      SELECT id, question_id, response_value, is_unknown_or_na, unknown_na_reason, parent_notes, current_version, updated_at
      FROM user_responses
      WHERE child_id = $1 AND question_id = ANY($2::uuid[])
    `;
    const result = await db.query(sql, [childId, qIds]);
    const responsesMap = {};
    for (const row of result.rows) {
      responsesMap[row.question_id] = row;
    }

    return {
      totalQuestions: questions.length,
      answeredCount: result.rows.length,
      percentage: questions.length > 0 ? Math.round((result.rows.length / questions.length) * 100) : 0,
      responses: responsesMap
    };
  }

  // Fallback memoria
  const responsesMap = {};
  let answered = 0;
  for (const q of questions) {
    const key = `${childId}:${q.id}`;
    if (db.memoryStore.user_responses[key]) {
      responsesMap[q.id] = db.memoryStore.user_responses[key];
      answered++;
    }
  }

  return {
    totalQuestions: questions.length,
    answeredCount: answered,
    percentage: questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0,
    responses: responsesMap
  };
}

module.exports = {
  saveResponse,
  getResponsesForChildAndChapter
};
