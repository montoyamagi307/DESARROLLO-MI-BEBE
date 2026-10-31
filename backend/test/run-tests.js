// ============================================================================
// VITACHRONICLE - SUITE DE PRUEBAS AUTOMATIZADAS DEL SISTEMA
// ARCHIVO: backend/test/run-tests.js
// EJECUCIÓN: node test/run-tests.js
// ============================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { calculateAges } = require('../src/services/childService');
const { validateResponse } = require('../src/validators/responseValidator');
const responseService = require('../src/services/responseService');
const questionService = require('../src/services/questionService');
const pdfService = require('../src/services/pdfService');

async function runTestSuite() {
  console.log('🧪 Iniciando Suite de Pruebas Automatizadas de VitaChronicle...\n');
  let passed = 0;
  let failed = 0;

  function test(description, fn) {
    try {
      fn();
      console.log(`  ✅ PASÓ: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FALLÓ: ${description}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(description, fn) {
    try {
      await fn();
      console.log(`  ✅ PASÓ: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FALLÓ: ${description}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. PRUEBA: Cálculo de Edad Cronológica y Edad Corregida
  test('Cálculo de edad para niño nacido a término (sin edad corregida)', () => {
    const res = calculateAges('2026-01-15', null, false);
    assert.strictEqual(res.correctedAge, null);
    assert(res.chronologicalAge.totalDays >= 0);
  });

  test('Cálculo de edad corregida para prematuro', () => {
    // Nació el 1 de enero pero debía nacer el 1 de marzo
    const res = calculateAges('2026-01-01', '2026-03-01', true);
    assert.notStrictEqual(res.correctedAge, null);
    assert.strictEqual(res.correctedAge.applicable, true);
  });

  // 2. PRUEBA: Validador de Respuestas
  test('Validador acepta respuesta con "No lo sé / No lo recuerdo"', () => {
    const questionMeta = { response_type: 'open_text' };
    const payload = {
      is_unknown_or_na: true,
      unknown_na_reason: 'dont_remember',
      parent_notes: 'Preguntaremos al pediatra'
    };
    const res = validateResponse(payload, questionMeta);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.sanitizedValue.is_unknown_or_na, true);
  });

  test('Validador rechaza respuesta de selección única vacía', () => {
    const questionMeta = { response_type: 'single_choice' };
    const payload = { value: '', is_unknown_or_na: false };
    const res = validateResponse(payload, questionMeta);
    assert.strictEqual(res.isValid, false);
  });

  test('Sanitización elimina etiquetas script potencialmente maliciosas', () => {
    const questionMeta = { response_type: 'open_text' };
    const payload = {
      value: 'Hermoso momento <script>alert("hack")</script> de nacimiento',
      is_unknown_or_na: false
    };
    const res = validateResponse(payload, questionMeta);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.sanitizedValue.value.includes('<script>'), false);
  });

  // 3. PRUEBA: Guardado de Respuestas y Control de Versiones
  await asyncTest('Guardado inicial de respuesta crea versión 1', async () => {
    const childId = 'c0000001-0000-0000-0000-000000000001';
    const questionId = 'a0000001-0000-0000-0000-000000000001';
    const payload = {
      value: 'Fue un día soleado de inmensa felicidad.',
      is_unknown_or_na: false,
      parent_notes: 'Estaban los abuelos esperando afuera.'
    };

    const res = await responseService.saveResponse({
      childId,
      questionId,
      payload,
      userId: 'u0000001-0000-0000-0000-000000000001',
      editReason: 'Prueba inicial'
    });

    assert.strictEqual(res.version, 1);
  });

  await asyncTest('Segunda edición de respuesta incrementa versión a 2', async () => {
    const childId = 'c0000001-0000-0000-0000-000000000001';
    const questionId = 'a0000001-0000-0000-0000-000000000001';
    const payload = {
      value: 'Fue un día soleado de inmensa felicidad, llegaron tíos y primos.',
      is_unknown_or_na: false,
      parent_notes: 'Edición con más detalles familiares.'
    };

    const res = await responseService.saveResponse({
      childId,
      questionId,
      payload,
      userId: 'u0000001-0000-0000-0000-000000000001',
      editReason: 'Añadidos detalles familiares'
    });

    assert.strictEqual(res.version, 2);
  });

  // 4. PRUEBA: Generación de PDF del Capítulo 1
  await asyncTest('Generador de PDF compila el Capítulo 1 en archivo válido', async () => {
    const childId = 'c0000001-0000-0000-0000-000000000001';
    const pdfRes = await pdfService.generateChapterPdf(childId, 1);
    
    assert(fs.existsSync(pdfRes.filePath), 'El archivo PDF debe existir físicamente.');
    const stats = fs.statSync(pdfRes.filePath);
    assert(stats.size > 1000, 'El archivo PDF debe tener un peso superior a 1KB.');
    assert(pdfRes.pageCount >= 3, 'El PDF debe generar múltiples páginas maquetadas.');
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO DE LA SUITE: ${passed} pasadas, ${failed} fallidas.`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTestSuite().catch(err => {
    console.error('Error fatal en la ejecución de pruebas:', err);
    process.exit(1);
  });
}

module.exports = { runTestSuite };
