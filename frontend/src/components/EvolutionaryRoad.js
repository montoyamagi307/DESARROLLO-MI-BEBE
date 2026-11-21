// ============================================================================
// VITACHRONICLE - COMPONENTE DE SENDEROS Y TRAYECTORIAS EVOLUTIVAS
// Diseño cálido, dinámico y estimulante para mamás con edición directa
// ARCHIVO: frontend/src/components/EvolutionaryRoad.js
// ============================================================================

import React, { useState } from 'react';

export default function EvolutionaryRoad({
  pathways,
  child,
  onRecordMilestone,
  onOpenPreview,
  onUpdateCategory,
  onUpdateMilestone,
  onAddMilestone
}) {
  const [selectedPathwayId, setSelectedPathwayId] = useState(pathways[0]?.id || 'motor');
  
  // Modal de registro de recuerdo / conquista
  const [activeModalMilestone, setActiveModalMilestone] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Modal para editar Categoría
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categorySubtitleInput, setCategorySubtitleInput] = useState('');
  const [categoryIconInput, setCategoryIconInput] = useState('');

  // Modal para editar o añadir Hito
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isAddingNewMilestone, setIsAddingNewMilestone] = useState(false);
  const [milestoneTitleInput, setMilestoneTitleInput] = useState('');
  const [milestoneWindowInput, setMilestoneWindowInput] = useState('');
  const [milestoneDescInput, setMilestoneDescInput] = useState('');
  const [milestoneScienceInput, setMilestoneScienceInput] = useState('');

  const activePathway = pathways.find(p => p.id === selectedPathwayId) || pathways[0];
  const completedCount = activePathway?.milestones.filter(m => m.status === 'completed').length || 0;
  const totalCount = activePathway?.milestones.length || 0;
  const pathwayPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const emojiList = ['🏃', '🗣️', '💖', '🌿', '🧠', '👶', '⭐', '🎨', '📚', '🩺', '🌙', '🍎', '🧸', '👣', '🎶', '✨'];

  // Handlers Conquista
  const handleOpenRecordModal = (milestone) => {
    setActiveModalMilestone(milestone);
    setDateInput(milestone.record?.date || new Date().toISOString().split('T')[0]);
    setNotesInput(milestone.record?.text || '');
  };

  const handleSaveRecordModal = () => {
    if (activeModalMilestone) {
      onRecordMilestone(selectedPathwayId, activeModalMilestone.id, {
        date: dateInput,
        text: notesInput
      });
      setActiveModalMilestone(null);
    }
  };

  // Handlers Editar Categoría
  const handleOpenEditCategory = (pathway) => {
    setEditingCategory(pathway);
    setCategoryNameInput(pathway.name);
    setCategorySubtitleInput(pathway.subtitle || '');
    setCategoryIconInput(pathway.icon || '🌸');
  };

  const handleSaveEditCategory = (e) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;
    if (onUpdateCategory) {
      onUpdateCategory(editingCategory, {
        name: categoryNameInput.trim(),
        subtitle: categorySubtitleInput.trim(),
        icon: categoryIconInput
      });
    }
    setEditingCategory(null);
  };

  // Handlers Editar / Añadir Hito
  const handleOpenEditMilestone = (milestone) => {
    setIsAddingNewMilestone(false);
    setEditingMilestone(milestone);
    setMilestoneTitleInput(milestone.title);
    setMilestoneWindowInput(milestone.window || '');
    setMilestoneDescInput(milestone.desc || '');
    setMilestoneScienceInput(milestone.science || '');
  };

  const handleOpenAddMilestone = () => {
    setIsAddingNewMilestone(true);
    setEditingMilestone({ id: 'new' });
    setMilestoneTitleInput('');
    setMilestoneWindowInput('Primeras semanas');
    setMilestoneDescInput('');
    setMilestoneScienceInput('Seguimiento pediátrico y neurodesarrollo');
  };

  const handleSaveMilestoneModal = (e) => {
    e.preventDefault();
    if (!milestoneTitleInput.trim()) return;

    const data = {
      title: milestoneTitleInput.trim(),
      window: milestoneWindowInput.trim(),
      desc: milestoneDescInput.trim(),
      science: milestoneScienceInput.trim()
    };

    if (isAddingNewMilestone) {
      if (onAddMilestone) onAddMilestone(activePathway, data);
    } else {
      if (onUpdateMilestone) onUpdateMilestone(activePathway, editingMilestone, data);
    }

    setEditingMilestone(null);
    setIsAddingNewMilestone(false);
  };

  // Paleta tierna por sendero
  const getPathwayColorTheme = (id) => {
    switch (id) {
      case 'motor':
        return { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C', glow: 'rgba(234, 88, 12, 0.15)' };
      case 'language':
        return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', glow: 'rgba(22, 163, 74, 0.15)' };
      case 'social':
        return { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48', glow: 'rgba(225, 29, 72, 0.15)' };
      case 'habits':
        return { bg: '#FAF5FF', border: '#E9D5FF', text: '#9333EA', glow: 'rgba(147, 51, 234, 0.15)' };
      default:
        return { bg: '#FFF5F8', border: '#FFCCD9', text: '#FF5C8A', glow: 'rgba(255, 92, 138, 0.15)' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Banner de Filosofía Evolutiva Cálido */}
      <div className="pathway-hero-banner">
        <div>
          <span className="pathway-hero-tag">
            🌸 EL CRECIMIENTO COMO UN MILAGRO ORGÁNICO
          </span>
          <h1 className="pathway-hero-title">
            Cada Bebé Crece a su Propio Ritmo
          </h1>
          <p className="pathway-hero-p">
            El desarrollo de {child?.first_name || 'tu bebé'} no es una carrera contrarreloj; es un jardín de descubrimientos.
            Atesora sus conquistas cuando florezcan naturalmente, sin la presión ni la culpa de un calendario rígido.
          </p>
        </div>

        <div className="pathway-stat-card">
          <span style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 700 }}>Conquistas Registradas</span>
          <div style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, margin: '4px 0' }}>
            {completedCount} / {totalCount}
          </div>
          <span style={{
            fontSize: '0.82rem',
            background: 'rgba(255,255,255,0.3)',
            padding: '3px 12px',
            borderRadius: '9999px',
            fontWeight: 700
          }}>
            ✨ {pathwayPercent}% de este Sendero
          </span>
        </div>
      </div>

      {/* Selector de los Senderos Evolutivos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.15rem',
        marginBottom: '2.25rem'
      }}>
        {pathways.map((p) => {
          const isSelected = p.id === selectedPathwayId;
          const comp = p.milestones.filter(m => m.status === 'completed').length;
          const theme = getPathwayColorTheme(p.id);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPathwayId(p.id)}
              style={{
                background: isSelected ? theme.bg : '#FFFFFF',
                border: isSelected ? `2.5px solid ${theme.text}` : '1.5px solid #F0DFD7',
                borderRadius: '20px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isSelected ? `0 10px 25px ${theme.glow}` : '0 4px 14px rgba(0,0,0,0.03)',
                transform: isSelected ? 'translateY(-3px)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: isSelected ? theme.text : '#FAF4F0',
                color: isSelected ? '#FFF' : theme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0
              }}>
                {p.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#34282C',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {p.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: theme.text, fontWeight: 700 }}>
                  {comp} de {p.milestones.length} hitos vividos
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenedor del Sendero Activo */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        border: '1.5px solid #F0DFD7',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(220, 100, 140, 0.06)',
        marginBottom: '3rem'
      }}>
        {/* Cabecera del Sendero con botón de Modificar Categoría */}
        <div style={{
          borderBottom: '1.5px dashed #F0DFD7',
          paddingBottom: '1.5rem',
          marginBottom: '2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <span style={{ color: '#FF5C8A', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '1px' }}>
              SENDERO DE AMOR Y CONQUISTAS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', color: '#34282C', margin: 0 }}>
                {activePathway?.icon} {activePathway?.name}
              </h2>
              <button
                onClick={() => handleOpenEditCategory(activePathway)}
                style={{
                  background: '#FFF0F5',
                  border: '1.5px solid #FFCCD9',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '0.82rem',
                  color: '#FF5C8A',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Modificar nombre o descripción de esta categoría"
              >
                ✏️ Modificar Categoría
              </button>
            </div>
            <p style={{ color: '#826E77', fontSize: '0.98rem', marginTop: '4px' }}>{activePathway?.subtitle}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleOpenAddMilestone}
              style={{
                background: 'linear-gradient(135deg, #FF5C8A 0%, #FF8E53 100%)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(255, 92, 138, 0.25)'
              }}
            >
              <span>➕</span> Añadir Hito Aquí
            </button>
            <button className="btn btn-outline" onClick={onOpenPreview}>
              📖 Ver Crónica en el Libro
            </button>
          </div>
        </div>

        {/* Cadena de Hitos con Stepper Conector Pastel */}
        <div style={{ position: 'relative', paddingLeft: '2.25rem' }}>
          {/* Línea conectora */}
          <div style={{
            position: 'absolute',
            left: '18px',
            top: '25px',
            bottom: '25px',
            width: '4px',
            background: 'linear-gradient(180deg, #FFCCD9 0%, #FFE2B8 50%, #E9D5FF 100%)',
            borderRadius: '9999px'
          }} />

          {activePathway?.milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in-progress';

            return (
              <div key={m.id} style={{ position: 'relative', marginBottom: '2.25rem', display: 'flex', gap: '1.5rem' }}>
                {/* Indicador del nodo animado */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isCompleted ? 'linear-gradient(135deg, #38B000, #70E000)' : (isInProgress ? 'linear-gradient(135deg, #FF8E53, #FFA97A)' : '#FFF'),
                  border: isCompleted ? '3px solid #FFF' : (isInProgress ? '3px solid #FFF' : '3px solid #E2D3CA'),
                  color: (isCompleted || isInProgress) ? '#FFF' : '#826E77',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  zIndex: 2,
                  flexShrink: 0,
                  boxShadow: isCompleted 
                    ? '0 0 0 3px #BBF7D0, 0 4px 10px rgba(56, 176, 0, 0.3)' 
                    : (isInProgress ? '0 0 0 3px #FED7AA, 0 4px 10px rgba(255, 142, 83, 0.3)' : '0 2px 6px rgba(0,0,0,0.05)')
                }}>
                  {isCompleted ? '✓' : (isInProgress ? '✨' : (idx + 1))}
                </div>

                {/* Tarjeta del hito con botón de Modificar Hito */}
                <div style={{
                  background: isCompleted ? '#FFFDFE' : '#FFFFFF',
                  border: isCompleted ? '1.5px solid #FFD6E2' : '1.5px solid #F0DFD7',
                  borderRadius: '18px',
                  padding: '1.6rem',
                  flex: 1,
                  boxShadow: '0 4px 15px rgba(220, 100, 140, 0.05)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34282C', margin: 0 }}>
                          {m.title}
                        </h3>
                        <button
                          onClick={() => handleOpenEditMilestone(m)}
                          style={{
                            background: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            color: '#4B5563',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Modificar texto o detalles de este hito"
                        >
                          ✏️ Modificar Hito
                        </button>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#9E8893', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>
                        📚 {m.science}
                      </span>
                    </div>

                    <span style={{
                      background: '#FFF5F8',
                      color: '#FF5C8A',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      border: '1px solid #FFD6E2',
                      whiteSpace: 'nowrap'
                    }}>
                      🌸 Ventana orientativa: {m.window}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.94rem', color: '#5A4750', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                    {m.desc}
                  </p>

                  {/* Registro guardado por mamá/familia */}
                  {m.record ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #FFF9FA 0%, #FFFDF8 100%)',
                      border: '1.5px solid #FFE0E9',
                      borderRadius: '14px',
                      padding: '1.15rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#FF5C8A',
                        marginBottom: '0.45rem'
                      }}>
                        <span>📅 FECHA ATESORADA: {m.record.date}</span>
                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleOpenRecordModal(m)}>
                          ✏️ Editar Recuerdo
                        </span>
                      </div>
                      <p style={{ fontSize: '0.96rem', color: '#34282C', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{m.record.text}"
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.85rem' }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                        onClick={() => handleOpenRecordModal(m)}
                      >
                        🌸 Registrar este Hito cuando florezca
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          MODAL: EDITAR CATEGORÍA (ej. "Movimiento y Cuerpo")
          ======================================================== */}
      {editingCategory && (
        <div className="book-preview-modal-backdrop" onClick={() => setEditingCategory(null)}>
          <div className="book-preview-container" style={{ maxWidth: '520px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#FF5C8A', fontSize: '1.45rem', margin: 0 }}>
                ✏️ Modificar Categoría del Sendero
              </h3>
              <button onClick={() => setEditingCategory(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#9CA3AF' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  className="parent-notes-input"
                  style={{ width: '100%', fontSize: '0.95rem' }}
                  value={categoryNameInput}
                  onChange={e => setCategoryNameInput(e.target.value)}
                  placeholder="Ej. Movimiento y Cuerpo"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Icono o Emoji
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {emojiList.map((emo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCategoryIconInput(emo)}
                      style={{
                        fontSize: '1.2rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: categoryIconInput === emo ? '2px solid #FF5C8A' : '1px solid #E5E7EB',
                        background: categoryIconInput === emo ? '#FFF0F5' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Subtítulo o Descripción
                </label>
                <textarea
                  className="textarea-field"
                  rows="2"
                  value={categorySubtitleInput}
                  onChange={e => setCategorySubtitleInput(e.target.value)}
                  placeholder="Ej. De los reflejos del recién nacido a la carrera y la coordinación..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingCategory(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MODIFICAR / AÑADIR HITO (ej. "Reflejos Arcaicos de Bienvenida")
          ======================================================== */}
      {editingMilestone && (
        <div className="book-preview-modal-backdrop" onClick={() => setEditingMilestone(null)}>
          <div className="book-preview-container" style={{ maxWidth: '600px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#FF5C8A', fontSize: '1.45rem', margin: 0 }}>
                {isAddingNewMilestone ? '➕ Añadir Hito al Sendero' : '✏️ Modificar Hito'}
              </h3>
              <button onClick={() => setEditingMilestone(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#9CA3AF' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMilestoneModal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Nombre del Hito *
                </label>
                <input
                  type="text"
                  required
                  className="parent-notes-input"
                  style={{ width: '100%', fontSize: '0.95rem' }}
                  value={milestoneTitleInput}
                  onChange={e => setMilestoneTitleInput(e.target.value)}
                  placeholder="Ej. Reflejos Arcaicos de Bienvenida"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Ventana orientativa de edad
                </label>
                <input
                  type="text"
                  className="parent-notes-input"
                  style={{ width: '100%', fontSize: '0.9rem' }}
                  value={milestoneWindowInput}
                  onChange={e => setMilestoneWindowInput(e.target.value)}
                  placeholder="Ej. Primeras 4 semanas / 2 a 4 meses"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Descripción de lo que hace el bebé
                </label>
                <textarea
                  className="textarea-field"
                  rows="3"
                  value={milestoneDescInput}
                  onChange={e => setMilestoneDescInput(e.target.value)}
                  placeholder="Describe el movimiento, logro o comportamiento esperado..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '4px' }}>
                  Respaldo científico o escala médica
                </label>
                <input
                  type="text"
                  className="parent-notes-input"
                  style={{ width: '100%', fontSize: '0.88rem' }}
                  value={milestoneScienceInput}
                  onChange={e => setMilestoneScienceInput(e.target.value)}
                  placeholder="Ej. CDC / Amiel-Tison: Tono flexor fisiológico..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingMilestone(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {isAddingNewMilestone ? 'Añadir Hito' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REGISTRAR RECUERDO / CONQUISTA VIVIDA
          ======================================================== */}
      {activeModalMilestone && (
        <div className="book-preview-modal-backdrop" onClick={() => setActiveModalMilestone(null)}>
          <div className="book-preview-container" style={{ maxWidth: '600px', padding: '2.25rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem' }}>💖</span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#FF5C8A', fontSize: '1.5rem' }}>
                Atesorar Conquista de Crecimiento
              </h3>
            </div>
            <p style={{ color: '#826E77', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              <strong>{activeModalMilestone.title}</strong> (Alrededor de: {activeModalMilestone.window})
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '6px' }}>
                📅 Fecha en que lo conquistó (exacta o aproximada):
              </label>
              <input
                type="date"
                className="parent-notes-input"
                style={{ fontSize: '0.95rem' }}
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34282C', display: 'block', marginBottom: '6px' }}>
                ✍️ ¿Cómo fue este momento? Tus recuerdos y anécdota familiar:
              </label>
              <textarea
                className="textarea-field"
                style={{ minHeight: '120px' }}
                placeholder="Describe la sonrisa, la emoción de la familia y cualquier detalle tierno que quieras que lea a sus 18 años..."
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setActiveModalMilestone(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveRecordModal}>
                💖 Guardar en su Álbum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
