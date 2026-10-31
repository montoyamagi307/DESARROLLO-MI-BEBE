# VitaChronicle: Ecosistema de Libro y Aplicación para el Desarrollo Infantil (0 a 18 Años)

> **"La historia de tu desarrollo, contada por quienes más te aman y guiada por la ciencia."**

VitaChronicle es una solución integral que combina un **libro personalizado de encuadernación editorial** con una **aplicación digital inteligente** para que los padres documenten y comprendan la evolución de sus hijos desde el primer día de vida hasta la mayoría de edad (18 años).

---

## 🛠️ Tecnologías del Proyecto

| Capa | Tecnología | Justificación y Rol |
| :--- | :--- | :--- |
| **Frontend** | **React + JavaScript** | Interfaz reactiva, cálida y adaptable (móviles, tabletas y computadores). Formularios dinámicos por edad, progreso y previsualizador del libro. |
| **Backend** | **Node.js + Express.js** | API REST escalable, validación de datos, control de versiones, cálculo de edad corregida para prematuros y motor editorial. |
| **Base de Datos** | **PostgreSQL 14+** | Almacenamiento relacional estricto con 15 entidades, llaves foráneas, índices GIN, auditoría inmutable de respuestas (`response_history`) y soporte multi-hijo. |
| **Generador PDF** | **PDFKit (Node.js)** | Compilación vectorial en tiempo real, márgenes para encuadernación física (300 DPI), sin dependencias de navegadores externos. |
| **Lenguaje** | **JavaScript Puro** | Lenguaje unificado en todo el proyecto (Frontend y Backend) sin TypeScript, garantizando coherencia y facilidad de mantenimiento. |

---

## 📁 Estructura del Código

```
IA/
├── backend/                             # Servidor Node.js y API REST
│   ├── .env.example                     # Variables de entorno de muestra
│   ├── package.json                     # Dependencias (Express, pg, pdfkit, cors, helmet)
│   ├── src/
│   │   ├── app.js                       # Configuración de Express, middlewares y seguridad
│   │   ├── server.js                    # Punto de entrada HTTP (Puerto 5000)
│   │   ├── config/env.js                # Variables de entorno centralizadas
│   │   ├── database/db.js               # Conexión pg.Pool y fallback resiliente para pruebas locales
│   │   ├── controllers/                 # Controladores: child, question, response, book
│   │   ├── routes/                      # Rutas REST de la API
│   │   ├── services/                    # Lógica de negocio (childService, pdfService, etc.)
│   │   └── validators/                  # Validación clínica y sanitización de respuestas
│   └── test/
│       └── run-tests.js                 # Suite de pruebas automatizadas del sistema
│
├── database/                            # Persistencia y Migraciones SQL
│   ├── schema.sql                       # DDL completo con 15 tablas relacionales y restricciones
│   ├── seed.sql                         # Semillas maestras: 15 áreas, 15 capítulos, preguntas del C1
│   └── docker-compose.yml               # Despliegue en 1 clic de PostgreSQL 16 con carga de scripts
│
├── frontend/                            # Aplicación Cliente React
│   ├── package.json                     # Scripts y dependencias de React
│   ├── standalone-preview.html          # Demo interactivo 100% funcional ejecutable en cualquier navegador
│   ├── public/
│   │   └── index.html                   # HTML con fuentes Google Fonts (Playfair Display & Jakarta Sans)
│   └── src/
│       ├── index.js                     # Punto de entrada de renderizado React 18
│       ├── App.js                       # Estado global, navegación por etapas y modal del libro
│       ├── api/client.js                # Cliente HTTP para comunicación con el backend
│       ├── components/                  # Navbar, ChapterNav, QuestionnaireForm, BookPreview, Timeline
│       └── styles/app.css               # Sistema de diseño editorial, tokens y responsividad
│
└── docs/                                # Documentación Técnica y Pediátrica
    ├── ARCHITECTURE_AND_API.md          # Diagramas de arquitectura, modelo ER y catálogo de endpoints
    └── master_blueprint_infant_development.md # Especificación clínica, principios bioéticos y banco Q C1
```

---

## 🚀 Guía Rápida de Instalación y Ejecución Local

### Opción A: Prueba Inmediata sin Instalaciones (¡En 5 Segundos!)
Si deseas probar la interfaz de usuario, la navegación por los 15 capítulos, el llenado de preguntas con autosave y la previsualización editorial del libro de inmediato:
1. Navega a la carpeta `frontend/`.
2. Haz doble clic en el archivo [`standalone-preview.html`](file:///c:/Users/MARGARITA/OneDrive/IA/frontend/standalone-preview.html) para abrirlo en tu navegador favorito (Chrome, Edge, Firefox, Safari).
3. Podrás interactuar con todas las funcionalidades de manera fluida.

---

### Opción B: Ejecución Completa con Node.js y PostgreSQL

#### Paso 1: Instalar Node.js (si aún no está instalado en Windows)
Abre PowerShell y ejecuta:
```powershell
winget install OpenJS.NodeJS.LTS
```
*(O descarga el instalador oficial desde [nodejs.org](https://nodejs.org/))*.

#### Paso 2: Iniciar la Base de Datos PostgreSQL
Si tienes Docker:
```powershell
cd database
docker compose up -d
```
O si tienes PostgreSQL instalado localmente:
```powershell
psql -U postgres -f database/schema.sql
psql -U postgres -d vitachronicle_db -f database/seed.sql
```

#### Paso 3: Ejecutar las Pruebas Automatizadas del Backend
```powershell
cd backend
npm install
npm test
```
*Valida automáticamente el cálculo de edad pediátrica, la sanitización de entradas, el control de versiones en las respuestas y la generación del PDF con PDFKit.*

#### Paso 4: Iniciar el Servidor Backend
```powershell
cd backend
npm start
```
*El servidor estará activo en `http://localhost:5000/api`.*

#### Paso 5: Iniciar el Cliente React
En una nueva terminal:
```powershell
cd frontend
npm install
npm start
```
*La aplicación web se abrirá automáticamente en `http://localhost:3000`.*

---

## 📋 Hitos y Capítulos del Libro (0 a 18 Años)

1. **Capítulo 1:** Antes de conocerme: El origen y mis primeros días (Embarazo, nacimiento y primer aliento).
2. **Capítulo 2:** Mi primer mes: Descubriendo el mundo (La primera sonrisa social).
3. **Capítulo 3:** De los 2 a los 3 meses: Mis manos y mis sonidos (La sinfonía del balbuceo).
4. **Capítulo 4:** De los 4 a los 6 meses: El mundo a mi alcance (Rodar, agarrar y reír).
5. **Capítulo 5:** De los 7 a los 9 meses: Explorando mi espacio (Sedestación y primeras sílabas).
6. **Capítulo 6:** De los 10 a los 12 meses: Mis primeros pasos (¡Cumplo mi primer año de vida!).
7. **Capítulo 7:** De 1 a 2 años: El pequeño explorador (Autonomía y explosión del lenguaje).
8. **Capítulo 8:** De 2 a 3 años: El poder de mi identidad (El yo, la voluntad y el juego simbólico).
9. **Capítulo 9:** De 3 a 5 años: La edad del asombro (Preguntas infinitas y vida preescolar).
10. **Capítulo 10:** De 6 a 8 años: Letras, números y amigos (La escuela primaria).
11. **Capítulo 11:** De 9 a 11 años: Construyendo mi propia voz (Pensamiento crítico e intereses).
12. **Capítulo 12:** De 12 a 14 años: La metamorfosis (Adolescencia temprana y cambios corporales).
13. **Capítulo 13:** De 15 a 18 años: El vuelo propio (Madurez, vocación y decisiones para el futuro).
14. **Capítulo 14:** Nuestras Raíces: La historia familiar (Árbol genealógico, orígenes y tradiciones).
15. **Capítulo 15:** Cartas para tu futuro: Cuando tengas 18 años (Palabras selladas para la adultez).

---

## 🛡️ Cumplimiento Legal y Privacidad de Menores
- Conforme a la **Ley 1581 de 2012 de Colombia** y el **RGPD (Art. 8)**, el tratamiento de datos de niños, niñas y adolescentes cuenta con protección constitucional reforzada.
- Ninguna fotografía o dato médico se expone públicamente.
- Todos los formularios de preguntas pediátricas incorporan avisos de vigilancia del desarrollo orientativa, enfatizando la consulta regular con el pediatra tratante sin emitir diagnósticos automáticos.
