/**
 * Document Text Extractor
 *
 * Extrai texto de documentos PDF, DOCX, TXT
 */

import { createWorker } from 'tesseract.js'

export interface ExtractionResult {
  text: string
  success: boolean
  error?: string
  method: 'direct' | 'ocr' | 'unsupported'
}

/**
 * Extrai texto de arquivo TXT
 */
async function extractFromTxt(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const text = buffer.toString('utf-8')
    return {
      text,
      success: true,
      method: 'direct'
    }
  } catch (error: any) {
    return {
      text: '',
      success: false,
      error: error.message,
      method: 'direct'
    }
  }
}

/**
 * Extrai texto de PDF usando OCR (Tesseract.js)
 * Nota: Para produção, considere usar bibliotecas como pdf-parse ou pdfjs-dist
 */
async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Para simplificar, vamos retornar erro e sugerir usar biblioteca específica
    // Em produção, use: npm install pdf-parse
    return {
      text: '',
      success: false,
      error: 'PDF extraction requires pdf-parse library. Install: npm install pdf-parse',
      method: 'unsupported'
    }
  } catch (error: any) {
    return {
      text: '',
      success: false,
      error: error.message,
      method: 'unsupported'
    }
  }
}

/**
 * Extrai texto de DOCX
 * Nota: Para produção, use biblioteca mammoth
 */
async function extractFromDocx(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Para simplificar, vamos retornar erro e sugerir usar biblioteca específica
    // Em produção, use: npm install mammoth
    return {
      text: '',
      success: false,
      error: 'DOCX extraction requires mammoth library. Install: npm install mammoth',
      method: 'unsupported'
    }
  } catch (error: any) {
    return {
      text: '',
      success: false,
      error: error.message,
      method: 'unsupported'
    }
  }
}

/**
 * Extrai texto de documento baseado no tipo
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  // Detectar tipo do arquivo
  if (mimeType === 'text/plain') {
    return extractFromTxt(buffer)
  }

  if (mimeType === 'application/pdf') {
    return extractFromPdf(buffer)
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractFromDocx(buffer)
  }

  // Tipo não suportado
  return {
    text: '',
    success: false,
    error: `Unsupported file type: ${mimeType}`,
    method: 'unsupported'
  }
}

/**
 * Valida tipo de arquivo
 */
export function isValidDocumentType(mimeType: string): boolean {
  const validTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  return validTypes.includes(mimeType)
}

/**
 * Valida tamanho do arquivo (max 10MB)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return size <= maxBytes
}

/**
 * Gera nome de arquivo único
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(`.${extension}`, '')

  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`
}
