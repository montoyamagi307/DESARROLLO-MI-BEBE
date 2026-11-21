// ============================================================================
// VITACHRONICLE - CLIENTE API HTTP (REACT)
// ARCHIVO: frontend/src/api/client.js
// ============================================================================

// Normalización automática de la URL base de la API (añade /api si no está presente)
const rawApiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

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

  // Capítulos y Preguntas del libro
  getChapters: () => apiRequest('/chapters'),
  getQuestions: (chapterId) => apiRequest(`/chapters/${chapterId}/questions`),

  // CRUD Categorías (Áreas de Desarrollo)
  getCategories: () => apiRequest('/categories'),
  getCategoryById: (id) => apiRequest(`/categories/${id}`),
  createCategory: (data) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // CRUD Preguntas
  getAllQuestions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.areaId) query.append('areaId', params.areaId);
    if (params.chapterId) query.append('chapterId', params.chapterId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/questions${qs ? `?${qs}` : ''}`);
  },
  getQuestionById: (id) => apiRequest(`/questions/${id}`),
  createQuestion: (data) => apiRequest('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id, data) => apiRequest(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id) => apiRequest(`/questions/${id}`, { method: 'DELETE' }),

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
