// ============================================================================
// VITACHRONICLE - PREVISUALIZADOR EDITORIAL DEL LIBRO
// Look cálido, elegante y maternal de libro encuadernado
// ARCHIVO: frontend/src/components/BookPreview.js
// ============================================================================

import React from 'react';

export default function BookPreview({
  chapter,
  child,
  questions,
  responses,
  onClose,
  onExportPdf,
  isGeneratingPdf
}) {
  if (!chapter || !child) return null;

  const getAnswer = (qCode) => {
    const q = questions.find((item) => item.question_code === qCode);
    if (!q) return null;
    return responses[q.id];
  };

  const q1 = getAnswer('Q-C01-001');
  const q3 = getAnswer('Q-C01-003');
  const q6 = getAnswer('Q-C01-006');
  const q9 = getAnswer('Q-C01-009');
  const q10 = getAnswer('Q-C01-010');
  const q14 = getAnswer('Q-C01-014');
  const q15 = getAnswer('Q-C01-015');

  return (
    <div className="book-preview-modal-backdrop" onClick={onClose}>
      <div
        className="book-preview-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Previsualizador */}
        <div className="book-preview-header">
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#FF5C8A', fontSize: '1.35rem' }}>
              📖 Previsualización del Libro de {child.first_name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#826E77' }}>
              Así se maquetará este capítulo en el libro encuadernado y en tu descarga PDF.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={onExportPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? '⏳ Compilando Álbum...' : '📥 Descargar PDF Listo'}
            </button>
            <button className="btn btn-outline" onClick={onClose}>
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Cuerpo del Libro: Páginas Editoriales */}
        <div className="book-preview-body">
          {/* HOJA 1: PORTADILLA DE CAPÍTULO */}
          <div className="editorial-page-sheet">
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #FF5C8A, #FF8E53)', margin: '0 auto 1.5rem', borderRadius: '9999px' }} />
              <div style={{ fontSize: '0.85rem', letterSpacing: '3px', color: '#FF5C8A', fontWeight: 700, textTransform: 'uppercase' }}>
                Capítulo {chapter.chapter_number}
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#34282C', margin: '0.75rem 0' }}>
                {chapter.title}
              </h1>
              <p style={{ fontStyle: 'italic', color: '#826E77', fontSize: '1.15rem', marginBottom: '2.5rem' }}>
                {chapter.subtitle}
              </p>

              <div style={{
                background: '#FFF9FA',
                border: '1.5px solid #FFDCE6',
                padding: '1.75rem',
                borderRadius: '16px',
                maxWidth: '520px',
                margin: '0 auto 3rem',
                boxShadow: '0 4px 15px rgba(255,92,138,0.06)'
              }}>
                <p style={{ fontStyle: 'italic', fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#34282C', lineHeight: 1.7 }}>
                  "{chapter.introductory_quote || 'No naciste solo en una hora; naciste en cada pensamiento que tuvimos antes de verte.'}"
                </p>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#B3A4AC', textTransform: 'uppercase' }}>
                  El Libro de Vida de
                </span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#FF5C8A', marginTop: '0.25rem' }}>
                  {child.first_name} {child.last_name} 💕
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#826E77', marginTop: '4px' }}>
                  Nacimiento: {child.birth_date} • {child.birth_hospital || 'Clínica de Nacimiento'}
                </p>
              </div>
            </div>
          </div>

          {/* HOJA 2: ACTA DE LLEGADA AL MUNDO Y CRÓNICA */}
          <div className="editorial-page-sheet">
            <div style={{ borderBottom: '1px solid #F0DFD7', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#B3A4AC' }}>
              <span>VITACHRONICLE • {child.first_name.toUpperCase()}</span>
              <span>MI PRIMER MES</span>
            </div>

            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.65rem', color: '#34282C', marginBottom: '1.25rem' }}>
              El Día que Llegaste al Mundo 🌸
            </h3>

            {/* Ficha somatométrica */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#FFF5F8', border: '1.5px solid #FFD8E4', padding: '1.15rem', borderRadius: '12px', marginBottom: '1.75rem', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#826E77', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Semanas</span>
                <strong style={{ color: '#FF5C8A', fontSize: '1rem' }}>{child.gestational_weeks || 39} sem.</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#826E77', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Grupo Sang.</span>
                <strong style={{ color: '#FF5C8A', fontSize: '1rem' }}>{child.blood_type || 'O+'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#826E77', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Parto</span>
                <strong style={{ color: '#FF5C8A', fontSize: '0.9rem' }}>
                  {q3?.response_value ? String(q3.response_value).replace('_', ' ') : 'Vaginal'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#826E77', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Hora</span>
                <strong style={{ color: '#FF5C8A', fontSize: '1rem' }}>{child.birth_time || '08:42'}</strong>
              </div>
            </div>

            {/* Relato de la noticia */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#FF8E53', marginBottom: '0.5rem' }}>
                La Noticia de tu Llegada
              </h4>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#34282C' }}>
                {q1?.response_value || 'La emoción de saber que venías llenó nuestras vidas de luz, sonrisas y una profunda gratitud.'}
              </p>
              {q1?.parent_notes && (
                <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: '#826E77', marginTop: '0.45rem', background: '#FFF9FA', padding: '6px 12px', borderRadius: '8px' }}>
                  Nota familiar: "{q1.parent_notes}"
                </p>
              )}
            </div>

            {/* Contacto Piel con Piel */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#FF8E53', marginBottom: '0.5rem' }}>
                Nuestra Primera Hora Juntos (Piel con Piel) 🕊️
              </h4>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#34282C' }}>
                {q6?.response_value ? `Vivimos ese primer contacto tan esperado: ${q6.response_value}` : 'Sentir tu corazón latiendo contra el nuestro fuera del vientre fue el instante más puro y sagrado de nuestras vidas.'}
              </p>
            </div>
          </div>

          {/* HOJA 3: OBSERVACIONES DEL NEURODESARROLLO Y ANÉCDOTA */}
          <div className="editorial-page-sheet">
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.65rem', color: '#34282C', marginBottom: '1.25rem' }}>
              Tus Primeros Reflejos y Respuestas 👣
            </h3>

            <div style={{ background: '#FFFDF9', borderLeft: '4px solid #FF5C8A', padding: '1rem 1.35rem', marginBottom: '1.5rem', borderRadius: '0 12px 12px 0' }}>
              <h5 style={{ fontWeight: 700, color: '#FF5C8A', marginBottom: '0.35rem', fontSize: '0.95rem' }}>Postura y Tono Muscular</h5>
              <p style={{ fontSize: '0.92rem', color: '#5A4750', lineHeight: 1.6 }}>
                {q9?.response_value ? `Observamos tu postura habitual: ${q9.response_value}.` : 'Mantenías tus bracitos y piernas en una flexión armónica de ranita, con tus manitas cerradas cerca del pecho.'}
              </p>
            </div>

            <div style={{ background: '#FFFDF9', borderLeft: '4px solid #FF8E53', padding: '1rem 1.35rem', marginBottom: '1.5rem', borderRadius: '0 12px 12px 0' }}>
              <h5 style={{ fontWeight: 700, color: '#FF8E53', marginBottom: '0.35rem', fontSize: '0.95rem' }}>Reflejo de Sobresalto (Moro)</h5>
              <p style={{ fontSize: '0.92rem', color: '#5A4750', lineHeight: 1.6 }}>
                {q10?.response_value ? `Al escuchar ruidos imprevistos: ${q10.response_value}.` : 'Abrías tus brazos simétricamente hacia los lados al escuchar un ruido imprevisto y luego volvías a abrazarte.'}
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#FF8E53', marginBottom: '0.5rem' }}>
                Anécdota de Nuestra Primera Semana en Casa 🛁
              </h4>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#34282C' }}>
                {q14?.response_value || 'Entre noches de poco sueño, miradas de puro asombro y risas por los pañales, aprendimos a ser una familia unida por el amor.'}
              </p>
            </div>
          </div>

          {/* HOJA 4: CARTA FAMILIAR: NUESTRA PROMESA */}
          <div className="editorial-page-sheet" style={{ background: '#FFFDF9', borderColor: '#FFD6E2' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.82rem', letterSpacing: '2px', color: '#FF5C8A', fontWeight: 700, textTransform: 'uppercase' }}>
                Carta de Amor para tus 18 Años
              </span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', color: '#34282C', marginTop: '0.5rem' }}>
                Nuestra Promesa para Ti ✨
              </h3>
            </div>

            <div style={{ padding: '1rem 2rem' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '1.2rem', lineHeight: 2, color: '#34282C', textAlign: 'center' }}>
                "{q15?.response_value || 'Prometemos cuidarte, respetar el ritmo único con el que florece tu mente, escuchar tus preguntas sin juzgarlas y darte raíces fuertes de amor para que algún día tus alas te lleven tan lejos como sueñes.'}"
              </p>

              <div style={{ marginTop: '3.5rem', textAlign: 'right', borderTop: '1.5px dashed #FFD6E2', paddingTop: '1.5rem' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#FF5C8A', fontWeight: 700 }}>
                  Con todo nuestro amor infinito,
                </div>
                <div style={{ fontSize: '0.88rem', color: '#826E77', marginTop: '4px' }}>
                  Mamá y Papá • Redactado durante tu primer mes de vida 💕
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
