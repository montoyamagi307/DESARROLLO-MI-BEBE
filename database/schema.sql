-- ============================================================================
-- PROYECTO: VITACHRONICLE - ECOSISTEMA DE REGISTRO DEL DESARROLLO INFANTIL
-- ARCHIVO: database/schema.sql
-- DESCRIPCIÓN: Esquema Relacional de Base de Datos en PostgreSQL
-- COMPATIBILIDAD: PostgreSQL 14+
-- CUMPLIMIENTO: Ley 1581 de 2012 (Colombia) / GDPR (Privacidad de Menores)
-- ============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLA: FAMILIAS (family_groups)
-- Agrupa a los cuidadores y sus hijos para compartir acceso seguro.
-- ----------------------------------------------------------------------------
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: USUARIOS (users)
-- Padres, madres y cuidadores autorizados.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'parent' CHECK (role IN ('primary_parent', 'parent', 'family_member', 'admin')),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 3. TABLA: PERFILES DE LOS HIJOS (child_profiles)
-- Cada hijo registrado con sus datos natales para cómputo de edad cronológica y corregida.
-- ----------------------------------------------------------------------------
CREATE TABLE child_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_name VARCHAR(100),
    birth_date DATE NOT NULL,
    birth_time TIME,
    due_date DATE, -- Fecha Probable de Parto (clave para edad corregida)
    is_preterm BOOLEAN DEFAULT FALSE,
    gestational_weeks INT CHECK (gestational_weeks BETWEEN 20 AND 44),
    gestational_days INT CHECK (gestational_days BETWEEN 0 AND 6),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
    blood_type VARCHAR(10),
    birth_hospital VARCHAR(200),
    pediatrician_name VARCHAR(150),
    pediatrician_contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_child_profiles_family_id ON child_profiles(family_id);

-- ----------------------------------------------------------------------------
-- 4. TABLA: ÁREAS DEL DESARROLLO (development_areas)
-- Las 15 áreas del neurodesarrollo y afectivas especificadas.
-- ----------------------------------------------------------------------------
CREATE TABLE development_areas (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    is_visible BOOLEAN DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: ETAPAS DEL DESARROLLO (development_stages)
-- Segmentos etarios desde el periodo prenatal hasta los 18 años.
-- ----------------------------------------------------------------------------
CREATE TABLE development_stages (
    id SERIAL PRIMARY KEY,
    stage_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    age_min_months INT NOT NULL,
    age_max_months INT NOT NULL,
    sort_order INT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. TABLA: CAPÍTULOS DEL LIBRO (chapters)
-- Los 15 capítulos editoriales del libro personalizable.
-- ----------------------------------------------------------------------------
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    chapter_number INT UNIQUE NOT NULL,
    stage_id INT REFERENCES development_stages(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(255),
    introductory_quote TEXT,
    introductory_text TEXT,
    sort_order INT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: CATÁLOGO DE PREGUNTAS (questions)
-- Banco maestro compartido de preguntas clínicas, observacionales y afectivas.
-- ----------------------------------------------------------------------------
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    area_id INT NOT NULL REFERENCES development_areas(id) ON DELETE RESTRICT,
    question_code VARCHAR(50) UNIQUE NOT NULL,
    question_text TEXT NOT NULL,
    objective TEXT NOT NULL,
    response_type VARCHAR(50) NOT NULL CHECK (
        response_type IN ('open_text', 'single_choice', 'multiple_choice', 'date', 'approx_age', 'numeric_metric', 'frequency_scale', 'letter_essay')
    ),
    is_clinical BOOLEAN DEFAULT FALSE,
    pediatric_alert_guidance TEXT,
    scientific_reference TEXT,
    help_text TEXT,
    sort_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX idx_questions_area_id ON questions(area_id);
CREATE INDEX idx_questions_code ON questions(question_code);

-- ----------------------------------------------------------------------------
-- 8. TABLA: OPCIONES DE RESPUESTA (question_options)
-- Opciones normalizadas para preguntas de selección única o múltiple.
-- ----------------------------------------------------------------------------
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    value VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL
);

CREATE INDEX idx_question_options_qid ON question_options(question_id);

-- ----------------------------------------------------------------------------
-- 9. TABLA: RESPUESTAS VIGENTES DE LOS USUARIOS (user_responses)
-- Guarda la respuesta actual para cada pregunta y niño, garantizando idempotencia.
-- ----------------------------------------------------------------------------
CREATE TABLE user_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    response_value JSONB, -- Almacena texto, número, objetos estructurados o arrays según response_type
    is_unknown_or_na BOOLEAN DEFAULT FALSE, -- "No lo sé" / "No lo recuerdo" / "No aplica"
    unknown_na_reason VARCHAR(50) CHECK (unknown_na_reason IN ('dont_know', 'dont_remember', 'not_applicable', NULL)),
    parent_notes TEXT, -- Campo para observaciones adicionales
    current_version INT NOT NULL DEFAULT 1,
    created_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
    last_updated_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_child_question UNIQUE (child_id, question_id)
);

CREATE INDEX idx_user_responses_child_id ON user_responses(child_id);
CREATE INDEX idx_user_responses_question_id ON user_responses(question_id);
CREATE INDEX idx_user_responses_jsonb ON user_responses USING GIN (response_value);

-- ----------------------------------------------------------------------------
-- 10. TABLA: HISTORIAL DE MODIFICACIONES (response_history)
-- Auditoría inmutable de cambios para trazabilidad clínica y recuperación.
-- ----------------------------------------------------------------------------
CREATE TABLE response_history (
    id BIGSERIAL PRIMARY KEY,
    response_id UUID NOT NULL REFERENCES user_responses(id) ON DELETE CASCADE,
    version INT NOT NULL,
    response_value JSONB,
    is_unknown_or_na BOOLEAN,
    parent_notes TEXT,
    edited_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
    edit_reason TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_response_history_response_id ON response_history(response_id);

-- ----------------------------------------------------------------------------
-- 11. TABLA: HITOS Y ACONTECIMIENTOS CRONOLÓGICOS (milestones_events)
-- Línea de tiempo de eventos especiales (primer diente, primer día de clase, etc.).
-- ----------------------------------------------------------------------------
CREATE TABLE milestones_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    area_id INT REFERENCES development_areas(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE,
    is_approximate_date BOOLEAN DEFAULT FALSE,
    approximate_age_text VARCHAR(100),
    is_highlighted_for_book BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_child_id ON milestones_events(child_id);
CREATE INDEX idx_milestones_date ON milestones_events(event_date);

-- ----------------------------------------------------------------------------
-- 12. TABLA: ARCHIVOS MULTIMEDIA (media_assets)
-- Referencias seguras a fotos y videos (sin almacenar binarios pesados en PostgreSQL).
-- ----------------------------------------------------------------------------
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    chapter_id INT REFERENCES chapters(id) ON DELETE SET NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'local_private', -- 'local_private' | 's3' | 'gcs'
    storage_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width_pixels INT,
    height_pixels INT,
    caption TEXT,
    taken_at TIMESTAMP WITH TIME ZONE,
    is_cover_photo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_assets_child_id ON media_assets(child_id);
CREATE INDEX idx_media_assets_chapter_id ON media_assets(chapter_id);

-- ----------------------------------------------------------------------------
-- 13. TABLA: OBSERVACIONES Y CARTAS FAMILIARES (family_observations)
-- Cartas, reflexiones libres y recuerdos familiares.
-- ----------------------------------------------------------------------------
CREATE TABLE family_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    author_relation VARCHAR(100) NOT NULL, -- 'Mamá', 'Papá', 'Abuela', etc.
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    display_in_book BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_family_obs_child_chapter ON family_observations(child_id, chapter_id);

-- ----------------------------------------------------------------------------
-- 14. TABLA: VERSIONES DEL LIBRO GENERADO (generated_book_versions)
-- Histórico de PDFs exportados para descarga e impresión.
-- ----------------------------------------------------------------------------
CREATE TABLE generated_book_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    chapter_id INT REFERENCES chapters(id) ON DELETE SET NULL, -- NULL si es el libro completo (todos los capítulos)
    version_label VARCHAR(50) NOT NULL,
    pdf_storage_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    total_pages INT NOT NULL,
    generation_type VARCHAR(50) DEFAULT 'single_chapter' CHECK (generation_type IN ('single_chapter', 'full_book', 'print_ready')),
    generated_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_book_versions_child ON generated_book_versions(child_id);

-- ----------------------------------------------------------------------------
-- 15. TABLA: PREFERENCIAS DE PRIVACIDAD Y CONSENTIMIENTOS (privacy_consents)
-- Cumplimiento estricto de la Ley 1581 de Colombia / Habeas Data para menores.
-- ----------------------------------------------------------------------------
CREATE TABLE privacy_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    consent_version VARCHAR(20) NOT NULL,
    pediatric_surveillance_accepted BOOLEAN DEFAULT TRUE,
    cloud_backup_accepted BOOLEAN DEFAULT TRUE,
    third_party_sharing_blocked BOOLEAN DEFAULT TRUE, -- Siempre TRUE para menores
    ip_address_hash VARCHAR(100),
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- TRIGGER AUTOMÁTICO: Actualización de 'updated_at'
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_child_profiles_updated_at BEFORE UPDATE ON child_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_user_responses_updated_at BEFORE UPDATE ON user_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_family_observations_updated_at BEFORE UPDATE ON family_observations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
