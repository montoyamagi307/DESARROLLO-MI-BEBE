# ARQUITECTURA TÉCNICA Y ESPECIFICACIÓN DE API: VITACHRONICLE

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

VitaChronicle opera bajo un patrón desacoplado en tres capas (**Three-Tier Architecture**), diseñado para alta disponibilidad, seguridad estricta para datos de menores de edad y generación de documentos editoriales sin latencia perceptible.

```mermaid
graph TD
    subgraph "Capa de Presentación (Frontend)"
        ClientBrowser["Navegador Web / Móvil / Tablet"]
        ReactApp["React 18 SPA (Vanilla CSS Tokens)"]
        ClientBrowser <--> ReactApp
    end

    subgraph "Capa de Aplicación y Servicios (Backend Node.js)"
        APIGateway["Express.js HTTP API (Port 5000)"]
        SecMiddleware["Security Layer: Helmet + CORS + RateLimiter + JWT"]
        Controllers["Controllers: Child, Question, Response, Book"]
        Services["Domain Services: Calculation, Validation, History, PDFKit"]
        
        ReactApp -->|HTTP / JSON via TLS 1.3| APIGateway
        APIGateway --> SecMiddleware
        SecMiddleware --> Controllers
        Controllers --> Services
    end

    subgraph "Capa de Persistencia y Almacenamiento"
        DBPool["pg.Pool (Conexión Parametrizada)"]
        Postgres[(PostgreSQL 14+ Relacional)]
        FileStore["Almacenamiento Local Cifrado / S3 Assets"]
        
        Services --> DBPool
        DBPool --> Postgres
        Services -->|Streams de PDF y Medios| FileStore
    end
```

---

## 2. DIAGRAMA DE COMPONENTES DEL BACKEND Y FRONTEND

```mermaid
graph LR
    subgraph "Frontend Components (React)"
        App["App.js (Estado Global)"]
        Nav["Navbar.js (Selector y Acciones)"]
        Sidebar["ChapterNav.js (15 Capítulos)"]
        Form["QuestionnaireForm.js (Auto-save)"]
        InputComp["DynamicQuestionInput.js (Tipos Dinámicos)"]
        Preview["BookPreview.js (Maquetación)"]
        Timeline["TimelineView.js (Hitos)"]

        App --> Nav
        App --> Sidebar
        App --> Form
        Form --> InputComp
        App --> Preview
        App --> Timeline
    end

    subgraph "Backend Modules (Node.js & Express)"
        Server["server.js / app.js"]
        Routes["routes/ (children, questions, responses, books)"]
        Validators["responseValidator.js (Sanitización)"]
        ResService["responseService.js (Versionado)"]
        ChildService["childService.js (Edad Corregida)"]
        PDFService["pdfService.js (Motor PDFKit)"]
        Database["db.js (pg.Pool / Fallback Local)"]

        Server --> Routes
        Routes --> Validators
        Routes --> ResService
        Routes --> ChildService
        Routes --> PDFService
        ResService --> Database
        ChildService --> Database
    end
```

---

## 3. MODELO ENTIDAD-RELACIÓN EN POSTGRESQL

```mermaid
erDiagram
    FAMILIES ||--o{ USERS : "posee"
    FAMILIES ||--o{ CHILD_PROFILES : "registra"
    CHILD_PROFILES ||--o{ USER_RESPONSES : "contiene"
    CHILD_PROFILES ||--o{ MILESTONES_EVENTS : "experimenta"
    CHILD_PROFILES ||--o{ MEDIA_ASSETS : "guarda"
    CHILD_PROFILES ||--o{ FAMILY_OBSERVATIONS : "recibe"
    CHILD_PROFILES ||--o{ GENERATED_BOOK_VERSIONS : "genera"

    DEVELOPMENT_STAGES ||--o{ CHAPTERS : "agrupa"
    CHAPTERS ||--o{ QUESTIONS : "incluye"
    DEVELOPMENT_AREAS ||--o{ QUESTIONS : "clasifica"
    QUESTIONS ||--o{ QUESTION_OPTIONS : "ofrece"
    QUESTIONS ||--o{ USER_RESPONSES : "es_respondida_en"

    USER_RESPONSES ||--o{ RESPONSE_HISTORY : "registra_auditoría"
    USERS ||--o{ PRIVACY_CONSENTS : "otorga"

    FAMILIES {
        uuid id PK
        varchar family_name
        timestamp created_at
    }
    CHILD_PROFILES {
        uuid id PK
        uuid family_id FK
        varchar first_name
        varchar last_name
        date birth_date
        time birth_time
        date due_date
        boolean is_preterm
        int gestational_weeks
        varchar blood_type
    }
    QUESTIONS {
        uuid id PK
        int chapter_id FK
        int area_id FK
        varchar question_code UK
        text question_text
        text objective
        varchar response_type
        boolean is_clinical
        text scientific_reference
    }
    USER_RESPONSES {
        uuid id PK
        uuid child_id FK
        uuid question_id FK
        jsonb response_value
        boolean is_unknown_or_na
        text parent_notes
        int current_version
        timestamp updated_at
    }
    RESPONSE_HISTORY {
        bigserial id PK
        uuid response_id FK
        int version
        jsonb response_value
        boolean is_unknown_or_na
        text parent_notes
        text edit_reason
        timestamp recorded_at
    }
```

---

## 4. CATÁLOGO DOCUMENTADO DE ENDPOINTS DE LA API

### 4.1. Comprobación del Sistema (Health Check)
- **Ruta:** `GET /api/health`
- **Descripción:** Monitorea el estado operativo del servicio y la conectividad a PostgreSQL.
- **Respuesta (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-17T11:45:00.000Z",
  "postgresConnected": true,
  "environment": "development"
}
```

---

### 4.2. Perfiles Infantiles
- **Listar Hijos de una Familia:** `GET /api/children?familyId={familyId}`
- **Detalle de un Hijo con Edad Pediátrica:** `GET /api/children/:id`
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "c0000001-0000-0000-0000-000000000001",
    "first_name": "Sofía",
    "last_name": "Morales Gómez",
    "birth_date": "2026-03-15",
    "gestational_weeks": 39,
    "is_preterm": false,
    "ages": {
      "chronologicalAge": {
        "totalDays": 30,
        "months": 1,
        "formattedText": "1 mes"
      },
      "correctedAge": null
    }
  }
}
```

---

### 4.3. Capítulos y Banco de Preguntas
- **Listar los 15 Capítulos:** `GET /api/chapters`
- **Obtener Preguntas de un Capítulo:** `GET /api/chapters/:chapterId/questions`
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "chapterId": 1,
  "count": 15,
  "data": [
    {
      "id": "a0000001-0000-0000-0000-000000000001",
      "question_code": "Q-C01-001",
      "area_name": "Recuerdos familiares y mensajes de futuro",
      "question_text": "¿Cómo se vivió la noticia de mi llegada...?",
      "objective": "Documentar el contexto psicosocial...",
      "response_type": "open_text",
      "is_clinical": false,
      "scientific_reference": "Brazelton, T.B. (1990). The Earliest Relationship.",
      "options": []
    }
  ]
}
```

---

### 4.4. Respuestas y Cuestionarios
- **Consultar Respuestas y Progreso:** `GET /api/responses/children/:childId/chapters/:chapterId`
- **Guardar / Actualizar Respuesta:** `POST /api/responses/children/:childId/questions/:questionId`
- **Payload de Entrada (`POST`):**
```json
{
  "payload": {
    "value": "Nos enteramos con una inmensa felicidad y gratitud.",
    "is_unknown_or_na": false,
    "parent_notes": "Anotación de la madre en el primer mes."
  },
  "editReason": "Añadidos detalles familiares"
}
```
- **Respuesta (201 Created / 200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "version": 2,
    "status": "updated",
    "message": "Respuesta actualizada y versión archivada."
  }
}
```

---

### 4.5. Generación y Descarga del Libro Editorial en PDF
- **Generar PDF del Capítulo:** `POST /api/books/generate/:childId/:chapterId`
- **Descargar Archivo PDF:** `GET /api/books/download/:filename`
- **Respuesta (200 OK con Content-Type: `application/pdf`):** Stream de descarga directa para el usuario.

---

## 5. RECOMENDACIONES DE DESPLIEGUE, SEGURIDAD Y COPIAS DE SEGURIDAD

1. **Cumplimiento de Privacidad de Menores (Ley 1581 de 2012 - Colombia):**
   - No se almacenan fotografías en texto claro ni con acceso público por URL sin firma temporal.
   - Los datos sensibles de salud infantil se cifran en reposo con AES-256.
   - Se provee endpoint de descarga integral de datos (JSON estructurado + ZIP) y derecho al olvido.
2. **Estrategia de Respaldos (Backups de PostgreSQL):**
   - Dump nocturno automatizado: `pg_dump -Fc -Z 9 vitachronicle_db > backup_$(date +%Y%m%d).dump`.
   - Cifrado GPG del archivo de volcado antes de subir a almacenamiento frío (*cold storage*).
   - Retención: 30 días diarios, 12 meses mensuales, y prueba de restauración trimestral automatizada.
3. **Escalabilidad y Despliegue Cloud:**
   - Frontend: Alojado en CDN estático (Vercel, Cloudflare Pages o AWS S3 + CloudFront).
   - Backend: Contenedores stateless en AWS ECS Fargate, Google Cloud Run o Render.
   - Base de Datos: PostgreSQL gestionado en AWS RDS o Supabase con réplica de lectura.
