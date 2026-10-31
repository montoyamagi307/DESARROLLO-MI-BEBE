// ============================================================================
// VITACHRONICLE - COMPONENTE DE SENDEROS Y TRAYECTORIAS EVOLUTIVAS
// Diseño cálido, dinámico y estimulante para mamás
// ARCHIVO: frontend/src/components/EvolutionaryRoad.js
// ============================================================================

import React, { useState } from 'react';

export default function EvolutionaryRoad({ pathways, child, onRecordMilestone, onOpenPreview }) {
  const [selectedPathwayId, setSelectedPathwayId] = useState(pathways[0]?.id || 'motor');
  const [activeModalMilestone, setActiveModalMilestone] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const activePathway = pathways.find(p => p.id === selectedPathwayId) || pathways[0];
  const completedCount = activePathway?.milestones.filter(m => m.status === 'completed').length || 0;
  const totalCount = activePathway?.milestones.length || 0;
  const pathwayPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleOpenModal = (milestone) => {
    setActiveModalMilestone(milestone);
    setDateInput(milestone.record?.date || new Date().toISOString().split('T')[0]);
    setNotesInput(milestone.record?.text || '');
  };

  const handleSaveModal = () => {
    if (activeModalMilestone) {
      onRecordMilestone(selectedPathwayId, activeModalMilestone.id, {
        date: dateInput,
        text: notesInput
      });
      setActiveModalMilestone(null);
    }
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

      {/* Selector de los 4 Grandes Senderos Evolutivos */}
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
                borderRadius: '18px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: isSelected ? `0 8px 24px ${theme.glow}` : '0 2px 8px rgba(0,0,0,0.03)',
                transform: isSelected ? 'scale(1.02)' : 'none'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: isSelected ? theme.text : '#FFF0F4',
                color: isSelected ? '#FFF' : theme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem',
                flexShrink: 0,
                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}>
                {p.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#34282C', fontSize: '0.98rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.78rem', color: theme.text, fontWeight: 700, marginTop: '3px' }}>
                  {comp} de {p.milestones.length} hitos vividos {comp === p.milestones.length && '🎉'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ruta Evolutiva del Sendero Activo */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #F2E3DC',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        boxShadow: '0 8px 30px rgba(220, 100, 140, 0.06)'
      }}>
        <div style={{
          borderBottom: '1.5px dashed #F0DFD7',
          paddingBottom: '1.5rem',
          marginBottom: '2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <span style={{ color: '#FF5C8A', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1px' }}>
              SENDERO DE AMOR Y CONQUISTAS
            </span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', color: '#34282C', marginTop: '4px' }}>
              {activePathway?.icon} {activePathway?.name}
            </h2>
            <p style={{ color: '#826E77', fontSize: '0.98rem' }}>{activePathway?.subtitle}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
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

                {/* Tarjeta del hito */}
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
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34282C' }}>{m.title}</h3>
                      <span style={{ fontSize: '0.78rem', color: '#9E8893', fontStyle: 'italic' }}>📚 {m.science}</span>
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
                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleOpenModal(m)}>
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
                        onClick={() => handleOpenModal(m)}
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

      {/* Modal para Registrar/Editar Hito Tierno */}
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
              <button className="btn btn-primary" onClick={handleSaveModal}>
                💖 Guardar en su Álbum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
