// ============================================================================
// VITACHRONICLE - PRUEBA INTEGRAL DE CRUD DE CATEGORÍAS Y PREGUNTAS EN NEON
// ============================================================================

const categoryService = require('../src/services/categoryService');
const questionService = require('../src/services/questionService');
const { Pool } = require('pg');
const config = require('../src/config/env');

async function testCrud() {
  console.log('🧪 Iniciando prueba de CRUD en Neon PostgreSQL...\n');

  try {
    // 1. Listar categorías existentes
    const initialCategories = await categoryService.getAllCategories();
    console.log(`✅ 1. Categorías iniciales obtenidas: ${initialCategories.length}`);

    // 2. Crear categoría de prueba
    const testCat = await categoryService.createCategory({
      name: 'Área de Prueba Neon Automática',
      code: `test_cat_${Date.now()}`,
      description: 'Categoría temporal para validación de CRUD',
      icon_name: '🧪'
    });
    console.log(`✅ 2. Categoría creada con éxito: ID ${testCat.id} - "${testCat.name}"`);

    // 3. Crear pregunta dentro de la nueva categoría
    const testQuestion = await questionService.createQuestion({
      area_id: testCat.id,
      chapter_id: 1,
      question_code: `Q-TEST-${Date.now().toString().slice(-4)}`,
      question_text: '¿El bebé responde con una sonrisa amplia al ver a sus cuidadores?',
      objective: 'Validar la interacción afectiva y el reflejo de sonrisa social',
      response_type: 'single_choice',
      is_clinical: true,
      pediatric_alert_guidance: 'Observar si hay contacto visual sostenido.',
      scientific_reference: 'Spitz (1946): El sonreír del lactante.',
      help_text: 'Describe cómo reacciona en momentos de juego.',
      sort_order: 1,
      options: ['Sí, con alegría y gorgoritos', 'A veces, según el momento', 'Rara vez sostiene la mirada']
    });
    console.log(`✅ 3. Pregunta creada con éxito: ID ${testQuestion.id} - Código: ${testQuestion.question_code}`);
    console.log(`      Opciones añadidas: ${testQuestion.options.length}`);

    // 4. Actualizar pregunta
    const updatedQuestion = await questionService.updateQuestion(testQuestion.id, {
      question_text: '¿El bebé responde con una sonrisa amplia y risas vocales al ver a sus cuidadores? (Editado)',
      options: ['Sí, frecuentemente', 'Solo en brazos', 'En evaluación']
    });
    console.log(`✅ 4. Pregunta actualizada: "${updatedQuestion.question_text}"`);

    // 5. Consultar pregunta por ID
    const fetched = await questionService.getQuestionById(testQuestion.id);
    console.log(`✅ 5. Pregunta consultada por ID: ${fetched.question_code} con ${fetched.options.length} opciones.`);

    // 6. Eliminar pregunta
    await questionService.deleteQuestion(testQuestion.id);
    console.log(`✅ 6. Pregunta eliminada con éxito.`);

    // 7. Eliminar categoría de prueba
    await categoryService.deleteCategory(testCat.id);
    console.log(`✅ 7. Categoría eliminada con éxito.`);

    console.log('\n🎉 ¡TODAS LAS OPERACIONES CRUD DE CATEGORÍAS Y PREGUNTAS FUNCIONAN PERFECTAMENTE EN NEON DB!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en prueba CRUD:', err);
    process.exit(1);
  }
}

testCrud();
