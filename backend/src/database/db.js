// ============================================================================
// VITACHRONICLE - CAPA DE CONEXIÓN A POSTGRESQL CON MOCK FALLBACK RESILIENTE
// ARCHIVO: backend/src/database/db.js
// ============================================================================

const { Pool } = require('pg');
const config = require('../config/env');

let pool = null;
let isPostgresAvailable = false;

// Repositorio de memoria para fallback cuando PostgreSQL aún no está encendido
const memoryStore = {
  families: [
    { id: 'f0000001-0000-0000-0000-000000000001', family_name: 'Familia Morales Gómez' }
  ],
  users: [
    {
      id: 'b0000001-0000-0000-0000-000000000001',
      family_id: 'f0000001-0000-0000-0000-000000000001',
      full_name: 'Carolina Gómez',
      email: 'carolina@vitachronicle.com',
      role: 'primary_parent'
    }
  ],
  child_profiles: [
    {
      id: 'c0000001-0000-0000-0000-000000000001',
      family_id: 'f0000001-0000-0000-0000-000000000001',
      first_name: 'Sofía',
      last_name: 'Morales Gómez',
      preferred_name: 'Sofi',
      birth_date: '2026-03-15',
      birth_time: '08:42:00',
      due_date: '2026-03-22',
      is_preterm: false,
      gestational_weeks: 39,
      gestational_days: 2,
      gender: 'female',
      blood_type: 'O+',
      birth_hospital: 'Clínica del Country, Bogotá',
      pediatrician_name: 'Dra. Claudia Rodríguez',
      pediatrician_contact: '+57 310 987 6543'
    }
  ],
  development_areas: [
    { id: 1, code: 'pregnancy_birth', name: 'Antecedentes del embarazo y nacimiento', description: 'Datos de gestación, controles prenatales, parto y adaptación inmediata.', icon_name: 'baby-carriage' },
    { id: 2, code: 'neonatal_health', name: 'Salud durante el periodo neonatal', description: 'Somatometría inicial, APGAR, tamizajes y evolución en los primeros días.', icon_name: 'heart-pulse' },
    { id: 3, code: 'neuro_cognitive', name: 'Desarrollo neurológico y cognitivo', description: 'Reflejos primitivos, atención, curiosidad, permanencia del objeto y resolución de problemas.', icon_name: 'brain' },
    { id: 4, code: 'gross_motor', name: 'Motricidad gruesa', description: 'Control cefálico, sedestación, gateo, bipedestación, marcha, carrera y saltos.', icon_name: 'person-walking' },
    { id: 5, code: 'fine_motor', name: 'Motricidad fina', description: 'Prensión palmar, pinza digital, coordinación ojo-mano, dibujo, uso de cubiertos y escritura.', icon_name: 'hand' },
    { id: 6, code: 'language_comm', name: 'Lenguaje y comunicación', description: 'Balbuceo, primeras palabras, vocabulario expresivo, comprensión y pronunciación.', icon_name: 'chat-bubble' },
    { id: 7, code: 'social_dev', name: 'Desarrollo social', description: 'Sonrisa social, apego, interacción con familiares, pares y personas desconocidas.', icon_name: 'users' },
    { id: 8, code: 'emotional_dev', name: 'Desarrollo emocional', description: 'Expresión afectiva, modulación del llanto, tolerancia a la frustración y autorregulación.', icon_name: 'face-smile' },
    { id: 9, code: 'sensory_dev', name: 'Desarrollo sensorial', description: 'Procesamiento de estímulos auditivos, visuales, táctiles, vestibulares y propioceptivos.', icon_name: 'sparkles' },
    { id: 10, code: 'behavior_adapt', name: 'Comportamiento, atención y adaptación', description: 'Ritmos circadianos, temperamento, capacidad de enfoque y adaptación a transiciones.', icon_name: 'target' },
    { id: 11, code: 'feeding_sleep', name: 'Alimentación, sueño y hábitos', description: 'Lactancia, alimentación complementaria, rutinas de sueño y ritmos biológicos.', icon_name: 'moon' },
    { id: 12, code: 'autonomy_skills', name: 'Autonomía y habilidades cotidianas', description: 'Vestido, higiene personal, control de esfínteres y colaboración en el hogar.', icon_name: 'star' },
    { id: 13, code: 'school_learning', name: 'Aprendizaje, vida escolar y talentos', description: 'Desarrollo académico, pensamiento lógico, creatividad, intereses y vocaciones.', icon_name: 'book-open' },
    { id: 14, code: 'adolescence_identity', name: 'Adolescencia, identidad y relaciones', description: 'Identidad personal, autonomía moral, pensamiento abstracto y toma de decisiones.', icon_name: 'compass' },
    { id: 15, code: 'family_memories', name: 'Recuerdos familiares y mensajes de futuro', description: 'Crónicas familiares, anécdotas, fotografías entrañables y cartas para la posteridad.', icon_name: 'heart' }
  ],
  chapters: [
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
  ],
  questions: [
    {
      id: 'a0000001-0000-0000-0000-000000000001',
      chapter_id: 1,
      area_id: 15,
      area_name: 'Recuerdos familiares y mensajes de futuro',
      question_code: 'Q-C01-001',
      question_text: '¿Cómo se vivió la noticia de mi llegada y qué sentimientos predominaron durante los primeros meses de gestación?',
      objective: 'Documentar el contexto psicosocial, la narrativa familiar de concepción y la historia de apego prenatal.',
      response_type: 'open_text',
      is_clinical: false,
      scientific_reference: 'Brazelton, T.B. (1990). The Earliest Relationship: Parents, Infants, and Early Attachment.',
      help_text: 'Escribe con libertad: cómo se enteraron, qué hicieron ese día y qué soñaban para ti.',
      sort_order: 1,
      options: []
    },
    {
      id: 'a0000001-0000-0000-0000-000000000002',
      chapter_id: 1,
      area_id: 1,
      area_name: 'Antecedentes del embarazo y nacimiento',
      question_code: 'Q-C01-002',
      question_text: '¿A cuántas semanas de gestación ocurrió el nacimiento (edad gestacional)?',
      objective: 'Registrar la edad gestacional para evaluar prematurez y activar el cálculo de edad corregida.',
      response_type: 'numeric_metric',
      is_clinical: true,
      pediatric_alert_guidance: 'Bebés nacidos antes de las 37 semanas requieren evaluación del neurodesarrollo con edad corregida hasta los 2 años.',
      scientific_reference: 'Organización Mundial de la Salud (OMS). Clasificación de la Prematurez y Salud Neonatal.',
      help_text: 'Ingresa las semanas completas (ejemplo: 39 semanas).',
      sort_order: 2,
      options: []
    },
    {
      id: 'a0000001-0000-0000-0000-000000000003',
      chapter_id: 1,
      area_id: 1,
      area_name: 'Antecedentes del embarazo y nacimiento',
      question_code: 'Q-C01-003',
      question_text: '¿Qué tipo de parto permitió mi nacimiento?',
      objective: 'Conocer la vía de parto e instrumentalización para antecedentes perinatales.',
      response_type: 'single_choice',
      is_clinical: true,
      scientific_reference: 'American College of Obstetricians and Gynecologists (ACOG). Practice Bulletin No. 115.',
      help_text: 'Selecciona la opción médica registrada en tu epicrisis o informe de parto.',
      sort_order: 3,
      options: [
        { label: 'Parto vaginal espontáneo (eutócico)', value: 'vaginal_spontaneous' },
        { label: 'Parto vaginal asistido (vacum / fórceps)', value: 'vaginal_assisted' },
        { label: 'Cesárea de urgencia', value: 'cesarean_emergency' },
        { label: 'Cesárea programada', value: 'cesarean_scheduled' },
        { label: 'Parto humanizado en agua', value: 'water_birth' },
        { label: 'No lo recuerdo / Prefiero no indicar', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000004',
      chapter_id: 1,
      area_id: 2,
      area_name: 'Salud durante el periodo neonatal',
      question_code: 'Q-C01-004',
      question_text: '¿Cuáles fueron mis medidas antropométricas al momento de nacer (peso, talla y perímetro cefálico)?',
      objective: 'Registrar la somatometría neonatal basal para cálculo de percentiles de crecimiento.',
      response_type: 'numeric_metric',
      is_clinical: true,
      pediatric_alert_guidance: 'Un peso inferior a 2.500g o superior a 4.000g al nacer debe ser seguido de cerca con el pediatra.',
      scientific_reference: 'OMS Child Growth Standards. Patrones de crecimiento infantil para recién nacidos.',
      help_text: 'Indica el peso en gramos (ej. 3250), la longitud en cm (ej. 50.0) y el perímetro craneal en cm (ej. 34.5).',
      sort_order: 4,
      options: []
    },
    {
      id: 'a0000001-0000-0000-0000-000000000005',
      chapter_id: 1,
      area_id: 2,
      area_name: 'Salud durante el periodo neonatal',
      question_code: 'Q-C01-005',
      question_text: '¿Cuáles fueron mis puntuaciones en el Test de APGAR al primer minuto y a los cinco minutos?',
      objective: 'Evaluar la adaptación cardiorrespiratoria y el tono neonatal inmediato.',
      response_type: 'numeric_metric',
      is_clinical: true,
      pediatric_alert_guidance: 'Puntuaciones menores de 7 a los 5 minutos ameritan seguimiento pediátrico preventivo.',
      scientific_reference: 'AAP & ACOG Committee Opinion No. 644: The Apgar Score.',
      help_text: 'Consulta tu carné de vacunación o epicrisis médica. Son dos valores del 0 al 10.',
      sort_order: 5,
      options: []
    },
    {
      id: 'a0000001-0000-0000-0000-000000000006',
      chapter_id: 1,
      area_id: 7,
      area_name: 'Desarrollo social',
      question_code: 'Q-C01-006',
      question_text: '¿Pudimos realizar el contacto "Piel con Piel" durante la primera hora de vida (la Hora Dorada)?',
      objective: 'Documentar la instauración temprana del vínculo afectivo y la estabilidad térmica.',
      response_type: 'single_choice',
      is_clinical: false,
      scientific_reference: 'UNICEF / OMS. Early initiation of breastfeeding and skin-to-skin contact guidelines.',
      help_text: 'El contacto piel con piel estabiliza la temperatura, la glucosa y calma al bebé.',
      sort_order: 6,
      options: [
        { label: 'Sí, inmediato y sostenido durante la primera hora dorada', value: 'immediate_golden_hour' },
        { label: 'Sí, pero fue breve antes de las revisiones de enfermería', value: 'brief_initial' },
        { label: 'No fue posible de inmediato por atención médica de mamá o bebé', value: 'delayed_medical' },
        { label: 'El contacto piel con piel inicial lo realizó el papá / segundo cuidador', value: 'partner_contact' },
        { label: 'No lo recuerdo con certeza', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000007',
      chapter_id: 1,
      area_id: 2,
      area_name: 'Salud durante el periodo neonatal',
      question_code: 'Q-C01-007',
      question_text: '¿Presenté alguna complicación neonatal o requerí ingreso a Unidad de Cuidados Intermedios/Intensivos (UCIN)?',
      objective: 'Identificar factores de riesgo perinatales para el neurodesarrollo temprano.',
      response_type: 'single_choice',
      is_clinical: true,
      pediatric_alert_guidance: 'El paso por UCIN es un dato clave para que el pediatra supervise el calendario de seguimiento.',
      scientific_reference: 'AAP Section on Perinatal Pediatrics. Standards for Levels of Neonatal Care.',
      help_text: 'Anota si hubo fototerapia por ictericia, ayuda respiratoria o antibióticos.',
      sort_order: 7,
      options: [
        { label: 'No, pasó directamente a habitación conjunta con su madre', value: 'no_complications' },
        { label: 'Sí, requirió fototerapia por ictericia (sin pasar a intensivos)', value: 'phototherapy_only' },
        { label: 'Sí, ingresó a cuidados intermedios o UCIN durante algunos días', value: 'nicu_stay' },
        { label: 'No lo recuerdo / Prefiero consultar el historial', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000008',
      chapter_id: 1,
      area_id: 9,
      area_name: 'Desarrollo sensorial',
      question_code: 'Q-C01-008',
      question_text: '¿Cómo fueron los resultados de mis tamizajes neonatales (auditivo, metabólico, visual)?',
      objective: 'Verificar el descarte de hipoacusia congénita y alteraciones metabólicas.',
      response_type: 'multiple_choice',
      is_clinical: true,
      pediatric_alert_guidance: 'La detección precoz antes del 3er mes es crucial para el óptimo desarrollo del lenguaje.',
      scientific_reference: 'Joint Committee on Infant Hearing (JCIH 2019 Guidelines).',
      help_text: 'Marca todas las pruebas realizadas que hayan tenido resultado favorable.',
      sort_order: 8,
      options: [
        { label: 'Tamizaje auditivo pasado con éxito', value: 'hearing_passed' },
        { label: 'Tamizaje metabólico (prueba del talón) normal', value: 'metabolic_passed' },
        { label: 'Tamizaje visual (reflejo rojo pupilar) normal', value: 'visual_passed' },
        { label: 'Oximetría de pulso (cardiopatías) normal', value: 'cardiac_passed' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000009',
      chapter_id: 1,
      area_id: 4,
      area_name: 'Motricidad gruesa',
      question_code: 'Q-C01-009',
      question_text: 'En mis primeros días, ¿qué postura adoptaba mi cuerpo cuando estaba despierto y relajado?',
      objective: 'Evaluar el tono muscular y la flexión fisiológica armónica del recién nacido.',
      response_type: 'single_choice',
      is_clinical: true,
      pediatric_alert_guidance: 'Si el bebé se nota persistentemente flácido o arqueado hacia atrás, consúltalo con el pediatra.',
      scientific_reference: 'Amiel-Tison, C. Neurological Assessment of Tone and Primitive Reflexes.',
      help_text: 'Lo habitual es mantener brazos y piernas flexionados en postura de ranita.',
      sort_order: 9,
      options: [
        { label: 'Brazos y piernas flexionados con puños cerrados (Postura habitual)', value: 'physiological_flexion' },
        { label: 'Cuerpo muy laxo o estirado con poca resistencia (Tono bajo)', value: 'hypotonia_tendency' },
        { label: 'Cuerpo muy rígido o con arqueamiento constante de la espalda', value: 'hypertonia_tendency' },
        { label: 'No lo recuerdo / No lo observé con detalle', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000010',
      chapter_id: 1,
      area_id: 3,
      area_name: 'Desarrollo neurológico y cognitivo',
      question_code: 'Q-C01-010',
      question_text: '¿Cómo reaccionaba ante un sonido repentino o sensación de caída (Reflejo de Moro)?',
      objective: 'Observar la presencia y simetría del reflejo arcaico de Moro.',
      response_type: 'single_choice',
      is_clinical: true,
      pediatric_alert_guidance: 'Una respuesta asimétrica (un solo brazo) requiere valoración para descartar lesión del plexo braquial.',
      scientific_reference: 'CDC Milestone Surveillance & Nelson Textbook of Pediatrics (21st Ed).',
      help_text: 'Al sobresaltarse, el bebé extiende ambos brazos simétricamente hacia afuera y luego los recoge.',
      sort_order: 10,
      options: [
        { label: 'Abría ambos brazos simétricamente hacia afuera y luego los recogía', value: 'moro_symmetric' },
        { label: 'Movía un brazo con más fuerza que el otro al sobresaltarse', value: 'moro_asymmetric' },
        { label: 'Casi no se inmutaba ante ruidos o cambios de posición', value: 'moro_diminished' },
        { label: 'No lo recuerdo con claridad', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000011',
      chapter_id: 1,
      area_id: 11,
      area_name: 'Alimentación, sueño y hábitos',
      question_code: 'Q-C01-011',
      question_text: '¿Cómo se estableció mi alimentación durante las dos primeras semanas de vida?',
      objective: 'Registrar el patrón nutricional de inicio y el ritmo de succión/deglución.',
      response_type: 'single_choice',
      is_clinical: false,
      scientific_reference: 'AAP Policy Statement (2022). Breastfeeding and the Use of Human Milk.',
      help_text: 'Describe si fue lactancia materna, fórmula o mixta, y cómo fue la adaptación en casa.',
      sort_order: 11,
      options: [
        { label: 'Lactancia materna exclusiva', value: 'breastfeeding_exclusive' },
        { label: 'Lactancia mixta (leche materna y fórmula de inicio)', value: 'mixed_feeding' },
        { label: 'Fórmula infantil de inicio exclusiva', value: 'formula_exclusive' },
        { label: 'Alimentación asistida por sonda transitoria', value: 'tube_feeding' },
        { label: 'No lo recuerdo', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000012',
      chapter_id: 1,
      area_id: 6,
      area_name: 'Lenguaje y comunicación',
      question_code: 'Q-C01-012',
      question_text: '¿Cómo eran mis respuestas ante la luz, la voz de mis padres y los estímulos visuales cercanos?',
      objective: 'Evaluar la orientación sensorial primaria y la fijación visual a 20-30 cm.',
      response_type: 'single_choice',
      is_clinical: true,
      pediatric_alert_guidance: 'Los recién nacidos se calman al escuchar las voces familiares que oían dentro del vientre.',
      scientific_reference: 'Brazelton Neonatal Behavioral Assessment Scale (NBAS).',
      help_text: 'A 25 centímetros los bebés pueden enfocar el rostro humano con gran interés.',
      sort_order: 12,
      options: [
        { label: 'Fijaba la mirada a 25 cm y se calmaba notablemente al escuchar nuestras voces', value: 'orienting_well' },
        { label: 'Respondía a la voz pero le costaba sostener la mirada en los rostros', value: 'audio_responsive_only' },
        { label: 'Parecía muy irritable o indiferente ante luces y voces', value: 'low_responsiveness' },
        { label: 'No lo recuerdo', value: 'unknown' }
      ]
    },
    {
      id: 'a0000001-0000-0000-0000-000000000013',
      chapter_id: 1,
      area_id: 8,
      area_name: 'Desarrollo emocional',
      question_code: 'Q-C01-013',
      question_text: '¿Cómo se manifestaba mi llanto y de qué forma lograban calmarme y consolarme?',
      objective: 'Identificar los mecanismos de autorregulación y respuesta al consuelo parental.',
      response_type: 'open_text',
      is_clinical: false,
      scientific_reference: 'Barr, R.G. The Period of PURPLE Crying and Infant Soothability.',
      help_text: 'Cuenta si le calmaba el porteo, el arrullo, el sonido blanco o el pecho.',
      sort_order: 13,
      options: []
    },
    {
      id: 'a0000001-0000-0000-0000-000000000014',
      chapter_id: 1,
      area_id: 15,
      area_name: 'Recuerdos familiares y mensajes de futuro',
      question_code: 'Q-C01-014',
      question_text: '¿Cuál fue la anécdota o acontecimiento más divertido, caótico o conmovedor de nuestra primera semana juntos?',
      objective: 'Construir memoria narrativa con calidez y honestidad sobre la adaptación a la crianza.',
      response_type: 'open_text',
      is_clinical: false,
      scientific_reference: 'Fivaz-Depeursinge, E. The Primary Triangle: Systems View of Early Family Life.',
      help_text: 'El primer baño, el pañal rebelde o las risas en medio del cansancio nocturno.',
      sort_order: 14,
      options: []
    },
    {
      id: 'a0000001-0000-0000-0000-000000000015',
      chapter_id: 1,
      area_id: 15,
      area_name: 'Recuerdos familiares y mensajes de futuro',
      question_code: 'Q-C01-015',
      question_text: 'Nuestra promesa para ti: ¿Qué compromiso de amor y crianza te hicimos al cumplir tu primer mes?',
      objective: 'Registrar la carta de apego seguro que se imprimirá con diseño editorial en el libro.',
      response_type: 'letter_essay',
      is_clinical: false,
      scientific_reference: 'Bowlby, J. A Secure Base: Clinical Applications of Attachment Theory.',
      help_text: 'Estas palabras quedarán plasmadas en tu libro para que las leas cuando cumplas 18 años.',
      sort_order: 15,
      options: []
    }
  ],
  user_responses: {}, // key: `${child_id}:${question_id}` -> response record
  response_history: [],
  milestones_events: [],
  family_observations: []
};

// Inicializar conexión con PostgreSQL
async function initDb() {
  try {
    pool = new Pool(config.db);
    // Verificar conexión activa
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isPostgresAvailable = true;
    console.log(`[DB] Conectado exitosamente a PostgreSQL en ${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (err) {
    isPostgresAvailable = false;
    console.warn(`[DB AVISO] No se pudo conectar a PostgreSQL (${err.message}). Operando en modo Híbrido/Memoria de desarrollo local.`);
  }
}

// Inicialización asíncrona segura
initDb();

/**
 * Ejecuta una consulta SQL parametrizada a PostgreSQL, con fallback a memoria si la DB aún no está en línea.
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parámetros seguros contra inyección SQL
 */
async function query(text, params = []) {
  const start = Date.now();
  
  if (isPostgresAvailable && pool) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (config.env === 'development') {
        console.log('[DB SQL]', { query: text.substring(0, 80) + '...', duration: `${duration}ms`, rows: res.rowCount });
      }
      return res;
    } catch (dbErr) {
      console.error('[DB ERROR] Error en consulta SQL:', dbErr.message);
      throw dbErr;
    }
  }

  // Fallback simulado para desarrollo inmediato
  return executeMemoryQuery(text, params);
}

/**
 * Emulador semántico de consultas básicas para desarrollo local cuando PostgreSQL no está instalado
 */
function executeMemoryQuery(text, params) {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');

  // 1. SELECT perfil de hijo por id
  if (normalized.includes('from child_profiles') && (normalized.includes('where id =') || normalized.includes('where id='))) {
    const childId = params[0];
    const rows = memoryStore.child_profiles.filter(c => c.id === childId);
    return { rows, rowCount: rows.length };
  }

  // 2. SELECT perfiles de hijos por familia
  if (normalized.includes('from child_profiles') && (normalized.includes('where family_id =') || normalized.includes('where family_id='))) {
    const familyId = params[0];
    const rows = memoryStore.child_profiles.filter(c => c.family_id === familyId);
    return { rows, rowCount: rows.length };
  }

  // 3. SELECT lista de capítulos
  if (normalized.includes('from chapters')) {
    return { rows: memoryStore.chapters, rowCount: memoryStore.chapters.length };
  }

  // 4. SELECT preguntas de un capítulo
  if (normalized.includes('from questions') && normalized.includes('chapter_id')) {
    const chapterId = parseInt(params[0], 10);
    const rows = memoryStore.questions.filter(q => q.chapter_id === chapterId);
    return { rows, rowCount: rows.length };
  }

  // 5. SELECT respuestas de un niño para un capítulo
  if (normalized.includes('from user_responses') && normalized.includes('child_id')) {
    const childId = params[0];
    const chapterQuestions = memoryStore.questions.filter(q => q.chapter_id === parseInt(params[1], 10));
    const questionIds = new Set(chapterQuestions.map(q => q.id));

    const rows = Object.values(memoryStore.user_responses).filter(r => 
      r.child_id === childId && questionIds.has(r.question_id)
    );
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  query,
  isPostgresAvailable: () => isPostgresAvailable,
  memoryStore
};
