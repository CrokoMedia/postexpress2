import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * DELETE /api/profiles/[id]/context/documents/[docId]
 * Remove um documento do contexto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: profileId, docId } = await params

    // Buscar contexto atual
    const { data: context, error: fetchError } = await supabase
      .from('profile_context')
      .select('documents, files, raw_text')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !context) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      )
    }

    const documents = context.documents || []
    const files = context.files || []

    // Encontrar documento a ser removido
    const docToRemove = documents.find((d: any) => d.id === docId)

    if (!docToRemove) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Remover do Cloudinary
    if (docToRemove.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(docToRemove.cloudinary_public_id, {
          resource_type: 'raw'
        })
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error)
        // Continuar mesmo se falhar no Cloudinary
      }
    }

    // Remover dos arrays
    const updatedDocuments = documents.filter((d: any) => d.id !== docId)
    const updatedFiles = files.filter((f: any) => f.id !== docId)

    // Reconstruir raw_text sem o documento removido
    let updatedRawText = context.raw_text || ''
    if (docToRemove.filename) {
      // Remover a seção do documento do raw_text
      const sectionRegex = new RegExp(`--- ${docToRemove.filename} ---[\\s\\S]*?(?=--- |$)`, 'g')
      updatedRawText = updatedRawText.replace(sectionRegex, '').trim()
    }

    // Atualizar contexto
    const { error: updateError } = await supabase
      .from('profile_context')
      .update({
        documents: updatedDocuments,
        files: updatedFiles,
        raw_text: updatedRawText
      })
      .eq('profile_id', profileId)

    if (updateError) throw updateError

    return NextResponse.json({
      message: 'Document deleted successfully',
      deleted_document: docToRemove
    })

  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    )
  }
}
