// ============================================================================
// VITACHRONICLE - CLIENTE API HTTP (REACT)
// ARCHIVO: frontend/src/api/client.js
// ============================================================================

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Petición genérica con fallback de seguridad
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (err) {
    console.warn(`[API] Fallo de conexión con ${endpoint}: ${err.message}.`);
    throw err;
  }
}

export const api = {
  // Perfiles infantiles
  getChildren: (familyId) => apiRequest(`/children?familyId=${familyId || ''}`),
  getChildById: (childId) => apiRequest(`/children/${childId}`),

  // Capítulos y Preguntas
  getChapters: () => apiRequest('/chapters'),
  getQuestions: (chapterId) => apiRequest(`/chapters/${chapterId}/questions`),

  // Respuestas del usuario
  getChapterResponses: (childId, chapterId) => apiRequest(`/responses/children/${childId}/chapters/${chapterId}`),
  saveResponse: (childId, questionId, payload, editReason) => 
    apiRequest(`/responses/children/${childId}/questions/${questionId}`, {
      method: 'POST',
      body: JSON.stringify({ payload, editReason })
    }),

  // Generación de PDF
  generatePdf: (childId, chapterId) => 
    apiRequest(`/books/generate/${childId}/${chapterId}`, { method: 'POST' }),

  downloadPdfUrl: (filename) => `${API_BASE}/books/download/${filename}`
};
