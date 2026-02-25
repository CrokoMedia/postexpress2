import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'
import { v4 as uuidv4 } from 'uuid'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Extrai texto de um buffer baseado no tipo de arquivo
 */
async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    console.log(`[EXTRACT] Processing file type: ${mimeType}`)

    if (mimeType === 'application/pdf') {
      console.log('[EXTRACT] Using pdf-parse')
      const data = await pdfParse(buffer)
      console.log(`[EXTRACT] PDF: extracted ${data.text.length} chars from ${data.numpages} pages`)
      return data.text
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      console.log('[EXTRACT] Using mammoth for DOCX')
      const result = await mammoth.extractRawText({ buffer })
      console.log(`[EXTRACT] DOCX: extracted ${result.value.length} chars`)
      return result.value
    } else if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
      console.log('[EXTRACT] Reading as plain text')
      const text = buffer.toString('utf-8')
      console.log(`[EXTRACT] Text: extracted ${text.length} chars`)
      return text
    }

    console.warn(`[EXTRACT] Unsupported mime type: ${mimeType}`)
    return ''
  } catch (error) {
    console.error('[EXTRACT] Error extracting text:', error)
    return ''
  }
}

/**
 * POST /api/profiles/[id]/context/upload
 * Upload de documentos para contexto do perfil
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: profileId } = await params

    // Verificar se perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('instagram_profiles')
      .select('username')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, TXT, MD' },
        { status: 400 }
      )
    }

    // Limitar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extrair texto do documento
    console.log(`[UPLOAD] Extracting text from ${file.name} (${file.type}, ${file.size} bytes)`)
    const extractedText = await extractText(buffer, file.type)
    console.log(`[UPLOAD] Extracted ${extractedText.length} characters`)

    // Upload para Cloudinary (como raw file)
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `post-express/context-docs/${profile.username}`,
          resource_type: 'raw',
          public_id: `${uuidv4()}-${file.name.replace(/\.[^/.]+$/, '')}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    // Criar objeto do documento
    const document = {
      id: uuidv4(),
      name: file.name, // Frontend usa 'name', não 'filename'
      filename: file.name,
      url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id,
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString(),
      extracted_text_length: extractedText.length,
      extractedText: extractedText, // Frontend precisa deste campo
      extractionStatus: extractedText.length > 0 ? 'completed' : 'failed', // Frontend verifica este campo
      wordCount: extractedText.length > 0 ? extractedText.split(/\s+/).length : 0
    }

    // Buscar contexto existente
    const { data: existingContext } = await supabase
      .from('profile_context')
      .select('files, contexto_adicional')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .maybeSingle()

    const currentFiles = existingContext?.files || []
    const currentContexto = existingContext?.contexto_adicional || ''

    const updatedFiles = [...currentFiles, document]
    const updatedContexto = currentContexto
      ? `${currentContexto}\n\n--- DOCUMENTO: ${file.name} ---\n${extractedText}`
      : `--- DOCUMENTO: ${file.name} ---\n${extractedText}`

    // Salvar documento no contexto
    if (existingContext) {
      // UPDATE
      const { error } = await (supabase as any)
        .from('profile_context')
        .update({
          files: updatedFiles,
          contexto_adicional: updatedContexto
        })
        .eq('profile_id', profileId)

      if (error) throw error
    } else {
      // INSERT (criar contexto se não existir)
      const { error } = await (supabase as any)
        .from('profile_context')
        .insert({
          profile_id: profileId,
          files: updatedFiles,
          contexto_adicional: updatedContexto
        })

      if (error) throw error
    }

    return NextResponse.json({
      document,
      extracted_text_preview: extractedText.substring(0, 200) + '...',
      message: 'Document uploaded successfully'
    })

  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}
