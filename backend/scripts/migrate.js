// ============================================================================
// VITACHRONICLE - SCRIPT DE MIGRACIÓN Y CREACIÓN DE TABLAS EN POSTGRESQL (NEON)
// ARCHIVO: backend/scripts/migrate.js
// ============================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../src/config/env');

async function runMigration() {
  console.log('================================================================');
  console.log('🚀 Iniciando proceso de migración para VitaChronicle en Neon DB');
  console.log(`📡 Host: ${config.db.host}:${config.db.port}`);
  console.log(`🗄️  Base de datos: ${config.db.database}`);
  console.log(`👤 Usuario: ${config.db.user}`);
  console.log('================================================================\n');

  const pool = new Pool({
    ...config.db,
    connectionTimeoutMillis: 30000, // Permitir tiempo para cold start de Neon
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conexión establecida exitosamente con PostgreSQL en Neon.\n');

    // 1. Leer y preparar schema.sql
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo de esquema en: ${schemaPath}`);
    }

    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Convertir a CREATE TABLE / INDEX IF NOT EXISTS para máxima idempotencia y seguridad
    schemaSql = schemaSql.replace(/CREATE TABLE\s+(?!IF NOT EXISTS)/gi, 'CREATE TABLE IF NOT EXISTS ');
    schemaSql = schemaSql.replace(/CREATE INDEX\s+(?!IF NOT EXISTS)/gi, 'CREATE INDEX IF NOT EXISTS ');
    schemaSql = schemaSql.replace(/CREATE TRIGGER\s+([a-zA-Z0-9_]+)\s+BEFORE\s+UPDATE\s+ON\s+([a-zA-Z0-9_]+)/gi, 'DROP TRIGGER IF EXISTS $1 ON $2;\nCREATE TRIGGER $1 BEFORE UPDATE ON $2');

    console.log('📋 Ejecutando creación de esquema (tablas, índices, triggers)...');
    await client.query(schemaSql);
    
    // Asegurar columnas nuevas en migraciones evolutivas
    await client.query(`
      ALTER TABLE development_areas 
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
    `);
    console.log('✅ Esquema creado o actualizado con éxito.\n');

    // 2. Verificar si existen datos maestros en development_areas
    const checkResult = await client.query('SELECT COUNT(*) FROM development_areas');
    const areasCount = parseInt(checkResult.rows[0].count, 10);

    if (areasCount === 0) {
      console.log('🌱 Base de datos vacía detectada. Insertando semillas (seed.sql)...');
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSql);
        console.log('✅ Semillas insertadas correctamente.');
      }
    } else {
      console.log(`ℹ️  Ya existen ${areasCount} categorías/áreas en development_areas. Omitiendo seed inicial para preservar datos.`);
    }

    // Sincronizar secuencias seriales (evita error duplicate key constraint)
    const tablesToSync = ['development_areas', 'chapters', 'development_stages', 'question_options'];
    for (const tbl of tablesToSync) {
      const sRes = await client.query(`SELECT pg_get_serial_sequence('${tbl}', 'id') as seq_name, COALESCE(MAX(id), 0) as max_id FROM ${tbl};`);
      const { seq_name, max_id } = sRes.rows[0];
      if (seq_name) {
        await client.query(`SELECT setval('${seq_name}', ${Math.max(parseInt(max_id, 10), 1)});`);
      }
    }
    console.log('✅ Secuencias seriales sincronizadas.');

    // 3. Listar y verificar las tablas creadas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 TABLAS ACTIVAS EN LA BASE DE DATOS:');
    tablesResult.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    client.release();
    await pool.end();

    console.log('\n🎉 ¡Migración completada con éxito!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    if (err.stack) console.error(err.stack);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
