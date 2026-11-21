// ============================================================================
// VITACHRONICLE - COMPONENTE NAVBAR
// ARCHIVO: frontend/src/components/Navbar.js
// ============================================================================

import React from 'react';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedChild,
  onOpenBookPreview,
  onExportPdf,
  isGeneratingPdf
}) {
  return (
    <header className="app-navbar">
      <div className="navbar-content">
        {/* Marca y Logotipo */}
        <div className="brand-wrapper">
          <div className="brand-logo-mark">🌸</div>
          <div>
            <span className="brand-title">VitaChronicle <span style={{ fontSize: '1rem' }}>✨</span></span>
            <span className="brand-tagline">El Álbum Mágico de Tu Bebé (0 a 18 Años)</span>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <nav className="nav-center-actions">
          <div className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'pathways' ? 'active' : ''}`}
              onClick={() => setActiveTab('pathways')}
            >
              🌱 Senderos de Amor
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'questionnaire' ? 'active' : ''}`}
              onClick={() => setActiveTab('questionnaire')}
            >
              📝 Fichas Guiadas
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              📖 Libro en Vivo
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              ⏳ Recuerdos
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              📂 Categorías y Preguntas
            </button>
          </div>
        </nav>

        {/* Selector de Perfil Infantil y Acción de Exportar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {selectedChild && (
            <div className="child-selector-pill" title="Haga clic para cambiar de hijo">
              <div className="child-avatar">
                {selectedChild.first_name ? selectedChild.first_name[0] : 'S'}
              </div>
              <div className="child-info-text">
                <div className="child-name">
                  {selectedChild.first_name} {selectedChild.last_name} 💕
                </div>
                <div className="child-age-badge">
                  {selectedChild.ages?.chronologicalAge?.formattedText || 'Recién nacida'}
                  {selectedChild.is_preterm && ' (Bebé Prematuro)'}
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn-secondary"
            onClick={onExportPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? '⏳ Compilando Álbum...' : '📥 Descargar Libro PDF'}
          </button>
        </div>
      </div>
    </header>
  );
}
