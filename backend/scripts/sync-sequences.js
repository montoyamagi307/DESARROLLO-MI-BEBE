// ============================================================================
// SINCRONIZACIÓN DE SECUENCIAS SERIAL EN NEON POSTGRESQL
// Corrige el error: duplicate key value violates unique constraint "development_areas_pkey"
// ============================================================================

const { Pool } = require('pg');
const config = require('../src/config/env');

async function syncSequences() {
  const pool = new Pool({
    ...config.db,
    connectionTimeoutMillis: 30000
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado a Neon DB para sincronizar secuencias...');

    const tables = ['development_areas', 'chapters', 'development_stages', 'question_options'];

    for (const table of tables) {
      const res = await client.query(`
        SELECT pg_get_serial_sequence('${table}', 'id') as seq_name,
               COALESCE(MAX(id), 0) as max_id
        FROM ${table};
      `);
      const { seq_name, max_id } = res.rows[0];
      if (seq_name) {
        await client.query(`SELECT setval('${seq_name}', ${Math.max(parseInt(max_id, 10), 1)});`);
        console.log(`  ✓ Secuencia '${seq_name}' sincronizada en ${Math.max(parseInt(max_id, 10), 1)}`);
      }
    }

    client.release();
    await pool.end();
    console.log('🎉 Todas las secuencias fueron sincronizadas.');
  } catch (err) {
    console.error('❌ Error sincronizando secuencias:', err.message);
    await pool.end();
    process.exit(1);
  }
}

syncSequences();
