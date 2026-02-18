import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { extractTextFromDocument } from '@/lib/document-extractor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Verificar se perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

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
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed: PDF, CSV, TXT, DOCX, DOC' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Max size: 10MB' },
        { status: 400 }
      )
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'uploads', 'profile-context', id)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Nome único
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    // URL relativa para servir o arquivo
    const fileUrl = `/uploads/profile-context/${id}/${fileName}`

    // Extrair texto do documento
    let extractedText: string | null = null
    let extractionStatus = 'failed'
    let extractionError: string | null = null
    let wordCount: number | undefined
    let pages: number | undefined

    try {
      const extraction = await extractTextFromDocument(buffer, file.type)
      if (extraction.success && extraction.text) {
        extractedText = extraction.text
        extractionStatus = 'completed'
        wordCount = extraction.wordCount
        pages = extraction.pages
      } else {
        extractionError = extraction.error || 'Texto não extraível'
      }
    } catch (err: any) {
      extractionError = err.message
    }

    // Retornar metadata + texto extraído
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        url: fileUrl,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        extractedText,
        extractionStatus,
        extractionError,
        wordCount,
        pages
      }
    })

  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
