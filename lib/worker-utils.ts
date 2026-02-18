/**
 * Worker Utilities
 *
 * Funções helper para executar scripts Node.js e processar análises
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

export interface ScriptResult {
  success: boolean
  output?: any
  error?: string
  stdout?: string
  stderr?: string
}

/**
 * Executa um script Node.js e retorna o resultado
 */
export async function executeScript(
  scriptPath: string,
  args: string[] = [],
  options: { timeout?: number } = {}
): Promise<ScriptResult> {
  const { timeout = 300000 } = options // 5 minutos padrão

  return new Promise((resolve) => {
    const fullScriptPath = path.join(PROJECT_ROOT, scriptPath)

    console.log(`[Worker] Executando: node ${scriptPath} ${args.join(' ')}`)

    const child = spawn('node', [fullScriptPath, ...args], {
      cwd: PROJECT_ROOT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    let timeoutId: NodeJS.Timeout | null = null

    // Capturar stdout
    child.stdout?.on('data', (data) => {
      const text = data.toString()
      stdout += text
      // Log em tempo real
      console.log(text.trim())
    })

    // Capturar stderr
    child.stderr?.on('data', (data) => {
      const text = data.toString()
      stderr += text
      console.error(text.trim())
    })

    // Timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM')
        resolve({
          success: false,
          error: `Script timeout after ${timeout}ms`,
          stdout,
          stderr
        })
      }, timeout)
    }

    // Conclusão
    child.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId)

      if (code === 0) {
        resolve({
          success: true,
          stdout,
          stderr
        })
      } else {
        resolve({
          success: false,
          error: `Script exited with code ${code}`,
          stdout,
          stderr
        })
      }
    })

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId)

      resolve({
        success: false,
        error: error.message,
        stdout,
        stderr
      })
    })
  })
}

/**
 * Executa o scraper de Instagram com comentários
 */
export async function runInstagramScraper(
  username: string,
  postLimit: number = 10,
  commentsPerPost: number = 50
): Promise<ScriptResult> {
  const args = [
    username,
    `--limit=${postLimit}`,
    `--comments-per-post=${commentsPerPost}`
  ]

  return executeScript('scripts/instagram-scraper-with-comments.js', args, {
    timeout: 600000 // 10 minutos
  })
}

/**
 * Executa o OCR com Gemini Vision
 */
export async function runOCRAnalysis(
  username: string,
  skipOcr: boolean = false
): Promise<ScriptResult> {
  if (skipOcr) {
    console.log('[Worker] OCR pulado conforme solicitado')
    return { success: true }
  }

  const args = [username, '--source=posts-with-comments']

  return executeScript('scripts/ocr-gemini-analyzer.js', args, {
    timeout: 600000 // 10 minutos
  })
}

/**
 * Executa a análise completa (scraping + comentários + OCR)
 */
export async function runCompleteAnalysis(
  username: string,
  skipOcr: boolean = false,
  postLimit: number = 10
): Promise<ScriptResult> {
  const args = [username, `--limit=${postLimit}`]

  if (skipOcr) {
    args.push('--skip-ocr')
  }

  return executeScript('scripts/complete-post-analyzer.js', args, {
    timeout: 900000 // 15 minutos
  })
}

/**
 * Executa análise com os 5 auditores usando Claude API
 */
export async function runAuditWithSquad(
  username: string
): Promise<ScriptResult> {
  const args = [username]

  return executeScript('scripts/audit-with-squad.js', args, {
    timeout: 300000 // 5 minutos
  })
}

/**
 * Lê arquivo JSON de resultado
 */
export async function readAnalysisResult(username: string): Promise<any> {
  const fs = await import('fs/promises')

  // Tentar ler arquivo de auditoria express (tem a estrutura completa)
  const auditExpressPath = path.join(
    PROJECT_ROOT,
    'squad-auditores/output',
    `auditoria-express-${username}.json`
  )

  // Ler arquivo de dados completos (sempre existe se análise completou)
  const completeAnalysisPath = path.join(
    PROJECT_ROOT,
    'squad-auditores/data',
    `${username}-complete-analysis.json`
  )

  try {
    // Tentar carregar arquivo complete-analysis (principal)
    const completeContent = await fs.readFile(completeAnalysisPath, 'utf-8')
    const completeData = JSON.parse(completeContent)

    // Tentar carregar auditoria express se existir
    try {
      const auditExpressContent = await fs.readFile(auditExpressPath, 'utf-8')
      const auditExpressData = JSON.parse(auditExpressContent)

      // Mesclar os dois, preservando profile com foto do Apify (camelCase)
      // auditExpressData.profile tem snake_case sem foto — não pode sobrescrever
      return {
        ...completeData,
        ...auditExpressData,
        profile: completeData.profile,   // preserva profilePicUrl, followersCount, etc.
        posts: completeData.posts        // preserva array de posts reais
      }
    } catch {
      // Se auditoria-express não existir, retorna só complete-analysis
      // (acontece quando usa --skip-ocr)
      console.log(`[Worker] Usando apenas complete-analysis.json (auditoria-express não encontrado)`)
      return completeData
    }
  } catch (error: any) {
    throw new Error(`Falha ao ler resultado: ${error.message}`)
  }
}

/**
 * Verifica se arquivos de resultado existem
 */
export async function checkResultFiles(username: string): Promise<{
  postsWithComments: boolean
  ocrAnalysis: boolean
  completeAnalysis: boolean
}> {
  const fs = await import('fs/promises')
  const dataDir = path.join(PROJECT_ROOT, 'squad-auditores/data')

  const files = {
    postsWithComments: path.join(dataDir, `${username}-posts-with-comments.json`),
    ocrAnalysis: path.join(dataDir, `${username}-ocr-gemini-analysis.json`),
    completeAnalysis: path.join(dataDir, `${username}-complete-analysis.json`)
  }

  const results = {
    postsWithComments: false,
    ocrAnalysis: false,
    completeAnalysis: false
  }

  for (const [key, filePath] of Object.entries(files)) {
    try {
      await fs.access(filePath)
      results[key as keyof typeof results] = true
    } catch {
      results[key as keyof typeof results] = false
    }
  }

  return results
}

/**
 * Calcula progresso estimado baseado em fase
 */
export function calculateProgress(phase: string): number {
  const progressMap: Record<string, number> = {
    'scraping': 10,
    'comments': 30,
    'ocr': 50,
    'audit': 70,
    'saving': 90,
    'completed': 100
  }

  return progressMap[phase] || 0
}
