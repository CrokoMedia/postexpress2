/**
 * Document Text Extractor
 *
 * Extrai texto de documentos PDF, DOCX, TXT
 */

export interface ExtractionResult {
  text: string
  success: boolean
  error?: string
  method: 'direct' | 'ocr' | 'unsupported'
  pages?: number
  wordCount?: number
}

/**
 * Extrai texto de arquivo TXT ou CSV
 */
async function extractFromTxt(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const text = buffer.toString('utf-8')
    return {
      text,
      success: true,
      method: 'direct',
      wordCount: text.split(/\s+/).filter(Boolean).length
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
 * Extrai texto de PDF usando pdf-parse
 */
async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const pdfParse = require('pdf-parse') // eslint-disable-line
    const data = await pdfParse(buffer)
    const text = data.text?.trim() || ''

    if (!text) {
      return {
        text: '',
        success: false,
        error: 'PDF não contém texto extraível (pode ser um PDF escaneado/imagem)',
        method: 'direct'
      }
    }

    return {
      text,
      success: true,
      method: 'direct',
      pages: data.numpages,
      wordCount: text.split(/\s+/).filter(Boolean).length
    }
  } catch (error: any) {
    return {
      text: '',
      success: false,
      error: `Erro ao extrair PDF: ${error.message}`,
      method: 'direct'
    }
  }
}

/**
 * Extrai texto de DOCX usando mammoth
 */
async function extractFromDocx(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const mammoth = require('mammoth') // eslint-disable-line
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value?.trim() || ''

    if (!text) {
      return {
        text: '',
        success: false,
        error: 'DOCX não contém texto extraível',
        method: 'direct'
      }
    }

    return {
      text,
      success: true,
      method: 'direct',
      wordCount: text.split(/\s+/).filter(Boolean).length
    }
  } catch (error: any) {
    return {
      text: '',
      success: false,
      error: `Erro ao extrair DOCX: ${error.message}`,
      method: 'direct'
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
  if (mimeType === 'text/plain' || mimeType === 'text/csv') {
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
