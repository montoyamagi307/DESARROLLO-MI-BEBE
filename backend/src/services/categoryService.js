// ============================================================================
// VITACHRONICLE - SERVICIO DE CATEGORÍAS (ÁREAS DEL DESARROLLO)
// ARCHIVO: backend/src/services/categoryService.js
// ============================================================================

const db = require('../database/db');

/**
 * Obtiene todas las categorías con su visibilidad y conteo de preguntas
 */
async function getAllCategories() {
  if (db.isPostgresAvailable()) {
    const sql = `
      SELECT da.id, da.code, da.name, da.description, da.icon_name, 
             COALESCE(da.is_visible, TRUE) AS is_visible,
             COALESCE(COUNT(q.id), 0)::int AS questions_count
      FROM development_areas da
      LEFT JOIN questions q ON q.area_id = da.id AND q.is_active = TRUE
      GROUP BY da.id, da.code, da.name, da.description, da.icon_name, da.is_visible
      ORDER BY 
        CASE 
          WHEN da.code = 'motor' THEN 1
          WHEN da.code = 'language' THEN 2
          WHEN da.code = 'social' THEN 3
          WHEN da.code = 'habits' THEN 4
          ELSE 100 
        END, 
        da.id ASC
    `;
    const res = await db.query(sql);
    return res.rows;
  }

  // Fallback de memoria
  const areas = db.memoryStore.development_areas || [];
  return areas.map(a => {
    const qCount = (db.memoryStore.questions || []).filter(q => q.area_id === a.id).length;
    return { ...a, is_visible: a.is_visible !== undefined ? a.is_visible : true, questions_count: qCount };
  });
}

/**
 * Obtiene una categoría por su ID junto con sus preguntas
 */
async function getCategoryById(id) {
  const catId = parseInt(id, 10);

  if (db.isPostgresAvailable()) {
    const catSql = `
      SELECT id, code, name, description, icon_name, COALESCE(is_visible, TRUE) AS is_visible
      FROM development_areas
      WHERE id = $1
      LIMIT 1
    `;
    const catRes = await db.query(catSql, [catId]);
    if (catRes.rows.length === 0) return null;

    const questionsSql = `
      SELECT q.id, q.chapter_id, q.area_id, q.question_code, q.question_text,
             q.objective, q.response_type, q.is_clinical, q.pediatric_alert_guidance,
             q.scientific_reference, q.help_text, q.sort_order, q.is_active
      FROM questions q
      WHERE q.area_id = $1 AND q.is_active = TRUE
      ORDER BY q.sort_order ASC, q.created_at ASC
    `;
    const qRes = await db.query(questionsSql, [catId]);

    return {
      ...catRes.rows[0],
      questions: qRes.rows
    };
  }

  const area = (db.memoryStore.development_areas || []).find(a => a.id === catId);
  if (!area) return null;
  const questions = (db.memoryStore.questions || []).filter(q => q.area_id === catId);
  return { ...area, questions };
}

/**
 * Crea una nueva categoría
 */
async function createCategory({ code, name, description, icon_name, is_visible = true }) {
  if (!name || name.trim() === '') {
    throw new Error('El nombre de la categoría es obligatorio.');
  }

  const generatedCode = code && code.trim() !== ''
    ? code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
    : name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 45);

  const icon = icon_name || 'sparkles';
  const desc = description || '';
  const visible = is_visible !== undefined ? Boolean(is_visible) : true;

  if (db.isPostgresAvailable()) {
    // Asegurar que la secuencia serial esté al día para evitar errores de clave duplicada
    try {
      await db.query(`SELECT setval(pg_get_serial_sequence('development_areas', 'id'), COALESCE(MAX(id), 1)) FROM development_areas;`);
    } catch (seqErr) {
      // Continuar normalmente
    }

    const sql = `
      INSERT INTO development_areas (code, name, description, icon_name, is_visible)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, code, name, description, icon_name, is_visible
    `;
    const res = await db.query(sql, [generatedCode, name.trim(), desc, icon, visible]);
    return { ...res.rows[0], questions_count: 0 };
  }

  const newId = (db.memoryStore.development_areas?.length || 0) + 1;
  const newCat = { id: newId, code: generatedCode, name: name.trim(), description: desc, icon_name: icon, is_visible: visible, questions_count: 0 };
  if (!db.memoryStore.development_areas) db.memoryStore.development_areas = [];
  db.memoryStore.development_areas.push(newCat);
  return newCat;
}

/**
 * Actualiza una categoría existente
 */
async function updateCategory(id, { code, name, description, icon_name, is_visible }) {
  const catId = parseInt(id, 10);
  if (isNaN(catId)) throw new Error('ID de categoría inválido.');

  if (db.isPostgresAvailable()) {
    const currentRes = await db.query('SELECT * FROM development_areas WHERE id = $1', [catId]);
    if (currentRes.rows.length === 0) {
      throw new Error(`Categoría con ID ${catId} no encontrada.`);
    }

    const current = currentRes.rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newCode = code !== undefined ? code.trim() : current.code;
    const newDesc = description !== undefined ? description : current.description;
    const newIcon = icon_name !== undefined ? icon_name : current.icon_name;
    const newVisible = is_visible !== undefined ? Boolean(is_visible) : (current.is_visible !== undefined ? current.is_visible : true);

    const sql = `
      UPDATE development_areas
      SET code = $1, name = $2, description = $3, icon_name = $4, is_visible = $5
      WHERE id = $6
      RETURNING id, code, name, description, icon_name, is_visible
    `;
    const res = await db.query(sql, [newCode, newName, newDesc, newIcon, newVisible, catId]);
    return res.rows[0];
  }

  const catIndex = (db.memoryStore.development_areas || []).findIndex(a => a.id === catId);
  if (catIndex === -1) throw new Error(`Categoría con ID ${catId} no encontrada.`);
  const current = db.memoryStore.development_areas[catIndex];
  const updated = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    code: code !== undefined ? code.trim() : current.code,
    description: description !== undefined ? description : current.description,
    icon_name: icon_name !== undefined ? icon_name : current.icon_name,
    is_visible: is_visible !== undefined ? Boolean(is_visible) : (current.is_visible !== undefined ? current.is_visible : true)
  };
  db.memoryStore.development_areas[catIndex] = updated;
  return updated;
}

/**
 * Alterna la visibilidad de una categoría (mostrar u ocultar en la parte principal)
 */
async function toggleCategoryVisibility(id) {
  const catId = parseInt(id, 10);
  if (isNaN(catId)) throw new Error('ID de categoría inválido.');

  if (db.isPostgresAvailable()) {
    const sql = `
      UPDATE development_areas
      SET is_visible = NOT COALESCE(is_visible, TRUE)
      WHERE id = $1
      RETURNING id, code, name, is_visible
    `;
    const res = await db.query(sql, [catId]);
    if (res.rows.length === 0) throw new Error(`Categoría con ID ${catId} no encontrada.`);
    return res.rows[0];
  }

  const cat = (db.memoryStore.development_areas || []).find(a => a.id === catId);
  if (!cat) throw new Error(`Categoría con ID ${catId} no encontrada.`);
  cat.is_visible = !Boolean(cat.is_visible);
  return cat;
}

/**
 * Elimina una categoría
 */
async function deleteCategory(id) {
  const catId = parseInt(id, 10);
  if (isNaN(catId)) throw new Error('ID de categoría inválido.');

  if (db.isPostgresAvailable()) {
    // Verificar si existen preguntas asociadas a esta categoría
    const qCountRes = await db.query('SELECT COUNT(*) FROM questions WHERE area_id = $1', [catId]);
    const qCount = parseInt(qCountRes.rows[0].count, 10);
    if (qCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${qCount} pregunta(s) asociada(s). Elimina o reasigna las preguntas primero.`);
    }

    const res = await db.query('DELETE FROM development_areas WHERE id = $1 RETURNING id, name', [catId]);
    if (res.rows.length === 0) {
      throw new Error(`Categoría con ID ${catId} no encontrada.`);
    }
    return { success: true, deleted: res.rows[0] };
  }

  const idx = (db.memoryStore.development_areas || []).findIndex(a => a.id === catId);
  if (idx === -1) throw new Error(`Categoría con ID ${catId} no encontrada.`);
  const deleted = db.memoryStore.development_areas.splice(idx, 1)[0];
  return { success: true, deleted };
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryVisibility,
  deleteCategory
};
