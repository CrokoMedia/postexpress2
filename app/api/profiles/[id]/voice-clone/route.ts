import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Formatos de audio aceitos
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',       // mp3
  'audio/mp3',        // mp3 (alias)
  'audio/wav',        // wav
  'audio/x-wav',      // wav (alias)
  'audio/x-m4a',      // m4a
  'audio/mp4',        // m4a (alias)
  'audio/m4a',        // m4a (alias)
  'audio/aac',        // aac
  'audio/ogg',        // ogg
  'audio/webm',       // webm
]

// Limites de tamanho como proxy para duracao
// ~30s de audio mp3 128kbps = ~480KB, ~2min = ~1.9MB
// Usamos limites mais generosos para acomodar WAV e qualidades diferentes
const MIN_FILE_SIZE = 100 * 1024      // 100KB (~10s mínimo em mp3)
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (generoso para WAV)

/**
 * POST /api/profiles/[id]/voice-clone
 * Clona a voz do creator via ElevenLabs Instant Voice Clone
 *
 * Body: FormData com campo "file" (audio mp3/wav/m4a)
 * Response: { voice_id, message }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: profileId } = await params

    // Verificar API key do ElevenLabs
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured. Voice cloning requires ElevenLabs.' },
        { status: 503 }
      )
    }

    // Verificar se perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, cloned_voice_id')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Se ja tem voz clonada, remover a antiga antes de clonar nova
    if (profile.cloned_voice_id) {
      try {
        await fetch(`https://api.elevenlabs.io/v1/voices/${profile.cloned_voice_id}`, {
          method: 'DELETE',
          headers: { 'xi-api-key': elevenLabsApiKey },
        })
        console.log(`Voz antiga removida do ElevenLabs: ${profile.cloned_voice_id}`)
      } catch (deleteErr) {
        console.warn('Erro ao remover voz antiga do ElevenLabs (continuando):', deleteErr)
      }
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided. Send a FormData with "file" field.' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const fileType = file.type || ''
    const fileName = file.name || ''
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

    // Aceitar por MIME type ou por extensao
    const validExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm']
    const isValidType = ALLOWED_AUDIO_TYPES.includes(fileType) || validExtensions.includes(fileExtension)

    if (!isValidType) {
      return NextResponse.json(
        { error: `Invalid audio format: ${fileType || fileExtension}. Allowed: MP3, WAV, M4A, AAC, OGG, WebM` },
        { status: 400 }
      )
    }

    // Validar tamanho (proxy para duracao)
    if (file.size < MIN_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Audio file too short. Minimum ~30 seconds of audio required for quality voice cloning.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum 25MB (approximately 2 minutes of audio).' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1. Upload para Cloudinary (armazenamento / backup)
    const cloudinaryResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `postexpress/voice-samples/${profile.username}`,
          resource_type: 'video', // Cloudinary trata audio como video
          public_id: `voice-sample-${Date.now()}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
            return
          }
          if (!result) {
            reject(new Error('Cloudinary upload returned no result'))
            return
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id })
        }
      )
      uploadStream.end(buffer)
    })

    console.log(`Audio uploaded to Cloudinary: ${cloudinaryResult.secure_url}`)

    // 2. Chamar ElevenLabs Instant Voice Clone
    const elevenLabsFormData = new FormData()
    elevenLabsFormData.append('name', `${profile.username}-voice`)
    elevenLabsFormData.append(
      'description',
      `Voz clonada do creator @${profile.username} - Croko Lab`
    )

    // ElevenLabs espera o arquivo como Blob
    const audioBlob = new Blob([buffer], { type: fileType || 'audio/mpeg' })
    elevenLabsFormData.append('files', audioBlob, fileName || 'voice-sample.mp3')

    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
      body: elevenLabsFormData,
    })

    if (!elevenLabsResponse.ok) {
      const errorBody = await elevenLabsResponse.text()
      console.error(`ElevenLabs Voice Clone failed (${elevenLabsResponse.status}):`, errorBody)
      return NextResponse.json(
        { error: `ElevenLabs voice cloning failed: ${errorBody}` },
        { status: elevenLabsResponse.status }
      )
    }

    const elevenLabsResult: { voice_id: string } = await elevenLabsResponse.json()
    const voiceId = elevenLabsResult.voice_id

    console.log(`Voice cloned successfully: ${voiceId} for @${profile.username}`)

    // 3. Salvar voice_id no Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cloned_voice_id: voiceId })
      .eq('id', profileId)

    if (updateError) {
      console.error('Error saving voice_id to Supabase:', updateError)
      // Tentar limpar a voz do ElevenLabs se o save falhar
      try {
        await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
          method: 'DELETE',
          headers: { 'xi-api-key': elevenLabsApiKey },
        })
      } catch (cleanupErr) {
        console.error('Failed to cleanup ElevenLabs voice after Supabase error:', cleanupErr)
      }
      throw updateError
    }

    return NextResponse.json({
      voice_id: voiceId,
      cloudinary_url: cloudinaryResult.secure_url,
      message: `Voice cloned successfully for @${profile.username}`,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in voice clone:', errorMessage)
    return NextResponse.json(
      { error: errorMessage || 'Failed to clone voice' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/[id]/voice-clone
 * Remove a voz clonada do ElevenLabs e limpa o campo no Supabase
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: profileId } = await params

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured' },
        { status: 503 }
      )
    }

    // Buscar perfil com voice_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, cloned_voice_id')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile.cloned_voice_id) {
      return NextResponse.json(
        { error: 'No cloned voice found for this profile' },
        { status: 404 }
      )
    }

    // 1. Remover voz do ElevenLabs
    const deleteResponse = await fetch(
      `https://api.elevenlabs.io/v1/voices/${profile.cloned_voice_id}`,
      {
        method: 'DELETE',
        headers: { 'xi-api-key': elevenLabsApiKey },
      }
    )

    if (!deleteResponse.ok) {
      const errorBody = await deleteResponse.text()
      console.warn(
        `ElevenLabs voice delete warning (${deleteResponse.status}):`,
        errorBody
      )
      // Continuar mesmo se o delete falhar no ElevenLabs
      // (voz pode ja ter sido removida manualmente)
    }

    // 2. Limpar campo no Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cloned_voice_id: null })
      .eq('id', profileId)

    if (updateError) {
      throw updateError
    }

    console.log(`Voice removed for @${profile.username} (was: ${profile.cloned_voice_id})`)

    return NextResponse.json({
      message: `Cloned voice removed for @${profile.username}`,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error removing cloned voice:', errorMessage)
    return NextResponse.json(
      { error: errorMessage || 'Failed to remove cloned voice' },
      { status: 500 }
    )
  }
}
