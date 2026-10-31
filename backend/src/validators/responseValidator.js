// ============================================================================
// VITACHRONICLE - VALIDADOR DE ENTRADAS Y RESPUESTAS
// ARCHIVO: backend/src/validators/responseValidator.js
// ============================================================================

/**
 * Valida la estructura y coherencia clínica de una respuesta recibida de los cuestionarios.
 * @param {Object} responsePayload - Datos enviados por el usuario
 * @param {Object} questionMeta - Metadatos de la pregunta desde la base de datos
 * @returns {{ isValid: boolean, error?: string, sanitizedValue?: any }}
 */
function validateResponse(responsePayload, questionMeta) {
  if (!responsePayload) {
    return { isValid: false, error: 'El cuerpo de la respuesta es obligatorio.' };
  }

  const { value, is_unknown_or_na, unknown_na_reason, parent_notes } = responsePayload;

  // Si el usuario marcó "No lo recuerdo", "No lo sé" o "No aplica"
  if (is_unknown_or_na === true) {
    const validReasons = ['dont_know', 'dont_remember', 'not_applicable'];
    if (unknown_na_reason && !validReasons.includes(unknown_na_reason)) {
      return { isValid: false, error: 'Motivo de no respuesta no reconocido.' };
    }
    return {
      isValid: true,
      sanitizedValue: {
        value: null,
        is_unknown_or_na: true,
        unknown_na_reason: unknown_na_reason || 'dont_remember',
        parent_notes: sanitizeText(parent_notes || '')
      }
    };
  }

  // Validación por tipo de pregunta
  switch (questionMeta.response_type) {
    case 'open_text':
    case 'letter_essay': {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return { isValid: false, error: 'La respuesta de texto no puede estar vacía si no se marca "No lo sé".' };
      }
      const maxLen = questionMeta.response_type === 'letter_essay' ? 5000 : 2500;
      if (value.length > maxLen) {
        return { isValid: false, error: `El texto excede el límite permitido de ${maxLen} caracteres.` };
      }
      return {
        isValid: true,
        sanitizedValue: {
          value: sanitizeText(value),
          is_unknown_or_na: false,
          parent_notes: sanitizeText(parent_notes || '')
        }
      };
    }

    case 'numeric_metric': {
      // Puede ser un número directo o un objeto con varias métricas (ej. peso, talla, cefálico)
      if (typeof value === 'number') {
        if (isNaN(value)) {
          return { isValid: false, error: 'El valor numérico no es válido.' };
        }
        return {
          isValid: true,
          sanitizedValue: {
            value,
            is_unknown_or_na: false,
            parent_notes: sanitizeText(parent_notes || '')
          }
        };
      } else if (typeof value === 'object' && value !== null) {
        // Objeto métrico compuesto (somatometría)
        return {
          isValid: true,
          sanitizedValue: {
            value,
            is_unknown_or_na: false,
            parent_notes: sanitizeText(parent_notes || '')
          }
        };
      }
      return { isValid: false, error: 'Se esperaba un formato numérico o métrico válido.' };
    }

    case 'single_choice': {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return { isValid: false, error: 'Debes seleccionar una opción de la lista.' };
      }
      return {
        isValid: true,
        sanitizedValue: {
          value: value.trim(),
          is_unknown_or_na: false,
          parent_notes: sanitizeText(parent_notes || '')
        }
      };
    }

    case 'multiple_choice': {
      if (!Array.isArray(value)) {
        return { isValid: false, error: 'Se esperaba una lista de opciones seleccionadas.' };
      }
      return {
        isValid: true,
        sanitizedValue: {
          value: value.map(v => String(v).trim()),
          is_unknown_or_na: false,
          parent_notes: sanitizeText(parent_notes || '')
        }
      };
    }

    default:
      return {
        isValid: true,
        sanitizedValue: {
          value,
          is_unknown_or_na: Boolean(is_unknown_or_na),
          parent_notes: sanitizeText(parent_notes || '')
        }
      };
  }
}

/**
 * Sanitiza texto simple contra caracteres peligrosos
 */
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

module.exports = {
  validateResponse,
  sanitizeText
};
