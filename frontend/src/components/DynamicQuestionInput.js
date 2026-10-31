// ============================================================================
// VITACHRONICLE - COMPONENTE DINÁMICO DE ENTRADA DE RESPUESTA
// Diseñado para mamás: Fácil, rápido, tierno y con sugerencias dinámicas
// ARCHIVO: frontend/src/components/DynamicQuestionInput.js
// ============================================================================

import React from 'react';

// Sugerencias rápidas por código de pregunta para diligenciamiento sin esfuerzo
const INSPIRATION_CHIPS = {
  'Q-C01-001': [
    '💖 Lloramos de inmensa felicidad',
    '✨ Una emoción indescriptible en la familia',
    '🥰 Siempre soñamos con este gran día',
    '🕊️ Una sorpresa hermosa llena de gratitud'
  ],
  'Q-C01-013': [
    '🤱 El contacto piel con piel en el pecho',
    '🕊️ Portearte cerquita a nuestro corazón',
    '🎶 Cantarte nanas suaves al oído',
    '🧸 El arrullo en brazos de papá y mamá'
  ],
  'Q-C01-014': [
    '🛁 El primer baño: ¡nervios y muchas risas!',
    '🤭 El pañal sorpresa que nos hizo sonreír',
    '😴 Verte dormir con una sonrisita mágica',
    '🍼 Tus primeros gestos tiernos con la carita'
  ],
  'Q-C01-015': [
    '🌟 Cuidar tus sueños y amarte incondicionalmente',
    '💖 Ser siempre tu hogar seguro y tu refugio',
    '🌱 Educarte con infinita ternura y paciencia',
    '🕊️ Darte raíces de amor y alas para volar'
  ]
};

// Íconos temáticos para enriquecer visualmente las áreas
function getAreaIcon(areaName = '') {
  const lower = areaName.toLowerCase();
  if (lower.includes('embarazo') || lower.includes('nacimiento')) return '🤰';
  if (lower.includes('salud') || lower.includes('neonatal')) return '🩺';
  if (lower.includes('neurológico') || lower.includes('cognitivo')) return '🧠';
  if (lower.includes('motricidad')) return '👣';
  if (lower.includes('lenguaje') || lower.includes('comunicación')) return '💬';
  if (lower.includes('social') || lower.includes('emocional')) return '💖';
  if (lower.includes('alimentación') || lower.includes('sueño')) return '🍼';
  if (lower.includes('sensorial')) return '👀';
  if (lower.includes('recuerdos') || lower.includes('futuro')) return '💌';
  return '🌱';
}

export default function DynamicQuestionInput({
  question,
  response,
  onChange,
  onSave,
  saveStatus
}) {
  const isUnknown = response?.is_unknown_or_na || false;
  const currentValue = response?.response_value;
  const parentNotes = response?.parent_notes || '';

  const handleValueChange = (newVal) => {
    onChange({
      ...response,
      response_value: newVal,
      is_unknown_or_na: false
    });
  };

  const handleToggleUnknown = (e) => {
    const checked = e.target.checked;
    onChange({
      ...response,
      is_unknown_or_na: checked,
      unknown_na_reason: checked ? 'dont_remember' : null
    });
    setTimeout(onSave, 150);
  };

  const handleNotesChange = (e) => {
    onChange({
      ...response,
      parent_notes: e.target.value
    });
  };

  const handleAppendSuggestion = (chipText) => {
    const current = typeof currentValue === 'string' ? currentValue.trim() : '';
    const updated = current ? `${current}. ${chipText}` : chipText;
    handleValueChange(updated);
    setTimeout(onSave, 200);
  };

  const suggestions = INSPIRATION_CHIPS[question.question_code] || [];
  const areaIcon = getAreaIcon(question.area_name);

  return (
    <div className="question-card" id={`q-${question.question_code}`}>
      {/* Cabecera amigable de la pregunta */}
      <div className="question-header">
        <div>
          <span className="area-badge">
            <span>{areaIcon}</span>
            <span>{question.area_name || 'Desarrollo Infantil'}</span>
          </span>
          <h4 className="question-text">{question.question_text}</h4>
          {question.objective && (
            <p className="question-objective">
              <span>🎯</span>
              <span>{question.objective}</span>
            </p>
          )}
        </div>

        {/* Notificador de Guardado Dinámico */}
        {saveStatus && (
          <span className={`save-status-indicator ${saveStatus}`}>
            {saveStatus === 'saving' && '🌸 Guardando con amor...'}
            {saveStatus === 'saved' && '💖 ¡Atesorado en el libro!'}
            {saveStatus === 'error' && '⚠️ Reintentar'}
          </span>
        )}
      </div>

      {/* Alerta Pediátrica Cálida (Informativa, no intimidante) */}
      {question.pediatric_alert_guidance && (
        <div className="pediatric-alert-box">
          <span style={{ fontSize: '1.4rem' }}>🩺</span>
          <div>
            <strong>Consejo Pediátrico con Amor:</strong> {question.pediatric_alert_guidance}
          </div>
        </div>
      )}

      {/* Controles de Entrada Dinámicos */}
      {!isUnknown ? (
        <div className="input-group">
          {/* Chips de Inspiración Rápida para Mamá si existen */}
          {suggestions.length > 0 && (
            <div className="quick-fill-chips">
              <span className="quick-fill-label">
                <span>💡</span>
                <span>Ideas para inspirarte:</span>
              </span>
              {suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chip-btn"
                  title="Haz clic para agregar esta frase a tu respuesta"
                  onClick={() => handleAppendSuggestion(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* 1. TEXTO LIBRE */}
          {question.response_type === 'open_text' && (
            <textarea
              className="textarea-field"
              placeholder={question.help_text || 'Escribe con libertad tus recuerdos o sensaciones aquí...'}
              value={typeof currentValue === 'string' ? currentValue : ''}
              onChange={(e) => handleValueChange(e.target.value)}
              onBlur={onSave}
            />
          )}

          {/* 2. CARTA EDITORIAL PARA SUS 18 AÑOS */}
          {question.response_type === 'letter_essay' && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF5EE 100%)',
              border: '1.5px solid #FFD6E2',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: 'inset 0 2px 6px rgba(255,92,138,0.05)'
            }}>
              <div style={{
                fontSize: '0.88rem',
                color: '#FF5C8A',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>💌</span>
                <span>Esta carta se imprimirá con tipografía de libro de regalo para cuando cumpla 18 años:</span>
              </div>
              <textarea
                className="textarea-field"
                style={{
                  minHeight: '140px',
                  background: '#FFFFFF',
                  borderColor: '#FFD6E2',
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.05rem',
                  lineHeight: 1.7
                }}
                placeholder="Querido hijo(a), cuando leas estas líneas serás un adulto. Hoy, en tus primeros días de vida, quiero decirte que..."
                value={typeof currentValue === 'string' ? currentValue : ''}
                onChange={(e) => handleValueChange(e.target.value)}
                onBlur={onSave}
              />
            </div>
          )}

          {/* 3. SELECCIÓN ÚNICA */}
          {question.response_type === 'single_choice' && (
            <div className="options-grid">
              {(question.options || []).map((opt) => {
                const isSelected = currentValue === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`option-pill-label ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      handleValueChange(opt.value);
                      setTimeout(onSave, 150);
                    }}
                  >
                    <input
                      type="radio"
                      name={`radio-${question.id}`}
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <span style={{ flex: 1 }}>{opt.label}</span>
                    {isSelected && <span style={{ color: '#FF5C8A', fontWeight: 700 }}>✓</span>}
                  </label>
                );
              })}
            </div>
          )}

          {/* 4. SELECCIÓN MÚLTIPLE */}
          {question.response_type === 'multiple_choice' && (
            <div className="options-grid">
              {(question.options || []).map((opt) => {
                const currentArr = Array.isArray(currentValue) ? currentValue : [];
                const isChecked = currentArr.includes(opt.value);

                return (
                  <label
                    key={opt.value}
                    className={`option-pill-label ${isChecked ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let nextArr = [...currentArr];
                        if (e.target.checked) nextArr.push(opt.value);
                        else nextArr = nextArr.filter((v) => v !== opt.value);
                        handleValueChange(nextArr);
                        setTimeout(onSave, 150);
                      }}
                    />
                    <span style={{ flex: 1 }}>{opt.label}</span>
                    {isChecked && <span style={{ color: '#FF5C8A', fontWeight: 700 }}>✓</span>}
                  </label>
                );
              })}
            </div>
          )}

          {/* 5. MÉTRICA NUMÉRICA O SOMATOMETRÍA */}
          {question.response_type === 'numeric_metric' && (
            <div>
              {question.question_code === 'Q-C01-004' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  background: '#FFF9FA',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: '1.5px solid #FFDCE6'
                }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF5C8A', display: 'block', marginBottom: '4px' }}>
                      ⚖️ Peso al nacer (g):
                    </label>
                    <input
                      type="number"
                      placeholder="ej. 3250"
                      className="parent-notes-input"
                      value={currentValue?.weight || ''}
                      onChange={(e) => handleValueChange({ ...(currentValue || {}), weight: parseInt(e.target.value, 10) || '' })}
                      onBlur={onSave}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF8E53', display: 'block', marginBottom: '4px' }}>
                      📏 Talla / Longitud (cm):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ej. 50.0"
                      className="parent-notes-input"
                      value={currentValue?.height || ''}
                      onChange={(e) => handleValueChange({ ...(currentValue || {}), height: parseFloat(e.target.value) || '' })}
                      onBlur={onSave}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8338EC', display: 'block', marginBottom: '4px' }}>
                      👶 Perímetro Craneal (cm):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ej. 35.0"
                      className="parent-notes-input"
                      value={currentValue?.head || ''}
                      onChange={(e) => handleValueChange({ ...(currentValue || {}), head: parseFloat(e.target.value) || '' })}
                      onBlur={onSave}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="number"
                    className="parent-notes-input"
                    style={{ maxWidth: '220px', fontSize: '1rem' }}
                    placeholder={question.help_text || 'Ingresa el número'}
                    value={typeof currentValue === 'number' ? currentValue : ''}
                    onChange={(e) => handleValueChange(parseFloat(e.target.value) || '')}
                    onBlur={onSave}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#826E77' }}>
                    {question.question_code === 'Q-C01-002' ? 'semanas' : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '14px 18px',
          background: '#FFF5F8',
          border: '1px solid #FFD6E2',
          borderRadius: '12px',
          color: '#826E77',
          margin: '1rem 0',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🤍</span>
          <span>Marcado como <strong>"Omitir por ahora"</strong>. Tu libro se maquetará bellamente sin interrumpirte.</span>
        </div>
      )}

      {/* Nota o Anécdota Familiar Extra */}
      <div style={{ marginTop: '0.85rem' }}>
        <input
          type="text"
          className="parent-notes-input"
          placeholder="💬 ¿Alguna anécdota o detalle curioso que quieras atesorar de este momento? (Opcional)..."
          value={parentNotes}
          onChange={handleNotesChange}
          onBlur={onSave}
        />
      </div>

      {/* Reaseguramiento sin culpas para mamá */}
      <div className="na-toggle-wrapper">
        <label>
          <input
            type="checkbox"
            checked={isUnknown}
            onChange={handleToggleUnknown}
          />
          <span>🤍 No lo recuerdo con exactitud o no aplica (puedes omitirlo sin culpa)</span>
        </label>
      </div>

      {/* Respaldo Pediátrico en pie de página */}
      {question.scientific_reference && (
        <div className="scientific-ref-footer">
          <span>📚</span>
          <span>Guía pediátrica de referencia: {question.scientific_reference}</span>
        </div>
      )}
    </div>
  );
}
