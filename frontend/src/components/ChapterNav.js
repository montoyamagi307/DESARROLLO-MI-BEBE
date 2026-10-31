// ============================================================================
// VITACHRONICLE - NAVEGACIÓN LATERAL DE CAPÍTULOS
// ARCHIVO: frontend/src/components/ChapterNav.js
// ============================================================================

import React from 'react';

export default function ChapterNav({
  chapters,
  currentChapterId,
  onSelectChapter,
  chapterProgress = {}
}) {
  return (
    <aside className="sidebar-chapters">
      <h3 className="sidebar-title">
        <span>📖</span>
        <span>Índice del Álbum (0-18 Años)</span>
      </h3>
      <ul className="chapter-nav-list">
        {chapters.map((chap) => {
          const isActive = chap.id === currentChapterId;
          const progress = chapterProgress[chap.id] || 0;

          return (
            <li
              key={chap.id}
              className={`chapter-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectChapter(chap.id)}
            >
              <div className="chapter-num-badge">
                {progress === 100 ? '✓' : chap.chapter_number}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.86rem'
                }}>
                  {chap.title}
                </div>
                {progress > 0 && (
                  <div style={{ fontSize: '0.74rem', color: '#FF5C8A', fontWeight: 700, marginTop: '2px' }}>
                    {progress === 100 ? '💖 ¡Completado!' : `🌸 ${progress}% atesorado`}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
