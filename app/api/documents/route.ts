import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import {
  extractTextFromDocument,
  isValidDocumentType,
  isValidFileSize,
  generateUniqueFilename
} from '@/lib/document-extractor'

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const formData = await request.formData()

    const file = formData.get('file') as File
    const username = formData.get('username') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string

    // Validações
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!isValidDocumentType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, TXT' },
        { status: 400 }
      )
    }

    // Validar tamanho (10MB)
    if (!isValidFileSize(file.size, 10)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      )
    }

    // Converter file para buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Gerar nome único
    const uniqueFilename = generateUniqueFilename(file.name)
    const storagePath = `documents/${username}/${uniqueFilename}`

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(storagePath)

    // Extrair texto (assíncrono - pode falhar sem bloquear)
    let extractedText = ''
    let extractionStatus = 'pending'
    let extractionError = null

    try {
      const extraction = await extractTextFromDocument(buffer, file.type)
      if (extraction.success) {
        extractedText = extraction.text
        extractionStatus = 'completed'
      } else {
        extractionStatus = 'failed'
        extractionError = extraction.error
      }
    } catch (error: any) {
      extractionStatus = 'failed'
      extractionError = error.message
    }

    // Verificar se perfil existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .is('deleted_at', null)
      .single()

    // Salvar no banco
    const { data: document, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert({
        profile_id: existingProfile?.id || null,
        username,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
        storage_path: storagePath,
        extracted_text: extractedText || null,
        extraction_status: extractionStatus,
        extraction_error: extractionError,
        description: description || null,
        document_category: category || 'outros'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Tentar deletar arquivo do storage se falhar no banco
      await supabase.storage.from('documents').remove([storagePath])

      return NextResponse.json(
        { error: `Failed to save document: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      document,
      message: 'Document uploaded successfully'
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')
    const profileId = searchParams.get('profile_id')

    let query = supabase
      .from('uploaded_documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (username) {
      query = query.eq('username', username)
    }

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: documents, error } = await query

    if (error) throw error

    return NextResponse.json({
      documents,
      total: documents?.length || 0
    })
  } catch (error: any) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
