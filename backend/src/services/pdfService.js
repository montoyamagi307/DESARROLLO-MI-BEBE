// ============================================================================
// VITACHRONICLE - MOTOR EDITORIAL DE GENERACIÓN DE LIBRO EN PDF
// ARCHIVO: backend/src/services/pdfService.js
// ============================================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const config = require('../config/env');
const childService = require('./childService');
const questionService = require('./questionService');
const responseService = require('./responseService');

/**
 * Asegura que el directorio de salida de PDFs exista
 */
function ensurePdfDir() {
  if (!fs.existsSync(config.storage.pdfDir)) {
    fs.mkdirSync(config.storage.pdfDir, { recursive: true });
  }
}

/**
 * Genera el documento PDF editorial del Capítulo 1 para un niño específico.
 * @param {string} childId - ID del perfil infantil
 * @param {number} chapterId - ID del capítulo (por defecto 1)
 * @returns {Promise<{ filePath: string, filename: string, pageCount: number }>}
 */
async function generateChapterPdf(childId, chapterId = 1) {
  ensurePdfDir();

  // 1. Obtener datos del niño
  const child = await childService.getChildById(childId);
  if (!child) {
    throw new Error(`Perfil infantil con ID ${childId} no encontrado.`);
  }

  // 2. Obtener preguntas y respuestas del capítulo
  const chapters = await questionService.getAllChapters();
  const currentChapter = chapters.find(c => c.id === parseInt(chapterId, 10)) || chapters[0];
  const questions = await questionService.getQuestionsByChapter(chapterId);
  const { responses } = await responseService.getResponsesForChildAndChapter(childId, chapterId);

  // 3. Crear documento PDFKit (A4, márgenes de encuadernación editorial)
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 50 },
    info: {
      Title: `VitaChronicle - ${currentChapter.title} - ${child.first_name}`,
      Author: 'VitaChronicle Editorial Engine',
      Subject: 'Libro Personalizado de Neurodesarrollo Infantil'
    },
    bufferPages: true
  });

  const timestamp = Date.now();
  const filename = `vitachronicle_ch${chapterId}_${child.first_name.toLowerCase()}_${timestamp}.pdf`;
  const filePath = path.join(config.storage.pdfDir, filename);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Paleta de Colores Editoriales VitaChronicle
  const colors = {
    primary: '#2D4A43',     // Verde bosque profundo / salvia oscuro
    secondary: '#C97D60',   // Terracota cálido
    accent: '#E3B505',      // Dorado mostaza
    textDark: '#1E293B',    // Pizarra oscuro
    textMuted: '#64748B',   // Gris neutro
    cardBg: '#F8FAF9',      // Blanco crema suave
    border: '#E2E8F0'       // Gris borde suave
  };

  // ========================================================================
  // PÁGINA 1: PORTADILLA DE CAPÍTULO
  // ========================================================================
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FBFBFA');

  // Adorno superior
  doc.rect(60, 60, doc.page.width - 110, 6).fill(colors.secondary);

  doc.moveDown(5);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.secondary)
     .text(`CAPÍTULO ${currentChapter.chapter_number}`.toUpperCase(), { align: 'center', characterSpacing: 2 });
  
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(26).fillColor(colors.primary)
     .text(currentChapter.title, { align: 'center', lineGap: 6 });

  doc.moveDown(1);
  doc.font('Helvetica-Oblique').fontSize(13).fillColor(colors.textMuted)
     .text(currentChapter.subtitle || '', { align: 'center' });

  doc.moveDown(3);
  doc.rect(80, doc.y, doc.page.width - 160, 70).fillAndStroke(colors.cardBg, colors.border);
  
  const quoteY = doc.y + 16;
  doc.font('Helvetica-Oblique').fontSize(11).fillColor(colors.textDark)
     .text(`"${currentChapter.introductory_quote || 'Cada paso en tu crecimiento es un regalo infinito.'}"`, 95, quoteY, {
       width: doc.page.width - 190,
       align: 'center'
     });

  doc.y = quoteY + 65;
  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.primary)
     .text(`HISTORIA DE VIDA DE:`, { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(20).fillColor(colors.secondary)
     .text(`${child.first_name} ${child.last_name}`, { align: 'center' });

  doc.moveDown(1);
  doc.font('Helvetica').fontSize(10).fillColor(colors.textMuted)
     .text(`Nacimiento: ${child.birth_date} • ${child.birth_hospital || 'Clínica de Nacimiento'}`, { align: 'center' });

  // ========================================================================
  // PÁGINA 2: ACTA DE LLEGADA AL MUNDO Y ANTECEDENTES
  // ========================================================================
  doc.addPage();
  renderHeader(doc, currentChapter.title, child.first_name, colors);

  doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.primary)
     .text('Acta de Llegada y Primeras Mediciones');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10).fillColor(colors.textMuted)
     .text('Datos registrados sobre las primeras horas de vida y antecedentes perinatales.');
  doc.moveDown(1.5);

  // Tarjeta somatométrica
  const cardY = doc.y;
  doc.rect(60, cardY, doc.page.width - 110, 80).fillAndStroke('#F1F5F3', colors.primary);

  const colWidth = (doc.page.width - 130) / 4;
  renderMetricCell(doc, 70 + colWidth * 0, cardY + 15, 'SEMANAS DE GESTACIÓN', `${child.gestational_weeks || 39} semanas`, colors);
  renderMetricCell(doc, 70 + colWidth * 1, cardY + 15, 'GRUPO SANGUÍNEO', child.blood_type || 'O+', colors);
  renderMetricCell(doc, 70 + colWidth * 2, cardY + 15, 'TIPO DE PARTO', formatValue(responses['a0000001-0000-0000-0000-000000000003']?.response_value, 'Vaginal espontáneo'), colors);
  renderMetricCell(doc, 70 + colWidth * 3, cardY + 15, 'HORA DE NACIMIENTO', child.birth_time || '08:42 AM', colors);

  doc.y = cardY + 100;

  // Pregunta 1: Noticia de la llegada
  renderQuestionBlock(
    doc,
    'La Noticia de tu Llegada',
    questions.find(q => q.question_code === 'Q-C01-001'),
    responses['a0000001-0000-0000-0000-000000000001'],
    colors
  );

  // Pregunta 6: Hora dorada / Piel con piel
  renderQuestionBlock(
    doc,
    'Nuestro Primer Contacto: Piel con Piel',
    questions.find(q => q.question_code === 'Q-C01-006'),
    responses['a0000001-0000-0000-0000-000000000006'],
    colors
  );

  // ========================================================================
  // PÁGINA 3: VIGILANCIA DEL NEURODESARROLLO NEONATAL
  // ========================================================================
  doc.addPage();
  renderHeader(doc, currentChapter.title, child.first_name, colors);

  doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.primary)
     .text('Primeros Hitos del Neurodesarrollo y Reflejos');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10).fillColor(colors.textMuted)
     .text('Observaciones basadas en los estándares de la AAP y la OMS para las primeras 4 semanas.');
  doc.moveDown(1.5);

  renderQuestionBlock(
    doc,
    'Tono Muscular y Postura Corporal',
    questions.find(q => q.question_code === 'Q-C01-009'),
    responses['a0000001-0000-0000-0000-000000000009'],
    colors
  );

  renderQuestionBlock(
    doc,
    'Reflejo de Moro y Respuestas de Sobresalto',
    questions.find(q => q.question_code === 'Q-C01-010'),
    responses['a0000001-0000-0000-0000-000000000010'],
    colors
  );

  renderQuestionBlock(
    doc,
    'Orientación Sensorial ante Rostros y Voces',
    questions.find(q => q.question_code === 'Q-C01-012'),
    responses['a0000001-0000-0000-0000-000000000012'],
    colors
  );

  // ========================================================================
  // PÁGINA 4: ANÉCDOTAS Y NUESTRA PROMESA PARA TI
  // ========================================================================
  doc.addPage();
  renderHeader(doc, currentChapter.title, child.first_name, colors);

  renderQuestionBlock(
    doc,
    'Anécdota de Nuestra Primera Semana Juntos',
    questions.find(q => q.question_code === 'Q-C01-014'),
    responses['a0000001-0000-0000-0000-000000000014'],
    colors
  );

  doc.moveDown(2);
  doc.rect(60, doc.y, doc.page.width - 110, 160).fillAndStroke('#FFFDF9', colors.secondary);
  const letterY = doc.y - 150;

  doc.font('Helvetica-Bold').fontSize(13).fillColor(colors.secondary)
     .text('NUESTRA PROMESA PARA CUANDO CUMPLAS 18 AÑOS', 75, letterY);

  const promiseText = responses['a0000001-0000-0000-0000-000000000015']?.response_value ||
    'Prometemos cuidarte, respetar el ritmo único con el que florece tu mente, escuchar tus preguntas sin juzgarlas y darte raíces fuertes de amor para que algún día tus alas te lleven tan lejos como sueñes.';

  doc.font('Helvetica-Oblique').fontSize(10.5).fillColor(colors.textDark)
     .text(`"${promiseText}"`, 75, letterY + 25, {
       width: doc.page.width - 140,
       align: 'left',
       lineGap: 4
     });

  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.primary)
     .text('Con todo nuestro amor, tus padres.', 75, letterY + 115, { align: 'right' });

  // Paginación en pie de página para todas las páginas
  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(9).fillColor(colors.textMuted)
       .text(
         `VitaChronicle • ${child.first_name} ${child.last_name} • Página ${i + 1} de ${totalPages}`,
         60,
         doc.page.height - 40,
         { align: 'center', width: doc.page.width - 110 }
       );
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve({
        filePath,
        filename,
        pageCount: totalPages
      });
    });
    writeStream.on('error', reject);
  });
}

function renderHeader(doc, title, childName, colors) {
  doc.font('Helvetica').fontSize(8).fillColor(colors.textMuted)
     .text(`VITACHRONICLE • ${childName.toUpperCase()}`, 60, 30);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.primary)
     .text(title.toUpperCase(), doc.page.width - 250, 30, { align: 'right', width: 200 });
  doc.rect(60, 42, doc.page.width - 110, 0.5).fill(colors.border);
  doc.y = 55;
}

function renderMetricCell(doc, x, y, title, value, colors) {
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(colors.textMuted).text(title, x, y, { width: 100 });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.primary).text(String(value), x, y + 16, { width: 100 });
}

function renderQuestionBlock(doc, displayTitle, question, responseRecord, colors) {
  doc.moveDown(1);
  const startY = doc.y;

  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.primary)
     .text(displayTitle);
  
  if (question?.objective) {
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(colors.textMuted)
       .text(`Objetivo: ${question.objective}`, { width: doc.page.width - 110 });
  }

  doc.moveDown(0.4);

  let answerText = 'Pendiente de registrar por la familia.';
  let isNa = false;

  if (responseRecord) {
    if (responseRecord.is_unknown_or_na) {
      answerText = 'No recordado o no observado en este momento.';
      isNa = true;
    } else if (responseRecord.response_value) {
      answerText = formatValue(responseRecord.response_value);
    }
  }

  doc.font(isNa ? 'Helvetica-Oblique' : 'Helvetica').fontSize(10).fillColor(isNa ? colors.textMuted : colors.textDark)
     .text(answerText, { width: doc.page.width - 110, lineGap: 3 });

  if (responseRecord?.parent_notes) {
    doc.moveDown(0.2);
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(colors.secondary)
       .text(`Nota de los padres: "${responseRecord.parent_notes}"`, { width: doc.page.width - 110 });
  }

  if (question?.scientific_reference) {
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(7.5).fillColor('#94A3B8')
       .text(`Ref. Científica: ${question.scientific_reference}`, { width: doc.page.width - 110 });
  }
}

function formatValue(val, fallback = 'Sin registro') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') {
    return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(' | ');
  }
  return String(val);
}

module.exports = {
  generateChapterPdf
};
