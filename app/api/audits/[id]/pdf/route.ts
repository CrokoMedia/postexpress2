import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    const { data: audit, error } = await supabase
      .from('audits')
      .select(`*, profile:profiles(*)`)
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
  return items.map(s => `
    <div style="display:flex;gap:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:12px;padding:10px 16px;margin-bottom:8px;">
      <div style="font-size:28px;line-height:1;flex-shrink:0;">${s.emoji || '💪'}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#065f46;margin-bottom:4px;">#${s.rank} ${escapeHtml(s.title)}</div>
        <div style="font-size:13px;color:#374151;line-height:1.6;">${escapeHtml(s.description)}</div>
      </div>
    </div>`).join('')
}

function renderCriticalProblems(items: any[]): string {
  if (!items || items.length === 0) return ''
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
      <div style="font-size:28px;line-height:1;flex-shrink:0;">${p.emoji || '⚠️'}</div>
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

  const dimensions = [
    { name: 'Comportamento', icon: '🧠', auditor: 'Daniel Kahneman',  score: audit.score_behavior  || 0, key: 'behavior'  },
    { name: 'Copy',          icon: '✍️', auditor: 'Eugene Schwartz',  score: audit.score_copy      || 0, key: 'copy'      },
    { name: 'Ofertas',       icon: '💰', auditor: 'Alex Hormozi',     score: audit.score_offers    || 0, key: 'offers'    },
    { name: 'Métricas',      icon: '📊', auditor: 'Marty Cagan',      score: audit.score_metrics   || 0, key: 'metrics'   },
    { name: 'Anomalias',     icon: '🔍', auditor: 'Paul Graham',      score: audit.score_anomalies || 0, key: 'anomalies' },
  ]

  const auditorSections = dimensions.map(dim => {
    const data = audit.raw_json?.auditors_analysis?.[dim.key] || {}
    const findings       = data.key_findings    || []
    const recommendations = data.recommendations || data.opportunities || []
    const recoLabel      = dim.key === 'anomalies' ? 'Oportunidades' : 'Recomendações'

    return `
    <div style="margin-bottom:16px;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <!-- Cabeçalho do auditor -->
      <div style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:12px 20px;display:flex;align-items:center;gap:16px;">
        <div style="font-size:32px;line-height:1;">${dim.icon}</div>
        <div>
          <h3 style="margin:0;color:#fff;font-size:18px;font-weight:700;">${dim.auditor}</h3>
          <p  style="margin:0;color:rgba(255,255,255,.7);font-size:13px;">${dim.name}</p>
        </div>
        <div style="margin-left:auto;background:rgba(255,255,255,.15);border-radius:12px;padding:8px 16px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;">${dim.score}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.7);">/ 100</div>
        </div>
      </div>

      <!-- Corpo -->
      <div style="padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6366f1;">Principais Descobertas</h4>
          ${renderList(findings, '#6366f1')}
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
  <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:24px 52px 20px;color:#fff;">
    <!-- Logo -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">⚡</div>
      <span style="font-size:15px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;opacity:.9;">Post Express</span>
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
        ${dimensions.map(d => `
          <div>
            <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">${d.icon} ${d.name}</div>
            ${scoreBar(d.score)}
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Métricas de engajamento -->
  <div style="padding:16px 52px;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6366f1;margin-bottom:12px;">Métricas de Engajamento</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
      ${[
        { label: 'Total de Likes',        value: formatNumber(audit.total_likes      || 0), icon: '❤️'  },
        { label: 'Total de Comentários',  value: formatNumber(audit.total_comments   || 0), icon: '💬'  },
        { label: 'Taxa de Engajamento',   value: `${(audit.engagement_rate || 0).toFixed(2)}%`, icon: '📈' },
        { label: 'Seguidores',            value: formatNumber(audit.snapshot_followers || 0), icon: '👥' },
      ].map(m => `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px 18px;text-align:center;">
          <div style="font-size:20px;margin-bottom:4px;">${m.icon}</div>
          <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:2px;">${m.value}</div>
          <div style="font-size:11px;color:#9ca3af;font-weight:500;">${m.label}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- Pontos Fortes -->
  ${audit.raw_json?.top_strengths?.length > 0 ? `
  <div style="padding:16px 52px;border-top:1px solid #e5e7eb;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#10b981;margin-bottom:12px;">💪 Pontos Fortes</h2>
    ${renderStrengths(audit.raw_json.top_strengths)}
  </div>` : ''}

  <!-- Problemas Críticos -->
  ${audit.raw_json?.critical_problems?.length > 0 ? `
  <div style="padding:16px 52px;border-top:1px solid #e5e7eb;">
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#ef4444;margin-bottom:12px;">⚠️ Problemas Críticos</h2>
    ${renderCriticalProblems(audit.raw_json.critical_problems)}
  </div>` : ''}

  <!-- Rodapé -->
  <div style="padding:10px 52px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;color:#9ca3af;">Pazos Media © ${new Date().getFullYear()}</span>
    <span style="font-size:12px;color:#9ca3af;">Post Express</span>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     ANÁLISE DETALHADA
════════════════════════════════════════════════════════════════════ -->
<div style="padding:22px 52px;">

  <!-- Cabeçalho da seção -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #e5e7eb;">
    <div style="width:6px;height:28px;background:linear-gradient(180deg,#4f46e5,#7c3aed);border-radius:3px;"></div>
    <div>
      <h2 style="font-size:20px;font-weight:800;color:#111827;">Análise Detalhada dos Auditores</h2>
      <p style="font-size:13px;color:#9ca3af;">@${escapeHtml(username)} · ${dateStr}</p>
    </div>
  </div>

  <!-- Seções de auditores -->
  ${auditorSections}

  <!-- Rodapé -->
  <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;color:#9ca3af;">Pazos Media © ${new Date().getFullYear()}</span>
    <span style="font-size:12px;color:#9ca3af;">Post Express — Auditoria @${escapeHtml(username)}</span>
  </div>
</div>

</body>
</html>`
}
