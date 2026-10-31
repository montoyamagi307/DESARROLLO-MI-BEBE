// ============================================================================
// VITACHRONICLE - FORMULARIO PRINCIPAL DE CUESTIONARIOS DEL CAPÍTULO
// ARCHIVO: frontend/src/components/QuestionnaireForm.js
// ============================================================================

import React, { useState } from 'react';
import DynamicQuestionInput from './DynamicQuestionInput';

export default function QuestionnaireForm({
  chapter,
  questions,
  responses,
  onSaveQuestion,
  onOpenPreview,
  onExportPdf,
  isGeneratingPdf
}) {
  const [saveStatuses, setSaveStatuses] = useState({});

  if (!chapter) {
    return <div style={{ padding: '2rem' }}>Cargando información del capítulo...</div>;
  }

  // Contar preguntas respondidas o marcadas N/A
  const answeredCount = questions.filter((q) => {
    const r = responses[q.id];
    return r && (r.is_unknown_or_na || (r.response_value !== undefined && r.response_value !== ''));
  }).length;

  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleQuestionSave = async (questionId, responsePayload) => {
    setSaveStatuses((prev) => ({ ...prev, [questionId]: 'saving' }));
    try {
      await onSaveQuestion(questionId, responsePayload);
      setSaveStatuses((prev) => ({ ...prev, [questionId]: 'saved' }));
      setTimeout(() => {
        setSaveStatuses((prev) => ({ ...prev, [questionId]: null }));
      }, 2500);
    } catch (err) {
      setSaveStatuses((prev) => ({ ...prev, [questionId]: 'error' }));
    }
  };

  const [filterMode, setFilterMode] = useState('all'); // 'all', 'pending', 'answered'

  const filteredQuestions = questions.filter(q => {
    const r = responses[q.id];
    const isAnswered = r && (r.is_unknown_or_na || (r.response_value !== undefined && r.response_value !== ''));
    if (filterMode === 'pending') return !isAnswered;
    if (filterMode === 'answered') return isAnswered;
    return true;
  });

  return (
    <div style={{ flex: 1 }}>
      {/* Hero del Capítulo con estilo maternal y motivador */}
      <div className="chapter-hero">
        <div className="chapter-hero-inner">
          <div>
            <span className="chapter-badge">🌸 ETAPA {chapter.chapter_number} DE CRECIMIENTO</span>
            <h1 className="chapter-title">{chapter.title}</h1>
            <p className="chapter-subtitle">{chapter.subtitle}</p>
            <div className="maternal-encouragement-quote">
              <span>💖</span>
              <span>"Mamá, cada recuerdo que guardes hoy será el tesoro más conmovedor para tu hijo mañana."</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'flex-end' }}>
            <div className="progress-card">
              <div className="progress-header-row">
                <span className="progress-text">
                  ✨ {answeredCount} de {totalQuestions} tesoros guardados
                </span>
                <span className="progress-encouragement">
                  {progressPercent === 100 ? '🎉 ¡Capítulo Completo!' : progressPercent >= 50 ? '🌸 ¡Vas súper bien!' : '🌱 Paso a paso con amor'}
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.max(progressPercent, 4)}%` }}
                />
              </div>
            </div>

            <div className="chapter-actions">
              <button className="btn btn-outline" onClick={onOpenPreview}>
                📖 Ver Cómo Queda en el Libro
              </button>
              <button
                className="btn btn-primary"
                onClick={onExportPdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? '⏳ Compilando...' : '📥 Descargar PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtro Rápido para Diligenciamiento Sencillo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '0 0.25rem'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#826E77' }}>Ver preguntas:</span>
          <button
            className={`chip-btn ${filterMode === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Todas ({questions.length})
          </button>
          <button
            className={`chip-btn ${filterMode === 'pending' ? 'btn-primary' : ''}`}
            onClick={() => setFilterMode('pending')}
          >
            Pendientes ({questions.length - answeredCount})
          </button>
          <button
            className={`chip-btn ${filterMode === 'answered' ? 'btn-primary' : ''}`}
            onClick={() => setFilterMode('answered')}
          >
            Completadas ({answeredCount})
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#826E77' }}>
          💡 <span style={{ fontStyle: 'italic' }}>El guardado es automático conforme vas respondiendo.</span>
        </div>
      </div>

      {/* Lista de Preguntas */}
      <div className="questions-feed">
        {filteredQuestions.length === 0 ? (
          <div style={{
            background: '#FFF',
            border: '1.5px dashed #FFD6E2',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            color: '#826E77'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ color: '#FF5C8A', marginBottom: '0.5rem' }}>¡No hay preguntas pendientes en este filtro!</h3>
            <p style={{ fontSize: '0.9rem' }}>Has respondido todo con dedicación y cariño.</p>
            <button
              className="btn btn-outline"
              style={{ marginTop: '1rem' }}
              onClick={() => setFilterMode('all')}
            >
              Ver todas las preguntas
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <DynamicQuestionInput
              key={q.id}
              question={q}
              response={responses[q.id] || {}}
              onChange={(updatedResponse) => {
                onSaveQuestion(q.id, updatedResponse, true);
              }}
              onSave={() => {
                const current = responses[q.id] || {};
                handleQuestionSave(q.id, current);
              }}
              saveStatus={saveStatuses[q.id]}
            />
          ))
        )}
      </div>
    </div>
  );
}
