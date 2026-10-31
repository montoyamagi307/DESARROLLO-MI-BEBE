// ============================================================================
// VITACHRONICLE - SERVICIO DE PERFILES INFANTILES Y CÁLCULO PEDIÁTRICO
// ARCHIVO: backend/src/services/childService.js
// ============================================================================

const db = require('../database/db');

/**
 * Calcula la edad cronológica y la edad corregida (para prematuros <37 semanas)
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @param {string|Date} dueDate - Fecha probable de parto (FPP)
 * @param {boolean} isPreterm - Si fue pretérmino
 * @returns {Object} Desglose de edad en años, meses y días
 */
function calculateAges(birthDate, dueDate, isPreterm) {
  const now = new Date();
  const birth = new Date(birthDate);

  // Edad cronológica
  let diffTime = Math.abs(now - birth);
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  let chronologicalMonths = Math.floor(diffDays / 30.4375);
  let chronologicalYears = Math.floor(chronologicalMonths / 12);

  let correctedMonths = chronologicalMonths;
  let correctedWeeks = null;

  if (isPreterm && dueDate) {
    const due = new Date(dueDate);
    const correctedDiffTime = now - due;
    if (correctedDiffTime > 0) {
      const correctedDiffDays = Math.floor(correctedDiffTime / (1000 * 60 * 60 * 24));
      correctedMonths = Math.floor(correctedDiffDays / 30.4375);
      correctedWeeks = Math.floor(correctedDiffDays / 7);
    } else {
      correctedMonths = 0;
      correctedWeeks = 0;
    }
  }

  return {
    chronologicalAge: {
      totalDays: diffDays,
      months: chronologicalMonths,
      years: chronologicalYears,
      formattedText: `${chronologicalYears > 0 ? `${chronologicalYears} a, ` : ''}${chronologicalMonths % 12} meses`
    },
    correctedAge: isPreterm ? {
      applicable: chronologicalMonths < 24, // Consenso pediátrico: se aplica hasta los 24 meses
      months: correctedMonths,
      weeks: correctedWeeks,
      formattedText: `${correctedMonths} meses (Edad Corregida)`
    } : null
  };
}

/**
 * Obtiene todos los perfiles infantiles de una familia
 */
async function getChildrenByFamily(familyId) {
  const sql = `
    SELECT id, family_id, first_name, last_name, preferred_name,
           birth_date, birth_time, due_date, is_preterm, gestational_weeks, gestational_days,
           gender, blood_type, birth_hospital, pediatrician_name, pediatrician_contact,
           created_at
    FROM child_profiles
    WHERE family_id = $1
    ORDER BY birth_date ASC
  `;
  const result = await db.query(sql, [familyId]);
  
  return result.rows.map(child => ({
    ...child,
    ages: calculateAges(child.birth_date, child.due_date, child.is_preterm)
  }));
}

/**
 * Obtiene el detalle de un perfil infantil por su ID
 */
async function getChildById(childId) {
  const sql = `
    SELECT id, family_id, first_name, last_name, preferred_name,
           birth_date, birth_time, due_date, is_preterm, gestational_weeks, gestational_days,
           gender, blood_type, birth_hospital, pediatrician_name, pediatrician_contact,
           created_at
    FROM child_profiles
    WHERE id = $1
    LIMIT 1
  `;
  const result = await db.query(sql, [childId]);
  if (!result.rows || result.rows.length === 0) {
    return null;
  }
  const child = result.rows[0];
  return {
    ...child,
    ages: calculateAges(child.birth_date, child.due_date, child.is_preterm)
  };
}

module.exports = {
  calculateAges,
  getChildrenByFamily,
  getChildById
};
