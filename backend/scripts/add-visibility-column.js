// ============================================================================
// AÑADIR COLUMNA is_visible EN development_areas (NEON POSTGRESQL)
// Permite ocultar o mostrar categorías en la parte principal (Senderos de Amor)
// ============================================================================

const { Pool } = require('pg');
const config = require('../src/config/env');

async function addVisibilityColumn() {
  const pool = new Pool({
    ...config.db,
    connectionTimeoutMillis: 30000
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado a Neon PostgreSQL...');

    // 1. Añadir columna si no existe
    await client.query(`
      ALTER TABLE development_areas 
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
    `);
    console.log('  ✓ Columna is_visible verificada/añadida en development_areas');

    // 2. Por defecto: marcar visibles las 4 de Senderos de Amor y las creadas por el usuario,
    // y ocultar las 15 fichas clínicas del libro a menos que el usuario las active
    await client.query(`
      UPDATE development_areas 
      SET is_visible = TRUE 
      WHERE code IN ('motor', 'language', 'social', 'habits');
    `);

    await client.query(`
      UPDATE development_areas 
      SET is_visible = FALSE 
      WHERE code NOT IN ('motor', 'language', 'social', 'habits') AND id <= 15;
    `);

    const res = await client.query(`
      SELECT id, code, name, is_visible 
      FROM development_areas 
      ORDER BY CASE WHEN code IN ('motor', 'language', 'social', 'habits') THEN 0 ELSE 1 END, id ASC;
    `);

    console.log('\n📊 ESTADO ACTUAL DE VISIBILIDAD DE CATEGORÍAS:');
    res.rows.forEach(r => {
      console.log(`  ${r.is_visible ? '👁️ [VISIBLE]' : '🙈 [OCULTA ]'} ID ${r.id}: ${r.name} (${r.code})`);
    });

    client.release();
    await pool.end();
    console.log('\n🎉 ¡Migración de visibilidad completada con éxito!');
  } catch (err) {
    console.error('❌ Error en migración de visibilidad:', err);
    await pool.end();
    process.exit(1);
  }
}

addVisibilityColumn();
