// ============================================================================
// VITACHRONICLE - COMPONENTE GESTOR DE CATEGORÍAS Y PREGUNTAS (CRUD COMPLETO)
// Permite Crear, Listar, Editar y Eliminar Categorías y Preguntas vinculadas
// ARCHIVO: frontend/src/components/CategoryManager.js
// ============================================================================

import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function CategoryManager({ chapters = [], onCategoryOrQuestionChanged }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyClinical, setOnlyClinical] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modales
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    description: '',
    icon_name: 'sparkles',
    is_visible: true
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    area_id: '',
    chapter_id: 1,
    question_code: '',
    question_text: '',
    objective: '',
    response_type: 'open_text',
    is_clinical: false,
    pediatric_alert_guidance: '',
    scientific_reference: '',
    help_text: '',
    sort_order: 1,
    options: []
  });
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const emojiList = ['🏃', '🗣️', '💖', '🌿', '🧠', '👶', '⭐', '🎨', '📚', '🩺', '🌙', '🍎', '🧸', '👣', '🎶', '✨', '🤱', '🎈'];

  const showToast = (msg, isError = false) => {
    setNotification({ text: msg, isError });
    setTimeout(() => setNotification(null), 3500);
  };

  // Cargar categorías y preguntas
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, qRes] = await Promise.all([
        api.getCategories(),
        api.getAllQuestions()
      ]);
      const loadedCats = catRes.data || [];
      setCategories(loadedCats);
      setQuestions(qRes.data || []);

      if (loadedCats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(loadedCats[0].id);
      }
    } catch (err) {
      console.error('Error cargando categorías y preguntas:', err);
      showToast('Error al conectar con la base de datos: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  // Preguntas filtradas
  const filteredQuestions = questions.filter(q => {
    const matchesCategory = selectedCategoryId ? q.area_id === selectedCategoryId : true;
    const matchesSearch = searchTerm.trim() === '' ||
      (q.question_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.objective || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.question_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClinical = !onlyClinical || q.is_clinical;
    return matchesCategory && matchesSearch && matchesClinical;
  });

  // ==========================================
  // HANDLERS DE CATEGORÍAS
  // ==========================================
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        code: cat.code,
        description: cat.description || '',
        icon_name: cat.icon_name || 'sparkles',
        is_visible: cat.is_visible !== false
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        code: '',
        description: '',
        icon_name: 'sparkles',
        is_visible: true
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleToggleVisibility = async (cat) => {
    try {
      setActionLoading(true);
      const willBeVisible = cat.is_visible === false;
      await api.toggleCategoryVisibility(cat.id);
      showToast(
        willBeVisible
          ? `Categoría "${cat.name}" ahora es VISIBLE en la página principal (Senderos de Amor).`
          : `Categoría "${cat.name}" ahora está OCULTA de la página principal.`
      );
      await fetchData();
      if (onCategoryOrQuestionChanged) onCategoryOrQuestionChanged();
    } catch (err) {
      showToast('Error al cambiar visibilidad: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('El nombre de la categoría es obligatorio.', true);
      return;
    }

    try {
      setActionLoading(true);
      if (editingCategory) {
        const res = await api.updateCategory(editingCategory.id, categoryForm);
        showToast(`Categoría "${res.data.name}" actualizada con éxito.`);
      } else {
        const res = await api.createCategory(categoryForm);
        showToast(`Categoría "${res.data.name}" creada con éxito.`);
        setSelectedCategoryId(res.data.id);
      }
      setIsCategoryModalOpen(false);
      await fetchData();
      if (onCategoryOrQuestionChanged) onCategoryOrQuestionChanged();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la categoría "${cat.name}"?\nEsta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      await api.deleteCategory(cat.id);
      showToast(`Categoría "${cat.name}" eliminada.`);
      if (selectedCategoryId === cat.id) {
        setSelectedCategoryId(null);
      }
      await fetchData();
      if (onCategoryOrQuestionChanged) onCategoryOrQuestionChanged();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // HANDLERS DE PREGUNTAS
  // ==========================================
  const handleOpenQuestionModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        area_id: q.area_id,
        chapter_id: q.chapter_id || 1,
        question_code: q.question_code,
        question_text: q.question_text,
        objective: q.objective || '',
        response_type: q.response_type || 'open_text',
        is_clinical: Boolean(q.is_clinical),
        pediatric_alert_guidance: q.pediatric_alert_guidance || '',
        scientific_reference: q.scientific_reference || '',
        help_text: q.help_text || '',
        sort_order: q.sort_order || 1,
        options: q.options ? q.options.map(o => o.label || o.value || o) : []
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        area_id: selectedCategoryId || (categories[0]?.id || 1),
        chapter_id: 1,
        question_code: '',
        question_text: '',
        objective: '',
        response_type: 'open_text',
        is_clinical: false,
        pediatric_alert_guidance: '',
        scientific_reference: '',
        help_text: '',
        sort_order: (filteredQuestions.length || 0) + 1,
        options: []
      });
    }
    setNewOptionLabel('');
    setIsQuestionModalOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, newOptionLabel.trim()]
    }));
    setNewOptionLabel('');
  };

  const handleRemoveOption = (index) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question_text.trim()) {
      showToast('El texto de la pregunta es obligatorio.', true);
      return;
    }
    if (!questionForm.area_id) {
      showToast('Selecciona una categoría para la pregunta.', true);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        ...questionForm,
        area_id: parseInt(questionForm.area_id, 10),
        chapter_id: parseInt(questionForm.chapter_id, 10),
        sort_order: parseInt(questionForm.sort_order, 10) || 1
      };

      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, payload);
        showToast('Pregunta actualizada exitosamente.');
      } else {
        await api.createQuestion(payload);
        showToast('Pregunta creada exitosamente en la base de datos.');
      }
      setIsQuestionModalOpen(false);
      await fetchData();
      if (onCategoryOrQuestionChanged) onCategoryOrQuestionChanged();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (q) => {
    const confirmDelete = window.confirm(
      `¿Deseas eliminar la pregunta "${q.question_code}: ${q.question_text.substring(0, 50)}..."?`
    );
    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      await api.deleteQuestion(q.id);
      showToast(`Pregunta ${q.question_code} eliminada.`);
      await fetchData();
      if (onCategoryOrQuestionChanged) onCategoryOrQuestionChanged();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const getResponseTypeLabel = (type) => {
    switch (type) {
      case 'open_text': return '📝 Texto Libre';
      case 'single_choice': return '🔘 Selección Única';
      case 'multiple_choice': return '☑️ Selección Múltiple';
      case 'numeric_metric': return '🔢 Métrica / Medida';
      case 'date': return '📅 Fecha';
      case 'letter_essay': return '💌 Carta / Reflexión';
      default: return type;
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.5rem 3rem' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: notification.isError ? '#DC2626' : '#10B981',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{notification.isError ? '⚠️' : '✅'}</span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF5EE 100%)',
        border: '1.5px solid #FFD1DC',
        borderRadius: '24px',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 4px 20px rgba(255, 92, 138, 0.08)'
      }}>
        <div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#FF5C8A',
            background: 'rgba(255, 92, 138, 0.12)',
            padding: '4px 12px',
            borderRadius: '999px',
            display: 'inline-block',
            marginBottom: '0.5rem'
          }}>
            ⚙️ Panel de Control y Contenidos
          </span>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2.1rem',
            color: '#34282C',
            marginBottom: '0.4rem'
          }}>
            Gestor de Categorías y Preguntas
          </h1>
          <p style={{ color: '#826E77', fontSize: '0.98rem', maxWidth: '680px', lineHeight: 1.5 }}>
            Crea, personaliza, edita o elimina las áreas del desarrollo psicomotor y sus preguntas clínicas o afectivas registradas en Neon PostgreSQL.
          </p>
        </div>

        {/* Acciones principales */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenCategoryModal()}
            style={{
              background: '#fff',
              border: '1.5px solid #FF5C8A',
              color: '#FF5C8A',
              padding: '10px 20px',
              borderRadius: '999px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(255,92,138,0.12)'
            }}
          >
            <span>➕</span> Nueva Categoría
          </button>
          <button
            onClick={() => handleOpenQuestionModal()}
            style={{
              background: 'linear-gradient(135deg, #FF5C8A 0%, #FF8E53 100%)',
              border: 'none',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: '999px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(255,92,138,0.3)'
            }}
          >
            <span>✨</span> Nueva Pregunta
          </button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #F0E6E1',
          borderRadius: '16px',
          padding: '1.2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#826E77', fontWeight: 600 }}>Total Categorías</div>
          <div style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#FF5C8A' }}>
            {categories.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#B3A4AC' }}>Áreas del neurodesarrollo</div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #F0E6E1',
          borderRadius: '16px',
          padding: '1.2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#826E77', fontWeight: 600 }}>Total Preguntas Activas</div>
          <div style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#3B82F6' }}>
            {questions.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#B3A4AC' }}>En el catálogo clínico maestro</div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #F0E6E1',
          borderRadius: '16px',
          padding: '1.2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#826E77', fontWeight: 600 }}>Preguntas Clínicas / Alertas</div>
          <div style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#10B981' }}>
            {questions.filter(q => q.is_clinical).length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#B3A4AC' }}>Supervisión pediátrica activa</div>
        </div>
      </div>

      {/* Grid Principal: Columna Izquierda (Categorías) y Columna Derecha (Preguntas de esa Categoría) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.8rem', alignItems: 'start' }}>
        
        {/* COLUMNA IZQUIERDA: LISTA DE CATEGORÍAS */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid #F0E6E1',
          padding: '1.3rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.8rem',
            borderBottom: '1px solid #F5EBE6'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: '#34282C', fontWeight: 700 }}>
              Categorías ({categories.length})
            </h3>
            <button
              onClick={() => handleOpenCategoryModal()}
              style={{
                background: '#FFF0F5',
                border: '1px solid #FFCCD9',
                color: '#FF5C8A',
                fontSize: '0.82rem',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Añadir
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '680px', overflowY: 'auto' }}>
            {categories.map(cat => {
              const isSelected = cat.id === selectedCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #FF5C8A' : '1px solid #F0E6E1',
                    background: isSelected ? '#FFF5F8' : '#FAF6F4',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem' }}>
                        {cat.icon_name && cat.icon_name.length <= 4 ? cat.icon_name : '🌸'}
                      </span>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: isSelected ? '#FF5C8A' : '#34282C'
                      }}>
                        {cat.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isSelected ? '#FF5C8A' : '#E8D8CF',
                      color: isSelected ? '#fff' : '#5A4750',
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}>
                      {cat.questions_count || 0}
                    </span>
                  </div>

                  {cat.description && (
                    <div style={{ fontSize: '0.78rem', color: '#826E77', marginTop: '2px', lineHeight: 1.3 }}>
                      {cat.description.length > 70 ? cat.description.substring(0, 70) + '...' : cat.description}
                    </div>
                  )}

                  {/* Acciones de Categoría */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #E8D8CF'
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(cat); }}
                      style={{
                        background: cat.is_visible !== false ? '#ECFDF5' : '#F3F4F6',
                        border: cat.is_visible !== false ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                        color: cat.is_visible !== false ? '#065F46' : '#6B7280',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                      title={cat.is_visible !== false ? "Visible en Principal (clic para ocultar)" : "Oculta en Principal (clic para mostrar)"}
                    >
                      {cat.is_visible !== false ? '👁️ Visible' : '🙈 Oculta'}
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6B7280',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                        title="Editar categoría"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                        title="Eliminar categoría"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: PREGUNTAS DE LA CATEGORÍA */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid #F0E6E1',
          padding: '1.8rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
        }}>
          {/* Header de la Categoría Seleccionada */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            paddingBottom: '1.2rem',
            borderBottom: '1.5px solid #F5EBE6',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.8rem' }}>
                  {selectedCategory?.icon_name && selectedCategory.icon_name.length <= 4 ? selectedCategory.icon_name : '🌱'}
                </span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', color: '#34282C' }}>
                  {selectedCategory ? selectedCategory.name : 'Todas las Preguntas'}
                </h2>
              </div>
              <p style={{ color: '#826E77', fontSize: '0.9rem', maxWidth: '640px' }}>
                {selectedCategory?.description || 'Banco maestro de preguntas del desarrollo.'}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', background: '#F3F4F6', color: '#4B5563', padding: '3px 9px', borderRadius: '6px', fontWeight: 600 }}>
                  Código: {selectedCategory?.code || 'N/A'}
                </span>
                <span style={{ fontSize: '0.78rem', background: '#FFF0F5', color: '#FF5C8A', padding: '3px 9px', borderRadius: '6px', fontWeight: 600 }}>
                  {filteredQuestions.length} pregunta(s) listadas
                </span>
                {selectedCategory && (
                  <button
                    onClick={() => handleToggleVisibility(selectedCategory)}
                    style={{
                      background: selectedCategory.is_visible !== false ? '#ECFDF5' : '#FEF3C7',
                      border: selectedCategory.is_visible !== false ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                      color: selectedCategory.is_visible !== false ? '#065F46' : '#92400E',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Alternar visibilidad en la página principal"
                  >
                    {selectedCategory.is_visible !== false
                      ? '👁️ Visible en Senderos de Amor'
                      : '🙈 Oculta en Senderos de Amor'}
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => handleOpenQuestionModal()}
              style={{
                background: 'linear-gradient(135deg, #FF5C8A 0%, #FF8E53 100%)',
                border: 'none',
                color: '#fff',
                padding: '9px 18px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(255,92,138,0.25)'
              }}
            >
              <span>➕</span> Añadir Pregunta Aquí
            </button>
          </div>

          {/* Filtros y Búsqueda */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar por texto, código u objetivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E8D8CF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#5A4750', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlyClinical}
                onChange={(e) => setOnlyClinical(e.target.checked)}
              />
              <span>🏥 Solo Clínicas / Alertas</span>
            </label>
          </div>

          {/* Lista de Preguntas */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#826E77' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              Cargando preguntas de la base de datos...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: '#FAF6F4',
              borderRadius: '16px',
              border: '1.5px dashed #E8D8CF'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
              <h4 style={{ color: '#34282C', marginBottom: '0.4rem', fontSize: '1.15rem' }}>
                No hay preguntas en esta categoría todavía
              </h4>
              <p style={{ color: '#826E77', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                Puedes crear la primera pregunta haciendo clic en el botón de abajo.
              </p>
              <button
                onClick={() => handleOpenQuestionModal()}
                style={{
                  background: '#FF5C8A',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Crear Primera Pregunta
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {filteredQuestions.map(q => (
                <div
                  key={q.id}
                  style={{
                    background: '#FAF6F4',
                    border: '1px solid #F0E6E1',
                    borderRadius: '16px',
                    padding: '1.3rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Badges superiores y acciones */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#3B82F6',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {q.question_code}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#EDE9FE',
                        color: '#7C3AED',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {getResponseTypeLabel(q.response_type)}
                      </span>
                      {q.is_clinical && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: '#FEE2E2',
                          color: '#DC2626',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🏥 Alerta Pediátrica
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenQuestionModal(q)}
                        style={{
                          background: '#fff',
                          border: '1px solid #D1D5DB',
                          color: '#374151',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          color: '#DC2626',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Texto principal de la pregunta */}
                  <h4 style={{
                    fontSize: '1.05rem',
                    color: '#34282C',
                    fontWeight: 700,
                    lineHeight: 1.45,
                    marginBottom: '0.4rem'
                  }}>
                    {q.question_text}
                  </h4>

                  {/* Objetivo pedagógico / clínico */}
                  {q.objective && (
                    <div style={{ fontSize: '0.85rem', color: '#5A4750', marginBottom: '0.6rem', fontStyle: 'italic' }}>
                      🎯 <strong>Objetivo:</strong> {q.objective}
                    </div>
                  )}

                  {/* Opciones si es de selección */}
                  {q.options && q.options.length > 0 && (
                    <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.8rem', background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: '4px' }}>
                        Opciones configuradas ({q.options.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {q.options.map((opt, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.78rem',
                              background: '#F3F4F6',
                              color: '#374151',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E5E7EB'
                            }}
                          >
                            • {opt.label || opt.value || opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerta Pediátrica y Referencia Científica */}
                  {q.is_clinical && q.pediatric_alert_guidance && (
                    <div style={{
                      marginTop: '0.6rem',
                      background: '#FEF2F2',
                      borderLeft: '4px solid #EF4444',
                      padding: '8px 12px',
                      borderRadius: '4px 8px 8px 4px',
                      fontSize: '0.82rem',
                      color: '#991B1B'
                    }}>
                      <strong>💡 Alerta Pediátrica:</strong> {q.pediatric_alert_guidance}
                    </div>
                  )}

                  {q.scientific_reference && (
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.4rem' }}>
                      📚 <strong>Referencia:</strong> {q.scientific_reference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL: CREAR / EDITAR CATEGORÍA
          ======================================================== */}
      {isCategoryModalOpen && (
        <div 
          onClick={() => setIsCategoryModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(45, 30, 38, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '1.25rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
              border: '1.5px solid #FFD1DC'
            }}
          >
            {/* Header Fijo */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #F0DFD7',
              background: '#FFFDF9'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#FF5C8A', letterSpacing: '0.5px' }}>
                  {editingCategory ? 'Configuración de Categoría' : 'Nueva Área de Crecimiento'}
                </span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', color: '#34282C', margin: 0, marginTop: '2px' }}>
                  {editingCategory ? '✏️ Editar Categoría' : '🌱 Nueva Categoría'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: '#6B7280',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                title="Cerrar ventana"
              >
                ✕
              </button>
            </div>

            {/* Formulario con Cuerpo Desplazable y Footer Fijo */}
            <form 
              onSubmit={handleSaveCategory}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              {/* Cuerpo con Scroll */}
              <div style={{
                padding: '1.5rem 1.75rem',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '5px' }}>
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Motricidad Gruesa y Juego Libre"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '5px' }}>
                    Código Identificador (Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. gross_motor_play (se genera automático si está vacío)"
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '5px' }}>
                    Icono o Emoji Representativo
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    padding: '8px',
                    background: '#FAF6F4',
                    borderRadius: '12px',
                    border: '1px solid #F0DFD7',
                    maxHeight: '110px',
                    overflowY: 'auto',
                    marginBottom: '8px'
                  }}>
                    {emojiList.map((emo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, icon_name: emo })}
                        style={{
                          fontSize: '1.25rem',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: categoryForm.icon_name === emo ? '2px solid #FF5C8A' : '1px solid #E5E7EB',
                          background: categoryForm.icon_name === emo ? '#FFF0F5' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="O escribe un emoji o nombre personalizado (ej. 🌟)"
                    value={categoryForm.icon_name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '5px' }}>
                    Descripción o Alcance de esta Área
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Explica qué aspectos del desarrollo o memorias abarca esta categoría..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Switch de Visibilidad */}
                <div style={{
                  background: '#FFF5F8',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #FFD1DC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34282C' }}>
                      👁️ Mostrar en la parte principal (Senderos de Amor)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#826E77', marginTop: '2px', lineHeight: 1.35 }}>
                      Si está activado, aparecerá visible en las pestañas y el sendero evolutivo de la pantalla principal.
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px', flexShrink: 0, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={categoryForm.is_visible}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_visible: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: categoryForm.is_visible ? '#FF5C8A' : '#D1D5DB',
                      transition: '0.3s',
                      borderRadius: '28px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '22px',
                        width: '22px',
                        left: categoryForm.is_visible ? '25px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer Fijo con Botones SIEMPRE VISIBLES */}
              <div style={{
                padding: '1rem 1.75rem',
                borderTop: '1px solid #F0DFD7',
                background: '#FAF5F0',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #D1D5DB',
                    color: '#4B5563',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    background: 'linear-gradient(135deg, #FF5C8A 0%, #FF8E53 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(255, 92, 138, 0.35)',
                    opacity: actionLoading ? 0.7 : 1
                  }}
                >
                  <span>{editingCategory ? '💾' : '➕'}</span>
                  <span>{actionLoading ? 'Guardando...' : (editingCategory ? 'Guardar Cambios' : 'Crear Categoría')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CREAR / EDITAR PREGUNTA
          ======================================================== */}
      {isQuestionModalOpen && (
        <div 
          onClick={() => setIsQuestionModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(45, 30, 38, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '1.25rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
              border: '1.5px solid #FFD1DC'
            }}
          >
            {/* Header Fijo */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #F0DFD7',
              background: '#FFFDF9'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#FF5C8A', letterSpacing: '0.5px' }}>
                  {editingQuestion ? 'Edición de Ítem del Banco' : 'Nueva Pregunta para Neon PostgreSQL'}
                </span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', color: '#34282C', margin: 0, marginTop: '2px' }}>
                  {editingQuestion ? '✏️ Editar Pregunta' : '✨ Nueva Pregunta en el Catálogo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: '#6B7280',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Cerrar ventana"
              >
                ✕
              </button>
            </div>

            {/* Formulario con Scroll en el Cuerpo y Footer Fijo */}
            <form 
              onSubmit={handleSaveQuestion}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              {/* Cuerpo con Scroll */}
              <div style={{
                padding: '1.5rem 1.75rem',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {/* Categoría y Capítulo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                      Categoría Destino *
                    </label>
                    <select
                      value={questionForm.area_id}
                      onChange={(e) => setQuestionForm({ ...questionForm, area_id: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                      Capítulo del Libro
                    </label>
                    <select
                      value={questionForm.chapter_id}
                      onChange={(e) => setQuestionForm({ ...questionForm, chapter_id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      {chapters.length > 0 ? (
                        chapters.map(c => (
                          <option key={c.id} value={c.id}>
                            Capítulo {c.chapter_number}: {c.title.substring(0, 35)}...
                          </option>
                        ))
                      ) : (
                        <option value="1">Capítulo 1: Primeros Días</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Código de Pregunta y Tipo de Respuesta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                      Código de Pregunta
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Q-C01-016 (auto si vacío)"
                      value={questionForm.question_code}
                      onChange={(e) => setQuestionForm({ ...questionForm, question_code: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                      Tipo de Respuesta
                    </label>
                    <select
                      value={questionForm.response_type}
                      onChange={(e) => setQuestionForm({ ...questionForm, response_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #E5E7EB',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="open_text">📝 Texto Libre Abierto</option>
                      <option value="single_choice">🔘 Selección Única</option>
                      <option value="multiple_choice">☑️ Selección Múltiple</option>
                      <option value="numeric_metric">🔢 Métrica Numérica (ej. peso/talla)</option>
                      <option value="date">📅 Fecha del Acontecimiento</option>
                      <option value="letter_essay">💌 Carta o Reflexión Editorial</option>
                    </select>
                  </div>
                </div>

                {/* Texto de la Pregunta */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                    Texto de la Pregunta *
                  </label>
                  <textarea
                    rows="2"
                    required
                    placeholder="¿A qué edad ocurrió su primer balbuceo o hito...?"
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Objetivo */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                    Objetivo del Hito / Pregunta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Evaluar la maduración sensorial y la respuesta a la voz materna..."
                    value={questionForm.objective}
                    onChange={(e) => setQuestionForm({ ...questionForm, objective: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Opciones (si es de selección) */}
                {(questionForm.response_type === 'single_choice' || questionForm.response_type === 'multiple_choice') && (
                  <div style={{
                    padding: '1rem',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '6px' }}>
                      Opciones de Respuesta
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Escribe una opción y pulsa Añadir..."
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          fontSize: '0.9rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        style={{
                          background: '#3B82F6',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Añadir
                      </button>
                    </div>

                    {questionForm.options.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {questionForm.options.map((opt, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: '#fff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                              fontSize: '0.85rem'
                            }}
                          >
                            <span>{i + 1}. {opt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(i)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                        No has agregado opciones todavía.
                      </div>
                    )}
                  </div>
                )}

                {/* Switch Clínico */}
                <div style={{ padding: '10px 14px', background: '#FFF5F8', borderRadius: '10px', border: '1px solid #FFD1DC' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#FF5C8A', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={questionForm.is_clinical}
                      onChange={(e) => setQuestionForm({ ...questionForm, is_clinical: e.target.checked })}
                    />
                    <span>🏥 ¿Es una pregunta con relevancia clínica o alerta pediátrica?</span>
                  </label>
                </div>

                {questionForm.is_clinical && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                        Guía de Alerta Pediátrica
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Indica qué señales ameritan consultar al pediatra..."
                        value={questionForm.pediatric_alert_guidance}
                        onChange={(e) => setQuestionForm({ ...questionForm, pediatric_alert_guidance: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid #FCA5A5',
                          background: '#FFF5F5',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                        Referencia Científica / Escala Médica
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. CDC Milestone Surveillance / AAP Guidelines..."
                        value={questionForm.scientific_reference}
                        onChange={(e) => setQuestionForm({ ...questionForm, scientific_reference: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #E5E7EB',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Texto de Ayuda para Padres */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#34282C', marginBottom: '4px' }}>
                    Texto de Ayuda / Indicación para los Padres
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Recuerda revisar la cartilla de vacunación o epicrisis médica..."
                    value={questionForm.help_text}
                    onChange={(e) => setQuestionForm({ ...questionForm, help_text: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Footer Fijo con Botones SIEMPRE VISIBLES */}
              <div style={{
                padding: '1rem 1.75rem',
                borderTop: '1px solid #F0DFD7',
                background: '#FAF5F0',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #D1D5DB',
                    color: '#4B5563',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    background: 'linear-gradient(135deg, #FF5C8A 0%, #FF8E53 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(255,92,138,0.3)',
                    opacity: actionLoading ? 0.7 : 1
                  }}
                >
                  <span>{editingQuestion ? '💾' : '✨'}</span>
                  <span>{actionLoading ? 'Guardando...' : (editingQuestion ? 'Guardar Cambios' : 'Crear Pregunta en Neon')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
