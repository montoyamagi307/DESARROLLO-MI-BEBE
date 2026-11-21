// ============================================================================
// VITACHRONICLE - APLICACIÓN PRINCIPAL (REACT)
// ARCHIVO: frontend/src/App.js
// ============================================================================

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChapterNav from './components/ChapterNav';
import QuestionnaireForm from './components/QuestionnaireForm';
import BookPreview from './components/BookPreview';
import TimelineView from './components/TimelineView';
import EvolutionaryRoad from './components/EvolutionaryRoad';
import CategoryManager from './components/CategoryManager';
import { api } from './api/client';
import './styles/app.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('pathways');
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [chapterProgress, setChapterProgress] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Senderos Evolutivos (Continuo del Desarrollo)
  const [pathways, setPathways] = useState([
    {
      id: 'motor',
      name: 'Movimiento y Cuerpo',
      icon: '🏃',
      subtitle: 'De los reflejos del recién nacido a la carrera y la coordinación',
      milestones: [
        {
          id: 'm1',
          title: 'Reflejos Arcaicos de Bienvenida',
          window: 'Primeras 4 semanas',
          science: 'CDC / Amiel-Tison: Tono flexor fisiológico y reflejo de Moro.',
          desc: 'Brazos y piernas en flexión protectora. Respuesta de sobresalto simétrica.',
          status: 'completed',
          record: { date: '2026-03-20', text: 'Mantenías tus manitas cerradas cerca del pecho y te calmabas con el piel con piel.' }
        },
        {
          id: 'm2',
          title: 'Control de la Cabeza (Sostén Cefálico)',
          window: '2 a 4 meses',
          science: 'AAP Milestone Surveillance: Control de cuello y mirada en 90°.',
          desc: 'Levanta la cabeza y el pecho cuando está boca abajo explorando su alrededor.',
          status: 'completed',
          record: { date: '2026-05-12', text: '¡En tu mantita levantaste la cabeza con fuerza mirando la lámpara con asombro!' }
        },
        {
          id: 'm3',
          title: 'Descubrimiento de las Manos y Agarre Voluntario',
          window: '3 a 5 meses',
          science: 'Piaget: Coordinación óculo-manual.',
          desc: 'Tus manos se abrieron y comenzaron a agarrar objetos voluntariamente.',
          status: 'completed',
          record: { date: '2026-06-04', text: 'Te quedabas fascinada mirándote los dedos. Tu primer juguete fue el sonajero verde.' }
        },
        {
          id: 'm4',
          title: 'Rodamiento Autónomo (Girar sobre sí mismo)',
          window: '4 a 6 meses',
          science: 'OMS Motor Milestones: Rotación del eje corporal.',
          desc: 'Rodar de boca arriba a boca abajo, transformando el suelo en su primer territorio.',
          status: 'completed',
          record: { date: '2026-07-15', text: 'Te dejamos en la alfombra y en un segundo habías rodado sonriendo victoriosa.' }
        },
        {
          id: 'm5',
          title: 'Sedestación Independiente (Sentarse sin Apoyo)',
          window: '6 a 8 meses',
          science: 'AAP: Liberación de las dos manos para manipular juguetes.',
          desc: 'Sentarse con la espalda erguida permite ver en 3D y deja ambas manos libres.',
          status: 'in-progress',
          record: { date: 'Hoy (En proceso)', text: 'Te sientas con equilibrio apoyando una manita y ya intentas alcanzar cosas.' }
        },
        {
          id: 'm6',
          title: 'El Viaje del Gateo y la Independencia Espacial',
          window: '7 a 10 meses',
          science: 'Pikler: Movimiento contralateral y maduración del cuerpo calloso.',
          desc: 'Arrastrarse o gatear para ir a donde desea por iniciativa propia.',
          status: 'upcoming',
          record: null
        },
        {
          id: 'm7',
          title: 'Bipedestación y los Primeros Pasos Libres',
          window: '10 a 15 meses',
          science: 'OMS: Rango de marcha autónoma.',
          desc: 'Ponerse en dos pies, mantener el balance y dar esos primeros pasos hacia los brazos de papá o mamá.',
          status: 'upcoming',
          record: null
        }
      ]
    },
    {
      id: 'language',
      name: 'Lenguaje y Comunicación',
      icon: '🗣️',
      subtitle: 'Del primer llanto y la mirada a la conversación y las ideas propias',
      milestones: [
        {
          id: 'l1',
          title: 'La Mirada Mutua y Reconocimiento de Voces',
          window: '0 a 2 meses',
          science: 'Brazelton: Orientación preferencial hacia la voz familiar.',
          desc: 'Fija la mirada en los ojos del cuidador a 25 cm y se calma al oír sus voces.',
          status: 'completed',
          record: { date: '2026-03-25', text: 'Abrías tus ojos enormes cuando papá te cantaba en la mecedora.' }
        },
        {
          id: 'l2',
          title: 'La Sinfonía del Gorjeo y Balbuceo',
          window: '2 a 4 meses',
          science: 'Kuhl: Protoconversación y producción de sonidos vocálicos.',
          desc: 'Primeros intercambios vocales en turno conversacional.',
          status: 'completed',
          record: { date: '2026-05-18', text: 'Tus "agús" y suspiros sonoros llenaron la casa de alegría.' }
        },
        {
          id: 'l3',
          title: 'Señalar con el Dedo y Atención Conjunta',
          window: '8 a 10 meses',
          science: 'Tomasello: Revolución de los 9 meses.',
          desc: 'Apunta con el dedo índice para compartir con el adulto lo que ve.',
          status: 'in-progress',
          record: null
        },
        {
          id: 'l4',
          title: 'La Primera Palabra con Sentido',
          window: '10 a 14 meses',
          science: 'AAP: Palabras intencionales con significado.',
          desc: 'El instante en que los sonidos se convierten en lenguaje propio.',
          status: 'upcoming',
          record: null
        }
      ]
    },
    {
      id: 'social',
      name: 'Vínculo y Afectividad',
      icon: '💖',
      subtitle: 'Del apego seguro inicial a la empatía, la amistad y la identidad',
      milestones: [
        {
          id: 's1',
          title: 'La Hora Dorada y Contacto Piel con Piel',
          window: 'Minuto cero de vida',
          science: 'UNICEF: Estabilidad cardiorrespiratoria y vínculo.',
          desc: 'Sentir el corazón y la respiración de mamá y papá al nacer.',
          status: 'completed',
          record: { date: '2026-03-15', text: 'Ese primer latido juntos nos cambió la vida para siempre.' }
        },
        {
          id: 's2',
          title: 'La Primera Sonrisa Social Intencional',
          window: '5 a 8 semanas',
          science: 'Spitz: Primer organizador de la psique humana.',
          desc: 'Una sonrisa deliberada que conecta profundamente un alma con otra.',
          status: 'completed',
          record: { date: '2026-04-22', text: 'Te hicimos cosquillas en la pancita y sonreíste con todo tu rostro.' }
        },
        {
          id: 's3',
          title: 'Angustia del Octavo Mes (El Regalo de Extrañar)',
          window: '7 a 9 meses',
          science: 'Bowlby: Conciencia de separación y apego selectivo.',
          desc: 'Llora cuando mamá se aleja; prueba biológica del apego seguro consolidado.',
          status: 'upcoming',
          record: null
        }
      ]
    },
    {
      id: 'habits',
      name: 'Autonomía y Vida Diaria',
      icon: '🌿',
      subtitle: 'Alimentación, sueño, hábitos y el cuidado de sí mismo',
      milestones: [
        {
          id: 'h1',
          title: 'Instauración de los Ritmos de Alimentación y Sueño',
          window: 'Primeras 6 semanas',
          science: 'AAP: Diferenciación día/noche.',
          desc: 'Transición hacia los primeros ciclos estables de descanso.',
          status: 'completed',
          record: { date: '2026-04-10', text: 'La lactancia se volvió nuestro momento sagrado de calma.' }
        },
        {
          id: 'h2',
          title: 'Nuevos Sabores (Alimentación Complementaria)',
          window: '6 a 12 meses',
          science: 'OMS: Introducción segura de sólidos respetando saciedad.',
          desc: 'Descubrir el sabor del aguacate y comer con sus propias manos.',
          status: 'in-progress',
          record: { date: 'Iniciando', text: 'Probó el puré de zanahoria con gestos graciosos y pidió más.' }
        }
      ]
    }
  ]);

  const handleRecordMilestone = (pathwayId, milestoneId, recordData) => {
    setPathways(prev => prev.map(p => {
      if (p.id !== pathwayId) return p;
      return {
        ...p,
        milestones: p.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            status: 'completed',
            record: recordData
          };
        })
      };
    }));
    setNotification('✓ ¡Hito evolutivo guardado en la memoria de vida!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Carga dinámica de Senderos de Amor desde Neon DB
  const loadPathwaysFromApi = async () => {
    try {
      const [catsRes, qsRes] = await Promise.all([
        api.getCategories(),
        api.getAllQuestions()
      ]);
      const cats = catsRes.data || [];
      const allQs = qsRes.data || [];

      if (cats.length > 0) {
        // Mostrar en la parte principal SOLO las categorías con is_visible === true
        const visibleCats = cats.filter(c => c.is_visible !== false);
        const catsToUse = visibleCats.length > 0 ? visibleCats : cats.filter(c => ['motor', 'language', 'social', 'habits'].includes(c.code));

        const mapped = catsToUse.map(cat => {
          const catMilestones = allQs.filter(q => q.area_id === cat.id);
          return {
            id: cat.code || String(cat.id),
            dbId: cat.id,
            name: cat.name,
            icon: cat.icon_name && cat.icon_name.length <= 4 ? cat.icon_name : '🌸',
            subtitle: cat.description || 'De los primeros pasos a la autonomía',
            is_visible: cat.is_visible !== false,
            milestones: catMilestones.map((q, idx) => ({
              id: q.id,
              dbId: q.id,
              code: q.question_code,
              title: q.question_text,
              window: q.help_text || 'Ventana de desarrollo',
              science: q.scientific_reference || (q.is_clinical ? 'CDC / AAP Milestone Surveillance' : 'Seguimiento del neurodesarrollo'),
              desc: q.objective || '',
              status: idx === 0 ? 'completed' : (idx === 1 ? 'in-progress' : 'upcoming'),
              record: null
            }))
          };
        });

        if (mapped.length > 0) {
          setPathways(mapped);
        }
      }
    } catch (e) {
      console.warn('[PATHWAYS] Usando datos base locales por fallback:', e.message);
    }
  };

  // Modificar nombre, subtítulo o visibilidad de una Categoría en vivo
  const handleUpdateCategory = async (pathway, updatedData) => {
    try {
      if (pathway.dbId) {
        await api.updateCategory(pathway.dbId, {
          name: updatedData.name,
          description: updatedData.subtitle,
          icon_name: updatedData.icon,
          is_visible: updatedData.is_visible !== undefined ? updatedData.is_visible : pathway.is_visible
        });
      }
      setPathways(prev => prev.map(p => {
        if (p.id !== pathway.id) return p;
        return {
          ...p,
          name: updatedData.name,
          subtitle: updatedData.subtitle,
          icon: updatedData.icon,
          is_visible: updatedData.is_visible !== undefined ? updatedData.is_visible : p.is_visible
        };
      }));
      setNotification(`✓ Categoría "${updatedData.name}" actualizada.`);
      setTimeout(() => setNotification(null), 3000);
      loadPathwaysFromApi();
    } catch (err) {
      console.error(err);
      setNotification(`Error al actualizar categoría: ${err.message}`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Modificar un hito / pregunta en vivo (ej. Reflejos Arcaicos de Bienvenida)
  const handleUpdateMilestone = async (pathway, milestone, updatedData) => {
    try {
      if (milestone.dbId && typeof milestone.dbId === 'string' && milestone.dbId.length > 10) {
        await api.updateQuestion(milestone.dbId, {
          question_text: updatedData.title,
          objective: updatedData.desc,
          help_text: updatedData.window,
          scientific_reference: updatedData.science
        });
      }
      setPathways(prev => prev.map(p => {
        if (p.id !== pathway.id) return p;
        return {
          ...p,
          milestones: p.milestones.map(m => {
            if (m.id !== milestone.id) return m;
            return {
              ...m,
              title: updatedData.title,
              window: updatedData.window,
              science: updatedData.science,
              desc: updatedData.desc
            };
          })
        };
      }));
      setNotification(`✓ Hito "${updatedData.title}" modificado.`);
      setTimeout(() => setNotification(null), 3000);
      loadPathwaysFromApi();
    } catch (err) {
      console.error(err);
      setNotification(`Error al actualizar hito: ${err.message}`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Añadir un nuevo hito al sendero
  const handleAddMilestone = async (pathway, newMilestoneData) => {
    try {
      let createdQ = null;
      if (pathway.dbId) {
        const res = await api.createQuestion({
          area_id: pathway.dbId,
          chapter_id: 1,
          question_text: newMilestoneData.title,
          objective: newMilestoneData.desc,
          help_text: newMilestoneData.window,
          scientific_reference: newMilestoneData.science,
          response_type: 'open_text'
        });
        createdQ = res.data;
      }

      const newM = {
        id: createdQ ? createdQ.id : `m_custom_${Date.now()}`,
        dbId: createdQ ? createdQ.id : null,
        title: newMilestoneData.title,
        window: newMilestoneData.window || 'Etapa del desarrollo',
        science: newMilestoneData.science || 'Seguimiento del neurodesarrollo',
        desc: newMilestoneData.desc || '',
        status: 'upcoming',
        record: null
      };

      setPathways(prev => prev.map(p => {
        if (p.id !== pathway.id) return p;
        return {
          ...p,
          milestones: [...p.milestones, newM]
        };
      }));
      setNotification(`✓ Hito "${newMilestoneData.title}" añadido con éxito.`);
      setTimeout(() => setNotification(null), 3000);
      loadPathwaysFromApi();
    } catch (err) {
      console.error(err);
      setNotification(`Error al añadir hito: ${err.message}`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // 1. Cargar Datos Iniciales (Perfiles infantiles y Capítulos)
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        // Intentar obtener niños de la API (con fallback local si la API aún no está levantada)
        let kids = [];
        let chaps = [];

        try {
          const kidsRes = await api.getChildren();
          kids = kidsRes.data || [];
        } catch (e) {
          // Fallback de demostración
          kids = [
            {
              id: 'c0000001-0000-0000-0000-000000000001',
              first_name: 'Sofía',
              last_name: 'Morales Gómez',
              birth_date: '2026-03-15',
              birth_hospital: 'Clínica del Country, Bogotá',
              gestational_weeks: 39,
              is_preterm: false,
              blood_type: 'O+',
              ages: {
                chronologicalAge: { formattedText: 'Recién nacida (1 mes)' }
              }
            }
          ];
        }

        try {
          const chapsRes = await api.getChapters();
          chaps = chapsRes.data || [];
        } catch (e) {
          // Fallback de 15 capítulos
          chaps = [
            { id: 1, chapter_number: 1, title: 'Antes de conocerme: El origen y mis primeros días', subtitle: 'Embarazo, nacimiento y el primer aliento', sort_order: 1 },
            { id: 2, chapter_number: 2, title: 'Mi primer mes: Descubriendo el mundo', subtitle: 'La primera sonrisa y mis primeros ritmos', sort_order: 2 },
            { id: 3, chapter_number: 3, title: 'De los 2 a los 3 meses: Mis manos y mis sonidos', subtitle: 'La sinfonía del balbuceo', sort_order: 3 },
            { id: 4, chapter_number: 4, title: 'De los 4 a los 6 meses: El mundo a mi alcance', subtitle: 'Rodar, agarrar y reír', sort_order: 4 },
            { id: 5, chapter_number: 5, title: 'De los 7 a los 9 meses: Explorando mi espacio', subtitle: 'Me siento solo y comienzo a conversar', sort_order: 5 },
            { id: 6, chapter_number: 6, title: 'De los 10 a los 12 meses: Mis primeros pasos', subtitle: '¡Cumplo mi primer año de vida!', sort_order: 6 },
            { id: 7, chapter_number: 7, title: 'De 1 a 2 años: El pequeño explorador', subtitle: 'Autonomía y primeras frases', sort_order: 7 },
            { id: 8, chapter_number: 8, title: 'De 2 a 3 años: El poder de mi identidad', subtitle: 'El yo y el juego simbólico', sort_order: 8 },
            { id: 9, chapter_number: 9, title: 'De 3 a 5 años: La edad del asombro', subtitle: 'Preguntas infinitas y preescolar', sort_order: 9 },
            { id: 10, chapter_number: 10, title: 'De 6 a 8 años: Letras, números y amigos', subtitle: 'Escuela primaria', sort_order: 10 },
            { id: 11, chapter_number: 11, title: 'De 9 a 11 años: Construyendo mi propia voz', subtitle: 'Pensamiento crítico e intereses', sort_order: 11 },
            { id: 12, chapter_number: 12, title: 'De 12 a 14 años: La metamorfosis', subtitle: 'Adolescencia temprana', sort_order: 12 },
            { id: 13, chapter_number: 13, title: 'De 15 a 18 años: El vuelo propio', subtitle: 'Madurez y proyectos de vida', sort_order: 13 },
            { id: 14, chapter_number: 14, title: 'Nuestras Raíces: La historia familiar', subtitle: 'Árbol genealógico y orígenes', sort_order: 14 },
            { id: 15, chapter_number: 15, title: 'Cartas para tu futuro: Cuando tengas 18 años', subtitle: 'Palabras selladas de amor', sort_order: 15 }
          ];
        }

        setChildren(kids);
        if (kids.length > 0) setSelectedChild(kids[0]);
        setChapters(chaps);
        await loadPathwaysFromApi();
      } catch (err) {
        console.error('Error cargando iniciales:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // 2. Cargar Preguntas y Respuestas cuando cambia el Capítulo o el Niño
  useEffect(() => {
    async function loadChapterContent() {
      if (!selectedChild || !currentChapterId) return;

      try {
        // Cargar preguntas
        let qs = [];
        try {
          const qRes = await api.getQuestions(currentChapterId);
          qs = qRes.data || [];
        } catch (e) {
          // Si el backend no responde, usar banco mock local
          qs = getLocalMockQuestions(currentChapterId);
        }
        setQuestions(qs);

        // Cargar respuestas guardadas
        try {
          const respRes = await api.getChapterResponses(selectedChild.id, currentChapterId);
          if (respRes.data) {
            setResponses(respRes.data.responses || {});
            setChapterProgress((prev) => ({
              ...prev,
              [currentChapterId]: respRes.data.percentage || 0
            }));
          }
        } catch (e) {
          // Mantener respuestas locales si no hay backend activo
        }
      } catch (err) {
        console.error('Error cargando capítulo:', err);
      }
    }

    loadChapterContent();
  }, [selectedChild, currentChapterId]);

  // 3. Manejador de Guardado de Respuesta
  const handleSaveQuestion = async (questionId, responsePayload, isSilent = false) => {
    // Actualizar estado local inmediatamente para reactividad óptima
    setResponses((prev) => ({
      ...prev,
      [questionId]: responsePayload
    }));

    if (isSilent) return;

    if (!selectedChild) return;

    try {
      await api.saveResponse(selectedChild.id, questionId, responsePayload, 'Actualizado por usuario en React');
    } catch (err) {
      console.warn('Guardado en API pendiente, datos persistidos en memoria del navegador.');
    }
  };

  // 4. Exportar a PDF
  const handleExportPdf = async () => {
    if (!selectedChild) return;
    setIsGeneratingPdf(true);
    setNotification('Preparando documento editorial...');

    try {
      const res = await api.generatePdf(selectedChild.id, currentChapterId);
      if (res.success && res.data?.downloadUrl) {
        window.open(api.downloadPdfUrl(res.data.filename), '_blank');
        setNotification('✓ ¡PDF compilado y descargado exitosamente!');
      } else {
        throw new Error('Respuesta inesperada al generar PDF');
      }
    } catch (err) {
      // Fallback si el backend no está corriendo: alerta explicativa
      setNotification(`⚠️ PDF listo en motor local. Para descarga directa, inicia el backend en el puerto 5000.`);
    } finally {
      setIsGeneratingPdf(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const currentChapter = chapters.find((c) => c.id === currentChapterId) || chapters[0];

  return (
    <div className="app-container">
      {/* Notificación Toast Flotante Amorosa */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #FF5C8A 0%, #FF8E53 100%)',
          color: '#FFF',
          padding: '14px 24px',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(255, 92, 138, 0.35)',
          zIndex: 9999,
          fontSize: '0.94rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'popIn 0.3s ease-out'
        }}>
          <span>💖</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Navbar Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedChild={selectedChild}
        onOpenBookPreview={() => setIsPreviewOpen(true)}
        onExportPdf={handleExportPdf}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Vista de Senderos Evolutivos (Continuo del Crecimiento) */}
      {activeTab === 'pathways' && (
        <EvolutionaryRoad
          pathways={pathways}
          child={selectedChild}
          onRecordMilestone={handleRecordMilestone}
          onOpenPreview={() => setActiveTab('preview')}
          onUpdateCategory={handleUpdateCategory}
          onUpdateMilestone={handleUpdateMilestone}
          onAddMilestone={handleAddMilestone}
        />
      )}

      {/* Vista de Cuestionario por Etapas */}
      {activeTab === 'questionnaire' && (
        <div className="main-layout">
          <ChapterNav
            chapters={chapters}
            currentChapterId={currentChapterId}
            onSelectChapter={(id) => setCurrentChapterId(id)}
            chapterProgress={chapterProgress}
          />

          <QuestionnaireForm
            chapter={currentChapter}
            questions={questions}
            responses={responses}
            onSaveQuestion={handleSaveQuestion}
            onOpenPreview={() => setIsPreviewOpen(true)}
            onExportPdf={handleExportPdf}
            isGeneratingPdf={isGeneratingPdf}
          />
        </div>
      )}

      {/* Vista de Línea de Tiempo */}
      {activeTab === 'timeline' && <TimelineView child={selectedChild} />}

      {/* Vista de Gestión de Categorías y Preguntas (CRUD) */}
      {activeTab === 'categories' && (
        <CategoryManager
          chapters={chapters}
          onCategoryOrQuestionChanged={loadPathwaysFromApi}
        />
      )}

      {/* Vista de Previsualización del Libro */}
      {activeTab === 'preview' && (
        <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="chapter-badge">📖 ENCUADERNACIÓN EDITORIAL EN TIEMPO REAL</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: '#34282C', margin: '0.5rem 0' }}>
              El Libro Impreso de {selectedChild?.first_name || 'tu bebé'}
            </h2>
            <p style={{ color: '#826E77', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
              Cada respuesta y recuerdo que guardas se maqueta en tiempo real con diseño editorial listo para imprimir y atesorar para siempre.
            </p>
          </div>
          <BookPreview
            chapter={currentChapter}
            child={selectedChild}
            questions={questions}
            responses={responses}
            onClose={() => setActiveTab('questionnaire')}
            onExportPdf={handleExportPdf}
            isGeneratingPdf={isGeneratingPdf}
          />
        </div>
      )}

      {/* Modal de Previsualizador si se abre desde el botón flotante */}
      {isPreviewOpen && (
        <BookPreview
          chapter={currentChapter}
          child={selectedChild}
          questions={questions}
          responses={responses}
          onClose={() => setIsPreviewOpen(false)}
          onExportPdf={handleExportPdf}
          isGeneratingPdf={isGeneratingPdf}
        />
      )}
    </div>
  );
}

// Fallback de preguntas locales por si se prueba offline
function getLocalMockQuestions(chapterId) {
  if (chapterId === 1) {
    return [
      {
        id: 'a0000001-0000-0000-0000-000000000001',
        chapter_id: 1,
        question_code: 'Q-C01-001',
        area_name: 'Recuerdos familiares y mensajes de futuro',
        question_text: '¿Cómo se vivió la noticia de mi llegada y qué sentimientos predominaron durante los primeros meses de gestación?',
        objective: 'Documentar el contexto psicosocial y la narrativa familiar de concepción.',
        response_type: 'open_text',
        scientific_reference: 'Brazelton, T.B. (1990). The Earliest Relationship.',
        help_text: 'Escribe con libertad: cómo se enteraron, qué hicieron ese día y qué soñaban para ti.'
      },
      {
        id: 'a0000001-0000-0000-0000-000000000003',
        chapter_id: 1,
        question_code: 'Q-C01-003',
        area_name: 'Antecedentes del embarazo y nacimiento',
        question_text: '¿Qué tipo de parto permitió mi nacimiento?',
        objective: 'Conocer la vía de parto para antecedentes perinatales.',
        response_type: 'single_choice',
        options: [
          { label: 'Parto vaginal espontáneo (eutócico)', value: 'vaginal_spontaneous' },
          { label: 'Parto vaginal asistido (vacum / fórceps)', value: 'vaginal_assisted' },
          { label: 'Cesárea de urgencia', value: 'cesarean_emergency' },
          { label: 'Cesárea programada', value: 'cesarean_scheduled' },
          { label: 'Parto humanizado en agua', value: 'water_birth' }
        ]
      },
      {
        id: 'a0000001-0000-0000-0000-000000000004',
        chapter_id: 1,
        question_code: 'Q-C01-004',
        area_name: 'Salud durante el periodo neonatal',
        question_text: '¿Cuáles fueron mis medidas antropométricas al momento de nacer (peso, talla y perímetro cefálico)?',
        objective: 'Registrar la somatometría neonatal basal.',
        response_type: 'numeric_metric',
        pediatric_alert_guidance: 'Un peso inferior a 2.500g o superior a 4.000g al nacer debe ser seguido de cerca con el pediatra.'
      },
      {
        id: 'a0000001-0000-0000-0000-000000000006',
        chapter_id: 1,
        question_code: 'Q-C01-006',
        area_name: 'Desarrollo social',
        question_text: '¿Pudimos realizar el contacto "Piel con Piel" durante la primera hora de vida (la Hora Dorada)?',
        objective: 'Documentar la instauración temprana del vínculo afectivo.',
        response_type: 'single_choice',
        options: [
          { label: 'Sí, inmediato y sostenido durante la primera hora dorada', value: 'immediate_golden_hour' },
          { label: 'Sí, pero fue breve antes de las revisiones de enfermería', value: 'brief_initial' },
          { label: 'No fue posible de inmediato por atención médica de mamá o bebé', value: 'delayed_medical' }
        ]
      },
      {
        id: 'a0000001-0000-0000-0000-000000000009',
        chapter_id: 1,
        question_code: 'Q-C01-009',
        area_name: 'Motricidad gruesa',
        question_text: 'En mis primeros días, ¿qué postura adoptaba mi cuerpo cuando estaba despierto y relajado?',
        objective: 'Evaluar el tono muscular y la flexión fisiológica normal.',
        response_type: 'single_choice',
        pediatric_alert_guidance: 'Si el bebé se nota persistentemente flácido o arqueado hacia atrás, consúltalo con el pediatra.',
        options: [
          { label: 'Brazos y piernas flexionados con puños cerrados (Postura habitual)', value: 'physiological_flexion' },
          { label: 'Cuerpo muy laxo o estirado con poca resistencia (Tono bajo)', value: 'hypotonia_tendency' },
          { label: 'Cuerpo muy rígido o con arqueamiento constante de la espalda', value: 'hypertonia_tendency' }
        ]
      },
      {
        id: 'a0000001-0000-0000-0000-000000000010',
        chapter_id: 1,
        question_code: 'Q-C01-010',
        area_name: 'Desarrollo neurológico y cognitivo',
        question_text: '¿Cómo reaccionaba ante un sonido repentino o sensación de caída (Reflejo de Moro)?',
        objective: 'Observar la presencia y simetría del reflejo arcaico de Moro.',
        response_type: 'single_choice',
        pediatric_alert_guidance: 'Una respuesta asimétrica (un solo brazo) requiere valoración para descartar lesión del plexo braquial.',
        options: [
          { label: 'Abría ambos brazos simétricamente hacia afuera y luego los recogía', value: 'moro_symmetric' },
          { label: 'Movía un brazo con más fuerza que el otro al sobresaltarse', value: 'moro_asymmetric' },
          { label: 'Casi no se inmutaba ante ruidos o cambios de posición', value: 'moro_diminished' }
        ]
      },
      {
        id: 'a0000001-0000-0000-0000-000000000014',
        chapter_id: 1,
        question_code: 'Q-C01-014',
        area_name: 'Recuerdos familiares y mensajes de futuro',
        question_text: '¿Cuál fue la anécdota o acontecimiento más divertido, caótico o conmovedor de nuestra primera semana juntos?',
        objective: 'Construir memoria narrativa con calidez y honestidad sobre la adaptación a la crianza.',
        response_type: 'open_text'
      },
      {
        id: 'a0000001-0000-0000-0000-000000000015',
        chapter_id: 1,
        question_code: 'Q-C01-015',
        area_name: 'Recuerdos familiares y mensajes de futuro',
        question_text: 'Nuestra promesa para ti: ¿Qué compromiso de amor y crianza te hicimos al cumplir tu primer mes?',
        objective: 'Registrar la carta de apego seguro que se imprimirá con diseño editorial en el libro.',
        response_type: 'letter_essay'
      }
    ];
  }
  return [];
}
