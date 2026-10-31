// ============================================================================
// VITACHRONICLE - CONTROLADOR DE GENERACIÓN Y DESCARGA DEL LIBRO EN PDF
// ARCHIVO: backend/src/controllers/bookController.js
// ============================================================================

const fs = require('fs');
const path = require('path');
const pdfService = require('../services/pdfService');

async function generateChapterPdf(req, res, next) {
  try {
    const { childId, chapterId } = req.params;
    const result = await pdfService.generateChapterPdf(childId, parseInt(chapterId, 10));

    return res.json({
      success: true,
      message: 'PDF generado exitosamente.',
      data: {
        filename: result.filename,
        pageCount: result.pageCount,
        downloadUrl: `/api/books/download/${result.filename}`
      }
    });
  } catch (err) {
    next(err);
  }
}

async function downloadPdf(req, res, next) {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const config = require('../config/env');
    const filePath = path.join(config.storage.pdfDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'El archivo PDF solicitado no existe o ha expirado.'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateChapterPdf,
  downloadPdf
};
