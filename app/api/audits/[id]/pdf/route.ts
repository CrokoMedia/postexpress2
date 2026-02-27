import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    const { data: audit, error } = await supabase
      .from('audits')
      .select(`*, profile:instagram_profiles(*)`)
      .eq('id', id)
      .single()

    if (error || !audit) {
      return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 })
    }

    const html = generateAuditHTML(audit)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const page = await browser.newPage()
    // Viewport bem alto para que todo o conteúdo seja renderizado de uma vez
    await page.setViewport({ width: 900, height: 10000 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })

    // Aguarda fontes carregarem antes de medir
    await page.evaluateHandle('document.fonts.ready')

    // boundingBox mede o conteúdo real renderizado, sem inflação de flex/overflow
    const bodyHandle = await page.$('body')
    const bbox = await bodyHandle!.boundingBox()
    await bodyHandle!.dispose()
    const contentHeight = Math.ceil(bbox?.height ?? 1200)

    const pdfBuffer = await page.pdf({
      width: '900px',
      height: `${contentHeight + 10}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    })

    await browser.close()

    const username = audit.profile?.username || 'perfil'
    const date = new Date().toISOString().split('T')[0]

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="auditoria-${username}-${date}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Gerar SVG icon inline (sem react-dom/server para compatibilidade com Next.js)
function createSvgIcon(paths: string, size: number, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

// SVG paths para cada ícone (extraídos do Lucide React)
const SVG_PATHS = {
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path>',
  penLine: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
  dollarSign: '<line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
  barChart3: '<path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>',
  search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
  messageCircle: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  trendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  alertTriangle: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
}

// Mapeamento de dimensões → ícones
const DIMENSION_ICONS = {
  behavior: { path: SVG_PATHS.brain, color: '#8B5CF6' },        // purple-600
  copy: { path: SVG_PATHS.penLine, color: '#EC4899' },          // pink-600
  offers: { path: SVG_PATHS.dollarSign, color: '#10B981' },     // emerald-600
  metrics: { path: SVG_PATHS.barChart3, color: '#3B82F6' },     // blue-600
  anomalies: { path: SVG_PATHS.search, color: '#F59E0B' }       // amber-600
}

// Mapeamento de métricas → ícones
const METRIC_ICONS = {
  likes: { path: SVG_PATHS.heart, color: '#EF4444' },           // red-500
  comments: { path: SVG_PATHS.messageCircle, color: '#6366F1' }, // indigo-500
  engagement: { path: SVG_PATHS.trendingUp, color: '#10B981' },  // emerald-500
  followers: { path: SVG_PATHS.users, color: '#8B5CF6' }         // primary-600
}

// Ícones de seções
const SECTION_ICONS = {
  strengths: { path: SVG_PATHS.zap, color: '#FBBF24' },         // yellow-500
  problems: { path: SVG_PATHS.alertTriangle, color: '#EF4444' } // red-600
}

function getLogoBase64(): string {
  try {
    // Tenta diferentes caminhos possíveis
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'croko-icon.png'),
      path.join(process.cwd(), '.next', 'static', 'media', 'croko-icon.png'),
      '/app/public/croko-icon.png', // Railway path
    ]

    for (const logoPath of possiblePaths) {
      if (fs.existsSync(logoPath)) {
        console.log('✅ Logo encontrado:', logoPath)
        const logoBuffer = fs.readFileSync(logoPath)
        return `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    }

    console.warn('⚠️ Logo não encontrado em nenhum caminho. Usando fallback SVG.')
    // Fallback: retorna um SVG simples inline
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkM8L3RleHQ+PC9zdmc+'
  } catch (error) {
    console.error('❌ Erro ao carregar logo:', error)
    // Fallback SVG (letra "C" roxa)
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkM8L3RleHQ+PC9zdmc+'
  }
}

function getClassification(score: number): { label: string; color: string } {
  if (score >= 91) return { label: 'EXTRAORDINÁRIO', color: '#10b981' }
  if (score >= 81) return { label: 'EXCELENTE',       color: '#10b981' }
  if (score >= 61) return { label: 'BOM',             color: '#f59e0b' }
  if (score >= 41) return { label: 'MEDIANO',         color: '#f59e0b' }
  if (score >= 21) return { label: 'RUIM',            color: '#ef4444' }
  return              { label: 'CRÍTICO',            color: '#ef4444' }
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function scoreBar(score: number): string {
  const color = scoreColor(score)
  const pct   = Math.min(100, score)
  return `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="flex:1;height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${color};border-radius:99px;"></div>
      </div>
      <span style="font-size:13px;font-weight:700;color:${color};width:32px;text-align:right;">${score}</span>
    </div>`
}

function renderStrengths(items: any[]): string {
  if (!items || items.length === 0) return ''
  const iconSvg = createSvgIcon(SECTION_ICONS.strengths.path, 28, SECTION_ICONS.strengths.color)
  return items.map(s => `
    <div style="display:flex;gap:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:12px;padding:10px 16px;margin-bottom:8px;">
      <div style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">${iconSvg}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#065f46;margin-bottom:4px;">#${s.rank} ${escapeHtml(s.title)}</div>
        <div style="font-size:13px;color:#374151;line-height:1.6;">${escapeHtml(s.description)}</div>
      </div>
    </div>`).join('')
}

function renderCriticalProblems(items: any[]): string {
  if (!items || items.length === 0) return ''
  const iconSvg = createSvgIcon(SECTION_ICONS.problems.path, 28, SECTION_ICONS.problems.color)
  const severityColor: Record<string, string> = {
    'crítico': '#ef4444',
    'alto':    '#f97316',
    'médio':   '#f59e0b',
    'baixo':   '#6b7280',
  }
  return items.map(p => {
    const sColor = severityColor[p.severity] || '#6b7280'
    const severityBadge = p.severity
      ? `<span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#fff;background:${sColor};border-radius:6px;padding:2px 8px;margin-left:8px;">${escapeHtml(p.severity)}</span>`
      : ''
    return `
    <div style="display:flex;gap:12px;background:#fff5f5;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:12px;padding:10px 16px;margin-bottom:8px;">
      <div style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">${iconSvg}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#991b1b;margin-bottom:4px;">#${p.rank} ${escapeHtml(p.title)}${severityBadge}</div>
        <div style="font-size:13px;color:#374151;line-height:1.6;">${escapeHtml(p.description)}</div>
      </div>
    </div>`
  }).join('')
}

function renderList(items: string[], bulletColor: string): string {
  if (!items || items.length === 0) return '<p style="color:#9ca3af;font-size:13px;">—</p>'
  return items.map(item => `
    <div style="display:flex;gap:10px;margin-bottom:6px;">
      <div style="width:6px;height:6px;border-radius:50%;background:${bulletColor};flex-shrink:0;margin-top:6px;"></div>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">${escapeHtml(item)}</p>
    </div>`).join('')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── HTML Principal ──────────────────────────────────────────────────────────

function generateAuditHTML(audit: any): string {
  const profile        = audit.profile || {}
  const username       = profile.username || '—'
  const fullName       = profile.full_name || username
  const scoreOverall   = audit.score_overall || 0
  const classification = getClassification(scoreOverall)
  const dateStr        = new Date(audit.audit_date || Date.now()).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const logoBase64     = getLogoBase64()

  const dimensions = [
    { name: 'Comportamento', icon: createSvgIcon(DIMENSION_ICONS.behavior.path, 32, '#fff'), score: audit.score_behavior  || 0, key: 'behavior'  },
    { name: 'Copy',          icon: createSvgIcon(DIMENSION_ICONS.copy.path, 32, '#fff'),     score: audit.score_copy      || 0, key: 'copy'      },
    { name: 'Ofertas',       icon: createSvgIcon(DIMENSION_ICONS.offers.path, 32, '#fff'),   score: audit.score_offers    || 0, key: 'offers'    },
    { name: 'Métricas',      icon: createSvgIcon(DIMENSION_ICONS.metrics.path, 32, '#fff'),  score: audit.score_metrics   || 0, key: 'metrics'   },
    { name: 'Anomalias',     icon: createSvgIcon(DIMENSION_ICONS.anomalies.path, 32, '#fff'), score: audit.score_anomalies || 0, key: 'anomalies' },
  ]

  const auditorSections = dimensions.map(dim => {
    const data = audit.raw_json?.auditors_analysis?.[dim.key] || {}
    const findings       = data.key_findings    || []
    const recommendations = data.recommendations || data.opportunities || []
    const recoLabel      = dim.key === 'anomalies' ? 'Oportunidades' : 'Recomendações'

    return `
    <div style="margin-bottom:16px;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <!-- Cabeçalho da dimensão -->
      <div style="background:linear-gradient(135deg,#0a6e75 0%,#085862 100%);padding:12px 20px;display:flex;align-items:center;gap:16px;">
        <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${dim.icon}</div>
        <div>
          <h3 style="margin:0;color:#fff;font-size:18px;font-weight:700;">${dim.name}</h3>
          <p  style="margin:0;color:rgba(255,255,255,.7);font-size:13px;">Análise de ${dim.name}</p>
        </div>
        <div style="margin-left:auto;background:rgba(255,255,255,.15);border-radius:12px;padding:8px 16px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;">${dim.score}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.7);">/ 100</div>
        </div>
      </div>

      <!-- Corpo -->
      <div style="padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#0a6e75;">Principais Descobertas</h4>
          ${renderList(findings, '#0a6e75')}
        </div>
        <div>
          <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#10b981;">${recoLabel}</h4>
          ${renderList(recommendations, '#10b981')}
        </div>
      </div>
    </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Auditoria — @${username}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',system-ui,sans-serif; color:#111827; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  </style>
</head>
<body>

<!-- ══════════════════════════════════════════════════════════════════
     CAPA — PÁGINA 1
════════════════════════════════════════════════════════════════════ -->
<div>

  <!-- Topo roxo -->
  <div style="background:linear-gradient(135deg,#0a6e75 0%,#085862 100%);padding:24px 52px 20px;color:#fff;">
    <!-- Logo -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      ${logoBase64 ? `<div style="width:40px;height:40px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:4px;"><img src="${logoBase64}" alt="Croko Lab" style="width:100%;height:100%;object-fit:contain;" /></div>` : '<div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;letter-spacing:0.02em;">CL</div>'}
      <span style="font-size:15px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;opacity:.9;">Croko Lab</span>
      <span style="margin-left:auto;font-size:13px;opacity:.6;">${dateStr}</span>
    </div>

    <!-- Título -->
    <p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;opacity:.7;margin-bottom:8px;">Relatório de Auditoria</p>
    <h1 style="font-size:38px;font-weight:900;line-height:1.1;margin-bottom:4px;">@${escapeHtml(username)}</h1>
    ${fullName !== username ? `<p style="font-size:18px;opacity:.8;">${escapeHtml(fullName)}</p>` : ''}
  </div>

  <!-- Score geral -->
  <div style="background:#f9fafb;padding:20px 52px;display:flex;align-items:center;gap:24px;border-bottom:1px solid #e5e7eb;">
    <!-- Círculo do score -->
    <div style="width:130px;height:130px;border-radius:50%;background:${classification.color};display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 8px 32px ${classification.color}44;">
      <span style="font-size:46px;font-weight:900;color:#fff;line-height:1;">${scoreOverall}</span>
      <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,.8);letter-spacing:.05em;">/ 100</span>
    </div>

    <div style="flex:1;">
      <div style="font-size:26px;font-weight:800;color:${classification.color};margin-bottom:4px;">${classification.label}</div>
      <div style="font-size:15px;color:#6b7280;margin-bottom:12px;">${audit.posts_analyzed || 0} posts analisados</div>

      <!-- Mini scores -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 32px;">
        ${dimensions.map(d => {
          const miniIcon = createSvgIcon(DIMENSION_ICONS[d.key as keyof typeof DIMENSION_ICONS].path, 14, DIMENSION_ICONS[d.key as keyof typeof DIMENSION_ICONS].color)
          return `
          <div>
            <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
              <span style="display:inline-flex;width:14px;height:14px;">${miniIcon}</span>
              <span>${d.name}</span>
            </div>
            ${scoreBar(d.score)}
          </div>`
        }).join('')}
      </div>
    </div>
  </div>

  <!-- Métricas de engajamento -->
  <div style="padding:16px 52px;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#0a6e75;margin-bottom:12px;">Métricas de Engajamento</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
      ${[
        { label: 'Total de Likes',        value: formatNumber(audit.total_likes      || 0), iconKey: 'likes'      },
        { label: 'Total de Comentários',  value: formatNumber(audit.total_comments   || 0), iconKey: 'comments'   },
        { label: 'Taxa de Engajamento',   value: `${(audit.engagement_rate || 0).toFixed(2)}%`, iconKey: 'engagement' },
        { label: 'Seguidores',            value: formatNumber(audit.snapshot_followers || 0), iconKey: 'followers'  },
      ].map(m => {
        const metricIcon = createSvgIcon(METRIC_ICONS[m.iconKey as keyof typeof METRIC_ICONS].path, 24, METRIC_ICONS[m.iconKey as keyof typeof METRIC_ICONS].color)
        return `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px 18px;text-align:center;">
          <div style="width:24px;height:24px;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;">${metricIcon}</div>
          <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:2px;">${m.value}</div>
          <div style="font-size:11px;color:#9ca3af;font-weight:500;">${m.label}</div>
        </div>`
      }).join('')}
    </div>
  </div>

  <!-- Pontos Fortes -->
  ${audit.raw_json?.top_strengths?.length > 0 ? `
  <div style="padding:16px 52px;border-top:1px solid #e5e7eb;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#10b981;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
      <span style="display:inline-flex;width:16px;height:16px;">${createSvgIcon(SECTION_ICONS.strengths.path, 16, '#10b981')}</span>
      <span>Pontos Fortes</span>
    </h2>
    ${renderStrengths(audit.raw_json.top_strengths)}
  </div>` : ''}

  <!-- Problemas Críticos -->
  ${audit.raw_json?.critical_problems?.length > 0 ? `
  <div style="padding:16px 52px;border-top:1px solid #e5e7eb;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#ef4444;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
      <span style="display:inline-flex;width:16px;height:16px;">${createSvgIcon(SECTION_ICONS.problems.path, 16, '#ef4444')}</span>
      <span>Problemas Críticos</span>
    </h2>
    ${renderCriticalProblems(audit.raw_json.critical_problems)}
  </div>` : ''}

  <!-- Rodapé -->
  <div style="padding:10px 52px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;color:#9ca3af;">Agência Croko © ${new Date().getFullYear()}</span>
    <span style="font-size:12px;color:#9ca3af;">Croko Lab</span>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     ANÁLISE DETALHADA
════════════════════════════════════════════════════════════════════ -->
<div style="padding:22px 52px;">

  <!-- Cabeçalho da seção -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #e5e7eb;">
    <div style="width:6px;height:28px;background:linear-gradient(180deg,#0a6e75,#085862);border-radius:3px;"></div>
    <div>
      <h2 style="font-size:20px;font-weight:800;color:#111827;">Análise Detalhada por Dimensão</h2>
      <p style="font-size:13px;color:#9ca3af;">@${escapeHtml(username)} · ${dateStr}</p>
    </div>
  </div>

  <!-- Seções de dimensões -->
  ${auditorSections}

  <!-- Rodapé -->
  <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;color:#9ca3af;">Agência Croko © ${new Date().getFullYear()}</span>
    <span style="font-size:12px;color:#9ca3af;">Croko Lab — Auditoria @${escapeHtml(username)}</span>
  </div>
</div>

</body>
</html>`
}
