import { google } from 'googleapis'
import { drive_v3 } from 'googleapis'
import { Readable } from 'stream'

/**
 * Retorna cliente autenticado do Google Drive via Service Account
 */
export function getGoogleDriveClient(): drive_v3.Drive {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    throw new Error('Credenciais do Google Drive não configuradas. Configure GOOGLE_DRIVE_CLIENT_EMAIL e GOOGLE_DRIVE_PRIVATE_KEY.')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({ version: 'v3', auth })
}

/**
 * Encontra uma pasta pelo nome dentro de um diretório pai, ou cria se não existir.
 * Retorna o ID da pasta.
 */
export async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string
): Promise<string> {
  // Escapar aspas no nome para a query
  const safeName = name.replace(/'/g, "\\'")

  const { data } = await drive.files.list({
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  })

  if (data.files && data.files.length > 0) {
    return data.files[0].id as string
  }

  // Criar a pasta
  const { data: folder } = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })

  return folder.id as string
}

/**
 * Faz upload de um Buffer como arquivo no Google Drive.
 * Retorna o ID do arquivo criado.
 */
export async function uploadFile(
  drive: drive_v3.Drive,
  name: string,
  buffer: Buffer,
  mimeType: string,
  parentId: string
): Promise<string> {
  const stream = Readable.from(buffer)

  const { data } = await drive.files.create({
    requestBody: {
      name,
      parents: [parentId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id',
  })

  return data.id as string
}
