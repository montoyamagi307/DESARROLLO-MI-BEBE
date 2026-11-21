// ============================================================================
// CONFIGURACIÓN DE SENDEROS DE AMOR EN NEON POSTGRESQL
// Integra las 4 grandes categorías y sus hitos evolutivos en development_areas y questions
// ============================================================================

const { Pool } = require('pg');
const config = require('../src/config/env');

const senderosData = [
  {
    code: 'motor',
    name: 'Movimiento y Cuerpo',
    icon: '🏃',
    description: 'De los reflejos del recién nacido a la carrera y la coordinación',
    milestones: [
      {
        code: 'Q-MOT-001',
        title: 'Reflejos Arcaicos de Bienvenida',
        window: 'Primeras 4 semanas',
        science: 'CDC / Amiel-Tison: Tono flexor fisiológico y reflejo de Moro.',
        desc: 'Brazos y piernas en flexión protectora. Respuesta de sobresalto simétrica.',
        is_clinical: true,
        guidance: 'Observar simetría en brazos al sobresaltarse.'
      },
      {
        code: 'Q-MOT-002',
        title: 'Control de la Cabeza (Sostén Cefálico)',
        window: '2 a 4 meses',
        science: 'AAP Milestone Surveillance: Control de cuello y mirada en 90°.',
        desc: 'Levanta la cabeza y el pecho cuando está boca abajo explorando su alrededor.',
        is_clinical: true,
        guidance: 'A los 4 meses debe sostener la cabeza firme al estar sentado.'
      },
      {
        code: 'Q-MOT-003',
        title: 'Descubrimiento de las Manos y Agarre Voluntario',
        window: '3 a 5 meses',
        science: 'Piaget: Coordinación óculo-manual.',
        desc: 'Tus manos se abrieron y comenzaron a agarrar objetos voluntariamente.',
        is_clinical: false
      },
      {
        code: 'Q-MOT-004',
        title: 'Rodamiento Autónomo (Girar sobre sí mismo)',
        window: '4 a 6 meses',
        science: 'OMS Motor Milestones: Rotación del eje corporal.',
        desc: 'Rodar de boca arriba a boca abajo, transformando el suelo en su primer territorio.',
        is_clinical: false
      },
      {
        code: 'Q-MOT-005',
        title: 'Sedestación Independiente (Sentarse sin Apoyo)',
        window: '6 a 8 meses',
        science: 'AAP: Liberación de las dos manos para manipular juguetes.',
        desc: 'Sentarse con la espalda erguida permite ver en 3D y deja ambas manos libres.',
        is_clinical: true,
        guidance: 'Debe lograr sentarse sin apoyo hacia los 8-9 meses.'
      },
      {
        code: 'Q-MOT-006',
        title: 'El Viaje del Gateo y la Independencia Espacial',
        window: '7 a 10 meses',
        science: 'Pikler: Movimiento contralateral y maduración del cuerpo calloso.',
        desc: 'Arrastrarse o gatear para ir a donde desea por iniciativa propia.',
        is_clinical: false
      },
      {
        code: 'Q-MOT-007',
        title: 'Bipedestación y los Primeros Pasos Libres',
        window: '10 a 15 meses',
        science: 'OMS: Rango de marcha autónoma.',
        desc: 'Ponerse en dos pies, mantener el balance y dar esos primeros pasos hacia los brazos de mamá o papá.',
        is_clinical: false
      }
    ]
  },
  {
    code: 'language',
    name: 'Lenguaje y Comunicación',
    icon: '🗣️',
    description: 'Del primer llanto y la mirada a la conversación y las ideas propias',
    milestones: [
      {
        code: 'Q-LANG-001',
        title: 'La Mirada Mutua y Reconocimiento de Voces',
        window: '0 a 2 meses',
        science: 'Brazelton: Orientación preferencial hacia la voz familiar.',
        desc: 'Fija la mirada en los ojos del cuidador a 25 cm y se calma al oír sus voces.',
        is_clinical: true,
        guidance: 'Fijación de la mirada y seguimiento ocular.'
      },
      {
        code: 'Q-LANG-002',
        title: 'La Sinfonía del Gorjeo y Balbuceo',
        window: '2 a 4 meses',
        science: 'Kuhl: Protoconversación y producción de sonidos vocálicos.',
        desc: 'Primeros intercambios vocales en turno conversacional.',
        is_clinical: false
      },
      {
        code: 'Q-LANG-003',
        title: 'Señalar con el Dedo y Atención Conjunta',
        window: '8 a 10 meses',
        science: 'Tomasello: Revolución de los 9 meses.',
        desc: 'Apunta con el dedo índice para compartir con el adulto lo que ve.',
        is_clinical: true,
        guidance: 'El señalamiento protodeclarativo es un hito de comunicación clave.'
      },
      {
        code: 'Q-LANG-004',
        title: 'La Primera Palabra con Sentido',
        window: '10 a 14 meses',
        science: 'AAP: Palabras intencionales con significado.',
        desc: 'El instante en que los sonidos se convierten en lenguaje propio.',
        is_clinical: false
      }
    ]
  },
  {
    code: 'social',
    name: 'Vínculo y Afectividad',
    icon: '💖',
    description: 'Del apego seguro inicial a la empatía, la amistad y la identidad',
    milestones: [
      {
        code: 'Q-SOC-001',
        title: 'La Hora Dorada y Contacto Piel con Piel',
        window: 'Minuto cero de vida',
        science: 'UNICEF: Estabilidad cardiorrespiratoria y vínculo.',
        desc: 'Sentir el corazón y la respiración de mamá y papá al nacer.',
        is_clinical: false
      },
      {
        code: 'Q-SOC-002',
        title: 'La Primera Sonrisa Social Intencional',
        window: '5 a 8 semanas',
        science: 'Spitz: Primer organizador de la psique humana.',
        desc: 'Una sonrisa deliberada que conecta profundamente un alma con otra.',
        is_clinical: true,
        guidance: 'La sonrisa social debe emerger entre la 6ta y 8va semana.'
      },
      {
        code: 'Q-SOC-003',
        title: 'Angustia del Octavo Mes (El Regalo de Extrañar)',
        window: '7 a 9 meses',
        science: 'Bowlby: Conciencia de separación y apego selectivo.',
        desc: 'Llora cuando mamá se aleja; prueba biológica del apego seguro consolidado.',
        is_clinical: false
      }
    ]
  },
  {
    code: 'habits',
    name: 'Autonomía y Vida Diaria',
    icon: '🌿',
    description: 'Alimentación, sueño, hábitos y el cuidado de sí mismo',
    milestones: [
      {
        code: 'Q-HAB-001',
        title: 'Instauración de los Ritmos de Alimentación y Sueño',
        window: 'Primeras 6 semanas',
        science: 'AAP: Diferenciación día/noche.',
        desc: 'Transición hacia los primeros ciclos estables de descanso.',
        is_clinical: false
      },
      {
        code: 'Q-HAB-002',
        title: 'Nuevos Sabores (Alimentación Complementaria)',
        window: '6 a 12 meses',
        science: 'OMS: Introducción segura de sólidos respetando saciedad.',
        desc: 'Descubrir el sabor del aguacate y comer con sus propias manos.',
        is_clinical: false
      }
    ]
  }
];

async function setupSenderos() {
  const pool = new Pool({
    ...config.db,
    connectionTimeoutMillis: 30000
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado a Neon PostgreSQL para configurar Senderos de Amor...');

    for (let i = 0; i < senderosData.length; i++) {
      const s = senderosData[i];

      // Insertar o actualizar la categoría
      let areaId;
      const existRes = await client.query('SELECT id FROM development_areas WHERE code = $1', [s.code]);
      
      if (existRes.rows.length > 0) {
        areaId = existRes.rows[0].id;
        await client.query(
          'UPDATE development_areas SET name = $1, icon_name = $2, description = $3 WHERE id = $4',
          [s.name, s.icon, s.description, areaId]
        );
        console.log(`  ✓ Categoría actualizada: ID ${areaId} - "${s.name}"`);
      } else {
        const insertRes = await client.query(
          'INSERT INTO development_areas (code, name, icon_name, description) VALUES ($1, $2, $3, $4) RETURNING id',
          [s.code, s.name, s.icon, s.description]
        );
        areaId = insertRes.rows[0].id;
        console.log(`  ✓ Categoría creada: ID ${areaId} - "${s.name}"`);
      }

      // Insertar o actualizar cada hito / pregunta dentro de esta categoría
      for (let j = 0; j < s.milestones.length; j++) {
        const m = s.milestones[j];
        const qExist = await client.query('SELECT id FROM questions WHERE question_code = $1', [m.code]);

        if (qExist.rows.length > 0) {
          await client.query(`
            UPDATE questions 
            SET area_id = $1, question_text = $2, objective = $3, help_text = $4,
                scientific_reference = $5, is_clinical = $6, pediatric_alert_guidance = $7,
                sort_order = $8
            WHERE id = $9
          `, [
            areaId, m.title, m.desc, m.window, m.science,
            Boolean(m.is_clinical), m.guidance || null, j + 1, qExist.rows[0].id
          ]);
        } else {
          await client.query(`
            INSERT INTO questions (
              chapter_id, area_id, question_code, question_text, objective,
              response_type, is_clinical, pediatric_alert_guidance, scientific_reference,
              help_text, sort_order, is_active
            ) VALUES (1, $1, $2, $3, $4, 'open_text', $5, $6, $7, $8, $9, TRUE)
          `, [
            areaId, m.code, m.title, m.desc,
            Boolean(m.is_clinical), m.guidance || null, m.science, m.window, j + 1
          ]);
        }
      }
      console.log(`    ↳ ${s.milestones.length} hitos/preguntas configurados en "${s.name}"`);
    }

    // Sincronizar secuencias seriales al final
    const sRes = await client.query(`SELECT pg_get_serial_sequence('development_areas', 'id') as seq_name, COALESCE(MAX(id), 0) as max_id FROM development_areas;`);
    const { seq_name, max_id } = sRes.rows[0];
    if (seq_name) {
      await client.query(`SELECT setval('${seq_name}', ${Math.max(parseInt(max_id, 10), 1)});`);
      console.log(`  ✓ Secuencia de development_areas sincronizada en ${max_id}`);
    }

    client.release();
    await pool.end();
    console.log('\n🎉 ¡Categorías e hitos de Senderos de Amor configurados exitosamente en Neon DB!');
  } catch (err) {
    console.error('❌ Error configurando Senderos:', err);
    await pool.end();
    process.exit(1);
  }
}

setupSenderos();
