-- ============================================================================
-- PROYECTO: VITACHRONICLE - ECOSISTEMA DE REGISTRO DEL DESARROLLO INFANTIL
-- ARCHIVO: database/seed.sql
-- DESCRIPCIÓN: Datos iniciales maestros (Áreas, Etapas, Capítulos, Preguntas C1)
-- ============================================================================

-- 1. INSERTAR LAS 15 ÁREAS DEL DESARROLLO
INSERT INTO development_areas (id, code, name, description, icon_name) VALUES
(1, 'pregnancy_birth', 'Antecedentes del embarazo y nacimiento', 'Datos de gestación, controles prenatales, parto y adaptación inmediata.', 'baby-carriage'),
(2, 'neonatal_health', 'Salud durante el periodo neonatal', 'Somatometría inicial, APGAR, tamizajes y evolución en los primeros días.', 'heart-pulse'),
(3, 'neuro_cognitive', 'Desarrollo neurológico y cognitivo', 'Reflejos primitivos, atención, curiosidad, permanencia del objeto y resolución de problemas.', 'brain'),
(4, 'gross_motor', 'Motricidad gruesa', 'Control cefálico, sedestación, gateo, bipedestación, marcha, carrera y saltos.', 'person-walking'),
(5, 'fine_motor', 'Motricidad fina', 'Prensión palmar, pinza digital, coordinación ojo-mano, dibujo, uso de cubiertos y escritura.', 'hand'),
(6, 'language_comm', 'Lenguaje y comunicación', 'Balbuceo, primeras palabras, vocabulario expresivo, comprensión y pronunciación.', 'chat-bubble'),
(7, 'social_dev', 'Desarrollo social', 'Sonrisa social, apego, interacción con familiares, pares y personas desconocidas.', 'users'),
(8, 'emotional_dev', 'Desarrollo emocional', 'Expresión afectiva, modulación del llanto, tolerancia a la frustración y autorregulación.', 'face-smile'),
(9, 'sensory_dev', 'Desarrollo sensorial', 'Procesamiento de estímulos auditivos, visuales, táctiles, vestibulares y propioceptivos.', 'sparkles'),
(10, 'behavior_adapt', 'Comportamiento, atención y adaptación', 'Ritmos circadianos, temperamento, capacidad de enfoque y adaptación a transiciones.', 'target'),
(11, 'feeding_sleep', 'Alimentación, sueño y hábitos', 'Lactancia, alimentación complementaria, rutinas de sueño y ritmos biológicos.', 'moon'),
(12, 'autonomy_skills', 'Autonomía y habilidades cotidianas', 'Vestido, higiene personal, control de esfínteres y colaboración en el hogar.', 'star'),
(13, 'school_learning', 'Aprendizaje, vida escolar y talentos', 'Desarrollo académico, pensamiento lógico, creatividad, intereses y vocaciones.', 'book-open'),
(14, 'adolescence_identity', 'Adolescencia, identidad y relaciones', 'Identidad personal, autonomía moral, pensamiento abstracto y toma de decisiones.', 'compass'),
(15, 'family_memories', 'Recuerdos familiares y mensajes de futuro', 'Crónicas familiares, anécdotas, fotografías entrañables y cartas para la posteridad.', 'heart')
ON CONFLICT (id) DO NOTHING;

-- 2. INSERTAR ETAPAS DEL DESARROLLO
INSERT INTO development_stages (id, stage_code, name, age_min_months, age_max_months, sort_order) VALUES
(1, 'stage_neonatal', 'Periodo Perinatal y Neonatal (0 a 1 mes)', 0, 1, 1),
(2, 'stage_infancy_early', 'Lactante Menor (1 a 6 meses)', 1, 6, 2),
(3, 'stage_infancy_late', 'Lactante Mayor (7 a 12 meses)', 7, 12, 3),
(4, 'stage_toddler', 'Primera Infancia (1 a 3 años)', 12, 36, 4),
(5, 'stage_preschool', 'Etapa Preescolar (3 a 5 años)', 36, 60, 5),
(6, 'stage_school_early', 'Escolar Temprana (6 a 8 años)', 60, 96, 6),
(7, 'stage_school_late', 'Escolar Media (9 a 11 años)', 96, 132, 7),
(8, 'stage_adolescence_early', 'Adolescencia Temprana (12 a 14 años)', 132, 168, 8),
(9, 'stage_adolescence_late', 'Adolescencia Tardía (15 a 18 años)', 168, 216, 9),
(10, 'stage_timeless', 'Historia y Legado Familiar', 0, 216, 10)
ON CONFLICT (id) DO NOTHING;

-- 3. INSERTAR LOS 15 CAPÍTULOS DEL LIBRO
INSERT INTO chapters (id, chapter_number, stage_id, title, subtitle, introductory_quote, introductory_text, sort_order) VALUES
(1, 1, 1, 'Antes de conocerme: El origen y mis primeros días', 'Embarazo, nacimiento y el primer aliento', 'No naciste solo en una hora; naciste en cada pensamiento que tuvimos antes de verte.', 'Este capítulo guarda la emoción de tu llegada, cómo te soñamos y los primeros días en que tus ojos descubrieron nuestra luz.', 1),
(2, 2, 2, 'Mi primer mes: Descubriendo el mundo', 'La primera sonrisa y mis primeros ritmos', 'El asombro de reconocernos en una mirada.', 'Durante este mes aprendiste a sostener la mirada y nos regalaste tus primeras sonrisas.', 2),
(3, 3, 2, 'De los 2 a los 3 meses: Mis manos y mis sonidos', 'La sinfonía del balbuceo y el juego manual', 'Tus manos se abrieron para empezar a sentir la vida.', 'Tus gorgoritos llenaron la casa y tus manos dejaron de ser puños para volverse exploradoras.', 3),
(4, 4, 2, 'De los 4 a los 6 meses: El mundo a mi alcance', 'Rodar, agarrar y reír a carcajadas', 'Cada movimiento tuyo es una conquista.', 'Comenzaste a girar tu cuerpo, agarrar tus juguetes y saborear los primeros bocados.', 4),
(5, 5, 3, 'De los 7 a los 9 meses: Explorando mi espacio', 'Me siento solo y comienzo a conversar', 'El mundo empezó a ser tuyo cuando lograste sentarte.', 'Sentado sin ayuda conquistaste una nueva perspectiva, y tus primeras sílabas sonaron.', 5),
(6, 6, 3, 'De los 10 a los 12 meses: Mis primeros pasos', '¡Cumplo mi primer año de vida!', 'Un paso pequeño para el mundo, un salto inmenso para nuestro corazón.', 'El milagro de verte en dos pies y decir tus primeras palabras con sentido.', 6),
(7, 7, 4, 'De 1 a 2 años: El pequeño explorador', 'Autonomía, caminata y la explosión del lenguaje', 'Tus pasos se volvieron veloces y tu voz no paró de cantar.', 'Entre tropezones y risas, tu vocabulario creció y tu personalidad empezó a brillar.', 7),
(8, 8, 4, 'De 2 a 3 años: El poder de mi identidad', 'El "yo", la imaginación y mis primeros amigos', 'Descubrir que eres único en el universo.', 'La época de las frases complejas, la afirmación de tu voluntad y tus primeros juegos compartidos.', 8),
(9, 9, 5, 'De 3 a 5 años: La edad del asombro', 'Preguntas infinitas, creatividad y escuela infantil', 'La curiosidad es la chispa de todo lo que serás.', 'Tus preguntas sobre el sol, la luna y la vida nos enseñaron a mirar el mundo otra vez.', 9),
(10, 10, 6, 'De 6 a 8 años: Letras, números y amigos', 'Los primeros pasos en la escuela primaria', 'Aprender a leer es abrir las puertas del pensamiento.', 'Tu mochila, tus primeros libros leídos con orgullo y los amigos del recreo.', 10),
(11, 11, 7, 'De 9 a 11 años: Construyendo mi propia voz', 'Pensamiento crítico, talentos y grandes pasiones', 'Tus ideas ahora tienen profundidad y alas propias.', 'El momento en que descubriste tus talentos, tu sentido de la justicia y tus proyectos favoritos.', 11),
(12, 12, 8, 'De 12 a 14 años: La metamorfosis', 'Adolescencia temprana, cambios y nuevos caminos', 'Crecer duele a veces, pero florecer es inevitable.', 'Tu cuerpo cambiando, tu habitación como refugio y tus primeras preguntas profundas.', 12),
(13, 13, 9, 'De 15 a 18 años: El vuelo propio', 'Madurez, vocación y decisiones para el futuro', 'Te dimos raíces, ahora te entregamos tus alas.', 'Los últimos años de colegio, tus grandes metas y el adulto maravilloso en que te has convertido.', 13),
(14, 14, 10, 'Nuestras Raíces: La historia familiar', 'Árbol genealógico, orígenes y tradiciones', 'Para saber a dónde vas, nunca olvides de dónde vienes.', 'Las historias de tus abuelos, nuestros orígenes y los valores que viajan en tu sangre.', 14),
(15, 15, 10, 'Cartas para tu futuro: Cuando tengas 18 años', 'Palabras selladas de amor y esperanza', 'Un cofre del tesoro para abrir al cruzar la puerta de la adultez.', 'Mensajes íntimos de quienes caminaron contigo cada uno de estos dieciocho años.', 15)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERTAR PREGUNTAS DEL CAPÍTULO 1 (15 PREGUNTAS CIENTÍFICAMENTE RESPALDADAS)
INSERT INTO questions (
    id, chapter_id, area_id, question_code, question_text, objective, response_type,
    is_clinical, pediatric_alert_guidance, scientific_reference, help_text, sort_order
) VALUES
(
    'a0000001-0000-0000-0000-000000000001', 1, 15, 'Q-C01-001',
    '¿Cómo se vivió la noticia de mi llegada y qué sentimientos predominaron durante los primeros meses de gestación?',
    'Documentar el contexto psicosocial, la narrativa familiar de concepción y la historia de apego prenatal.',
    'open_text', FALSE, NULL,
    'Brazelton, T.B. (1990). The Earliest Relationship: Parents, Infants, and Early Attachment.',
    'Escribe con libertad: cómo se enteraron, qué hicieron ese día y qué soñaban para ti.', 1
),
(
    'a0000001-0000-0000-0000-000000000002', 1, 1, 'Q-C01-002',
    '¿A cuántas semanas de gestación ocurrió el nacimiento (edad gestacional)?',
    'Registrar la edad gestacional para evaluar prematurez y activar el cálculo de edad corregida.',
    'numeric_metric', TRUE,
    'Bebés nacidos antes de las 37 semanas requieren evaluación del neurodesarrollo con edad corregida hasta los 2 años.',
    'Organización Mundial de la Salud (OMS). Clasificación de la Prematurez y Salud Neonatal.',
    'Ingresa las semanas completas (ejemplo: 39 semanas).', 2
),
(
    'a0000001-0000-0000-0000-000000000003', 1, 1, 'Q-C01-003',
    '¿Qué tipo de parto permitió mi nacimiento?',
    'Conocer la vía de parto e instrumentalización para antecedentes perinatales.',
    'single_choice', TRUE, NULL,
    'American College of Obstetricians and Gynecologists (ACOG). Practice Bulletin No. 115.',
    'Selecciona la opción médica registrada en tu epicrisis o informe de parto.', 3
),
(
    'a0000001-0000-0000-0000-000000000004', 1, 2, 'Q-C01-004',
    '¿Cuáles fueron mis medidas antropométricas al momento de nacer (peso, talla y perímetro cefálico)?',
    'Registrar la somatometría neonatal basal para cálculo de percentiles de crecimiento.',
    'numeric_metric', TRUE,
    'Un peso inferior a 2.500g o superior a 4.000g al nacer debe ser seguido de cerca con el pediatra.',
    'OMS Child Growth Standards. Patrones de crecimiento infantil para recién nacidos.',
    'Indica el peso en gramos (ej. 3250), la longitud en cm (ej. 50.0) y el perímetro craneal en cm (ej. 34.5).', 4
),
(
    'a0000001-0000-0000-0000-000000000005', 1, 2, 'Q-C01-005',
    '¿Cuáles fueron mis puntuaciones en el Test de APGAR al primer minuto y a los cinco minutos?',
    'Evaluar la adaptación cardiorrespiratoria y el tono neonatal inmediato.',
    'numeric_metric', TRUE,
    'Puntuaciones menores de 7 a los 5 minutos ameritan seguimiento pediátrico preventivo.',
    'AAP & ACOG Committee Opinion No. 644: The Apgar Score.',
    'Consulta tu carné de vacunación o epicrisis médica. Son dos valores del 0 al 10.', 5
),
(
    'a0000001-0000-0000-0000-000000000006', 1, 7, 'Q-C01-006',
    '¿Pudimos realizar el contacto "Piel con Piel" durante la primera hora de vida (la Hora Dorada)?',
    'Documentar la instauración temprana del vínculo afectivo y la estabilidad térmica.',
    'single_choice', FALSE, NULL,
    'UNICEF / OMS. Early initiation of breastfeeding and skin-to-skin contact guidelines.',
    'El contacto piel con piel estabiliza la temperatura, la glucosa y calma al bebé.', 6
),
(
    'a0000001-0000-0000-0000-000000000007', 1, 2, 'Q-C01-007',
    '¿Presenté alguna complicación neonatal o requerí ingreso a Unidad de Cuidados Intermedios/Intensivos (UCIN)?',
    'Identificar factores de riesgo perinatales para el neurodesarrollo temprano.',
    'single_choice', TRUE,
    'El paso por UCIN es un dato clave para que el pediatra supervise el calendario de seguimiento.',
    'AAP Section on Perinatal Pediatrics. Standards for Levels of Neonatal Care.',
    'Anota si hubo fototerapia por ictericia, ayuda respiratoria o antibióticos.', 7
),
(
    'a0000001-0000-0000-0000-000000000008', 1, 9, 'Q-C01-008',
    '¿Cómo fueron los resultados de mis tamizajes neonatales (auditivo, metabólico, visual)?',
    'Verificar el descarte de hipoacusia congénita y alteraciones metabólicas.',
    'multiple_choice', TRUE,
    'La detección precoz antes del 3er mes es crucial para el óptimo desarrollo del lenguaje.',
    'Joint Committee on Infant Hearing (JCIH 2019 Guidelines).',
    'Marca todas las pruebas realizadas que hayan tenido resultado favorable.', 8
),
(
    'a0000001-0000-0000-0000-000000000009', 1, 4, 'Q-C01-009',
    'En mis primeros días, ¿qué postura adoptaba mi cuerpo cuando estaba despierto y relajado?',
    'Evaluar el tono muscular y la flexión fisiológica armónica del recién nacido.',
    'single_choice', TRUE,
    'Si el bebé se nota persistentemente flácido o arqueado hacia atrás, consúltalo con el pediatra.',
    'Amiel-Tison, C. Neurological Assessment of Tone and Primitive Reflexes.',
    'Lo habitual es mantener brazos y piernas flexionados en postura de ranita.', 9
),
(
    'a0000001-0000-0000-0000-000000000010', 1, 3, 'Q-C01-010',
    '¿Cómo reaccionaba ante un sonido repentino o sensación de caída (Reflejo de Moro)?',
    'Observar la presencia y simetría del reflejo arcaico de Moro.',
    'single_choice', TRUE,
    'Una respuesta asimétrica (un solo brazo) requiere valoración para descartar lesión del plexo braquial.',
    'CDC Milestone Surveillance & Nelson Textbook of Pediatrics (21st Ed).',
    'Al sobresaltarse, el bebé extiende ambos brazos simétricamente hacia afuera y luego los recoge.', 10
),
(
    'a0000001-0000-0000-0000-000000000011', 1, 11, 'Q-C01-011',
    '¿Cómo se estableció mi alimentación durante las dos primeras semanas de vida?',
    'Registrar el patrón nutricional de inicio y el ritmo de succión/deglución.',
    'single_choice', FALSE, NULL,
    'AAP Policy Statement (2022). Breastfeeding and the Use of Human Milk.',
    'Describe si fue lactancia materna, fórmula o mixta, y cómo fue la adaptación en casa.', 11
),
(
    'a0000001-0000-0000-0000-000000000012', 1, 6, 'Q-C01-012',
    '¿Cómo eran mis respuestas ante la luz, la voz de mis padres y los estímulos visuales cercanos?',
    'Evaluar la orientación sensorial primaria y la fijación visual a 20-30 cm.',
    'single_choice', TRUE,
    'Los recién nacidos se calman al escuchar las voces familiares que oían dentro del vientre.',
    'Brazelton Neonatal Behavioral Assessment Scale (NBAS).',
    'A 25 centímetros los bebés pueden enfocar el rostro humano con gran interés.', 12
),
(
    'a0000001-0000-0000-0000-000000000013', 1, 8, 'Q-C01-013',
    '¿Cómo se manifestaba mi llanto y de qué forma lograban calmarme y consolarme?',
    'Identificar los mecanismos de autorregulación y respuesta al consuelo parental.',
    'open_text', FALSE, NULL,
    'Barr, R.G. The Period of PURPLE Crying and Infant Soothability.',
    'Cuenta si le calmaba el porteo, el arrullo, el sonido blanco o el pecho.', 13
),
(
    'a0000001-0000-0000-0000-000000000014', 1, 15, 'Q-C01-014',
    '¿Cuál fue la anécdota o acontecimiento más divertido, caótico o conmovedor de nuestra primera semana juntos?',
    'Construir memoria narrativa con calidez y honestidad sobre la adaptación a la crianza.',
    'open_text', FALSE, NULL,
    'Fivaz-Depeursinge, E. The Primary Triangle: Systems View of Early Family Life.',
    'El primer baño, el pañal rebelde o las risas en medio del cansancio nocturno.', 14
),
(
    'a0000001-0000-0000-0000-000000000015', 1, 15, 'Q-C01-015',
    'Nuestra promesa para ti: ¿Qué compromiso de amor y crianza te hicimos al cumplir tu primer mes?',
    'Registrar la carta de apego seguro que se imprimirá con diseño editorial en el libro.',
    'letter_essay', FALSE, NULL,
    'Bowlby, J. A Secure Base: Clinical Applications of Attachment Theory.',
    'Estas palabras quedarán plasmadas en tu libro para que las leas cuando cumplas 18 años.', 15
)
ON CONFLICT (id) DO NOTHING;

-- 5. OPCIONES PREDEFINIDAS PARA PREGUNTAS DE SELECCIÓN
-- Opciones para Q-C01-003 (Tipo de parto)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000003', 'Parto vaginal espontáneo (eutócico)', 'vaginal_spontaneous', 1),
('a0000001-0000-0000-0000-000000000003', 'Parto vaginal asistido (vacum / fórceps)', 'vaginal_assisted', 2),
('a0000001-0000-0000-0000-000000000003', 'Cesárea de urgencia', 'cesarean_emergency', 3),
('a0000001-0000-0000-0000-000000000003', 'Cesárea programada', 'cesarean_scheduled', 4),
('a0000001-0000-0000-0000-000000000003', 'Parto humanizado en agua', 'water_birth', 5),
('a0000001-0000-0000-0000-000000000003', 'No lo recuerdo / Prefiero no indicar', 'unknown', 6);

-- Opciones para Q-C01-006 (Piel con piel)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000006', 'Sí, inmediato y sostenido durante la primera hora dorada', 'immediate_golden_hour', 1),
('a0000001-0000-0000-0000-000000000006', 'Sí, pero fue breve antes de las revisiones de enfermería', 'brief_initial', 2),
('a0000001-0000-0000-0000-000000000006', 'No fue posible de inmediato por atención médica de mamá o bebé', 'delayed_medical', 3),
('a0000001-0000-0000-0000-000000000006', 'El contacto piel con piel inicial lo realizó el papá / segundo cuidador', 'partner_contact', 4),
('a0000001-0000-0000-0000-000000000006', 'No lo recuerdo con certeza', 'unknown', 5);

-- Opciones para Q-C01-007 (Complicaciones neonatales / UCIN)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000007', 'No, pasó directamente a habitación conjunta con su madre', 'no_complications', 1),
('a0000001-0000-0000-0000-000000000007', 'Sí, requirió fototerapia por ictericia (sin pasar a intensivos)', 'phototherapy_only', 2),
('a0000001-0000-0000-0000-000000000007', 'Sí, ingresó a cuidados intermedios o UCIN durante algunos días', 'nicu_stay', 3),
('a0000001-0000-0000-0000-000000000007', 'No lo recuerdo / Prefiero consultar el historial', 'unknown', 4);

-- Opciones para Q-C01-009 (Tono y postura)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000009', 'Brazos y piernas flexionados con puños cerrados (Postura habitual)', 'physiological_flexion', 1),
('a0000001-0000-0000-0000-000000000009', 'Cuerpo muy laxo o estirado con poca resistencia (Tono bajo)', 'hypotonia_tendency', 2),
('a0000001-0000-0000-0000-000000000009', 'Cuerpo muy rígido o con arqueamiento constante de la espalda', 'hypertonia_tendency', 3),
('a0000001-0000-0000-0000-000000000009', 'No lo recuerdo / No lo observé con detalle', 'unknown', 4);

-- Opciones para Q-C01-010 (Reflejo de Moro)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000010', 'Abría ambos brazos simétricamente hacia afuera y luego los recogía', 'moro_symmetric', 1),
('a0000001-0000-0000-0000-000000000010', 'Movía un brazo con más fuerza que el otro al sobresaltarse', 'moro_asymmetric', 2),
('a0000001-0000-0000-0000-000000000010', 'Casi no se inmutaba ante ruidos o cambios de posición', 'moro_diminished', 3),
('a0000001-0000-0000-0000-000000000010', 'No lo recuerdo con claridad', 'unknown', 4);

-- Opciones para Q-C01-011 (Alimentación inicial)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000011', 'Lactancia materna exclusiva', 'breastfeeding_exclusive', 1),
('a0000001-0000-0000-0000-000000000011', 'Lactancia mixta (leche materna y fórmula de inicio)', 'mixed_feeding', 2),
('a0000001-0000-0000-0000-000000000011', 'Fórmula infantil de inicio exclusiva', 'formula_exclusive', 3),
('a0000001-0000-0000-0000-000000000011', 'Alimentación asistida por sonda transitoria', 'tube_feeding', 4),
('a0000001-0000-0000-0000-000000000011', 'No lo recuerdo', 'unknown', 5);

-- Opciones para Q-C01-012 (Respuestas visuales y sensoriales)
INSERT INTO question_options (question_id, label, value, sort_order) VALUES
('a0000001-0000-0000-0000-000000000012', 'Fijaba la mirada a 25 cm y se calmaba notablemente al escuchar nuestras voces', 'orienting_well', 1),
('a0000001-0000-0000-0000-000000000012', 'Respondía a la voz pero le costaba sostener la mirada en los rostros', 'audio_responsive_only', 2),
('a0000001-0000-0000-0000-000000000012', 'Parecía muy irritable o indiferente ante luces y voces', 'low_responsiveness', 3),
('a0000001-0000-0000-0000-000000000012', 'No lo recuerdo', 'unknown', 4);

-- 6. DATOS DE DEMOSTRACIÓN (FAMILIA Y PERFIL PARA PRUEBAS INMEDIATAS)
INSERT INTO families (id, family_name) VALUES
('f0000001-0000-0000-0000-000000000001', 'Familia Morales Gómez')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, family_id, full_name, email, password_hash, role) VALUES
('b0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'Carolina Gómez', 'carolina@vitachronicle.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890demoHashPassword', 'primary_parent')
ON CONFLICT (id) DO NOTHING;

INSERT INTO child_profiles (
    id, family_id, first_name, last_name, preferred_name,
    birth_date, birth_time, due_date, is_preterm, gestational_weeks, gestational_days,
    gender, blood_type, birth_hospital, pediatrician_name, pediatrician_contact
) VALUES
(
    'c0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001',
    'Sofía', 'Morales Gómez', 'Sofi',
    '2026-03-15', '08:42:00', '2026-03-22', FALSE, 39, 2,
    'female', 'O+', 'Clínica del Country, Bogotá', 'Dra. Claudia Rodríguez', '+57 310 987 6543'
)
ON CONFLICT (id) DO NOTHING;
