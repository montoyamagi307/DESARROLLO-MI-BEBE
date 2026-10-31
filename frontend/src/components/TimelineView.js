// ============================================================================
// VITACHRONICLE - LÍNEA DE TIEMPO DEL CRECIMIENTO (ÁLBUM DE MEMORIAS)
// Estilo Scrapbook / Diario Íntimo Maternal
// ARCHIVO: frontend/src/components/TimelineView.js
// ============================================================================

import React from 'react';

export default function TimelineView({ child }) {
  const events = [
    {
      id: 1,
      title: '¡Llegaste a Nuestras Vidas!',
      date: child?.birth_date || '2026-03-15',
      approxText: 'El día más mágico',
      description: `Nacimiento en ${child?.birth_hospital || 'Clínica de Nacimiento'}. Peso: 3.350g, Talla: 50cm. Mirarte a los ojos por primera vez detuvo el tiempo.`,
      icon: '🐣',
      sticker: '🍼 Día Cero'
    },
    {
      id: 2,
      title: 'Tu Primera Sonrisa Social Intencional',
      date: '2026-04-18',
      approxText: 'Alrededor de las 5 semanas',
      description: 'Nos regalaste tu primera sonrisa clara en respuesta a nuestras voces y caricias. La casa entera se iluminó de amor.',
      icon: '🥰',
      sticker: '✨ Pura Magia'
    },
    {
      id: 3,
      title: 'Primeras Manitos Abiertas y Gorjeos',
      date: '2026-05-10',
      approxText: 'A los 2 meses',
      description: 'Descubriste que podías mirarte las manitas y llenaste la habitación con tus primeros gorgoritos de alegría.',
      icon: '🖐️',
      sticker: '🎶 Gorgoritos'
    },
    {
      id: 4,
      title: '¡Tu Primer Rodamiento en la Mantita!',
      date: '2026-07-20',
      approxText: 'Hacia los 4 meses y medio',
      description: '¡Giraste completamente sobre tu mantita de juegos! Estabas tan sorprendido y orgulloso de ti mismo que aplaudimos juntos.',
      icon: '🌀',
      sticker: '👣 Gran Conquista'
    }
  ];

  return (
    <div className="timeline-container">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="chapter-badge">📸 ÁLBUM DE MOMENTOS INOLVIDABLES</span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.3rem', color: '#34282C', margin: '0.5rem 0' }}>
          La Línea de Tiempo de {child?.first_name || 'tu bebé'}
        </h2>
        <p style={{ color: '#826E77', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Las primeras veces, las risas inesperadas y cada latido atesorado en su historia de vida.
        </p>
      </div>

      <div style={{ position: 'relative', paddingLeft: '2.5rem', borderLeft: '3px dashed #FFCCD9' }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ position: 'relative', marginBottom: '2.5rem' }}>
            {/* Nodo de flor / corazón en el eje */}
            <div
              style={{
                position: 'absolute',
                left: '-3.65rem',
                top: '0',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFF',
                border: '3px solid #FF5C8A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 12px rgba(255, 92, 138, 0.25)',
                zIndex: 2
              }}
            >
              {ev.icon}
            </div>

            {/* Tarjeta del hito con toque de Polaroid / Scrapbook */}
            <div className="timeline-card">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <span style={{
                    background: '#FFF1F5',
                    color: '#FF5C8A',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}>
                    {ev.sticker}
                  </span>
                  <h4 style={{ color: '#34282C', fontSize: '1.2rem', fontWeight: 700 }}>
                    {ev.title}
                  </h4>
                </div>

                <span style={{
                  fontSize: '0.82rem',
                  color: '#FF8E53',
                  fontWeight: 700,
                  background: '#FFF5EE',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  border: '1px solid #FFE4D6'
                }}>
                  📅 {ev.date} {ev.approxText && `• ${ev.approxText}`}
                </span>
              </div>

              <p style={{ color: '#5A4750', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "{ev.description}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
