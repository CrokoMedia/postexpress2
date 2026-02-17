import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { jsPDF } from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Buscar auditoria com perfil
    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error || !audit) {
      return NextResponse.json(
        { error: 'Auditoria não encontrada' },
        { status: 404 }
      )
    }

    // Criar PDF com jsPDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Cores
    const colors = {
      primary: [79, 70, 229],      // roxo
      secondary: [99, 102, 241],    // roxo claro
      text: [17, 24, 39],           // preto
      textLight: [107, 114, 128],   // cinza
      success: [16, 185, 129],      // verde
      warning: [245, 158, 11],      // amarelo
      error: [239, 68, 68],         // vermelho
      border: [229, 231, 235]       // cinza claro
    }

    // Função para adicionar retângulo com cor de fundo
    const addBox = (x: number, y: number, w: number, h: number, bgColor: number[], borderColor?: number[]) => {
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      if (borderColor) {
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
        doc.rect(x, y, w, h, 'FD')
      } else {
        doc.rect(x, y, w, h, 'F')
      }
    }

    // Função para adicionar linha horizontal
    const addLine = (y: number, color: number[] = colors.border) => {
      doc.setDrawColor(color[0], color[1], color[2])
      doc.setLineWidth(0.5)
      doc.line(15, y, pageWidth - 15, y)
    }

    // Função para verificar se precisa de nova página
    const checkNewPage = (nextHeight: number = 20) => {
      if (yPos + nextHeight > pageHeight - 30) {
        doc.addPage()
        yPos = 20
        return true
      }
      return false
    }

    // ========== CABEÇALHO ==========
    // Fundo do cabeçalho
    addBox(0, 0, pageWidth, 50, [249, 250, 251])

    // Título centralizado
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('AUDITORIA DE INSTAGRAM', pageWidth / 2, 20, { align: 'center' })

    // Username
    doc.setFontSize(18)
    doc.text(`@${audit.profile.username}`, pageWidth / 2, 30, { align: 'center' })

    // Data
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const dateStr = new Date(audit.audit_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    doc.text(dateStr, pageWidth / 2, 38, { align: 'center' })

    yPos = 60

    // ========== SCORE GERAL (Destaque) ==========
    const classification = getClassificationLabel(audit.score_overall || 0)
    const scoreColor = getScoreColorRGB(audit.score_overall || 0)

    // Box do score
    addBox(15, yPos, pageWidth - 30, 45, [255, 255, 255], colors.border)

    // Score grande à direita
    doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b)
    doc.setFontSize(48)
    doc.setFont('helvetica', 'bold')
    doc.text(audit.score_overall.toString(), pageWidth - 40, yPos + 30, { align: 'center' })

    // Label à esquerda
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFontSize(16)
    doc.text('Score Geral', 25, yPos + 15)

    doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(classification, 25, yPos + 25)

    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2])
    doc.setFontSize(10)
    doc.text(`${audit.posts_analyzed} posts analisados`, 25, yPos + 35)

    yPos += 55

    // ========== MÉTRICAS DE ENGAJAMENTO ==========
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Métricas de Engajamento', 15, yPos)
    yPos += 8

    const metrics = [
      { label: 'Total de Likes', value: formatNumber(audit.total_likes || 0) },
      { label: 'Total de Comentários', value: formatNumber(audit.total_comments || 0) },
      { label: 'Taxa de Engajamento', value: `${audit.engagement_rate?.toFixed(2)}%` },
      { label: 'Seguidores', value: formatNumber(audit.snapshot_followers || 0) }
    ]

    const metricWidth = (pageWidth - 40) / 4
    metrics.forEach((metric, idx) => {
      const x = 15 + (idx * metricWidth)

      // Box da métrica
      addBox(x + 2, yPos, metricWidth - 4, 25, [249, 250, 251])

      // Label
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2])
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(metric.label, x + metricWidth / 2, yPos + 8, { align: 'center' })

      // Valor
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(metric.value, x + metricWidth / 2, yPos + 18, { align: 'center' })
    })

    yPos += 35

    // ========== PONTUAÇÃO POR DIMENSÃO ==========
    checkNewPage(80)

    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Pontuação por Dimensão', 15, yPos)
    yPos += 8

    const dimensions = [
      { name: 'Comportamento', score: audit.score_behavior, auditor: 'Daniel Kahneman', icon: '🧠' },
      { name: 'Copy', score: audit.score_copy, auditor: 'Eugene Schwartz', icon: '✍️' },
      { name: 'Ofertas', score: audit.score_offers, auditor: 'Alex Hormozi', icon: '💰' },
      { name: 'Métricas', score: audit.score_metrics, auditor: 'Marty Cagan', icon: '📊' },
      { name: 'Anomalias', score: audit.score_anomalies, auditor: 'Paul Graham', icon: '🔍' }
    ]

    dimensions.forEach((dim, idx) => {
      checkNewPage(25)

      const dimColor = getScoreColorRGB(dim.score || 0)

      // Box da dimensão
      addBox(15, yPos, pageWidth - 30, 20, [255, 255, 255], colors.border)

      // Nome da dimensão
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`${dim.icon} ${dim.name}`, 20, yPos + 8)

      // Auditor
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2])
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(dim.auditor, 20, yPos + 15)

      // Score
      doc.setTextColor(dimColor.r, dimColor.g, dimColor.b)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(`${dim.score}`, pageWidth - 35, yPos + 13, { align: 'center' })

      // Barra de progresso
      const barWidth = 60
      const barX = pageWidth - 90
      const barY = yPos + 7

      // Fundo da barra
      doc.setFillColor(240, 240, 240)
      doc.roundedRect(barX, barY, barWidth, 6, 3, 3, 'F')

      // Barra preenchida
      const fillWidth = (barWidth * (dim.score || 0)) / 100
      doc.setFillColor(dimColor.r, dimColor.g, dimColor.b)
      doc.roundedRect(barX, barY, fillWidth, 6, 3, 3, 'F')

      yPos += 23
    })

    // ========== ANÁLISE DOS AUDITORES ==========
    if (audit.raw_json?.auditors_analysis) {
      doc.addPage()
      yPos = 20

      // Título da seção
      addBox(0, yPos - 5, pageWidth, 15, [249, 250, 251])
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Análise Detalhada dos Auditores', 15, yPos + 5)
      yPos += 20

      const auditors = [
        {
          name: 'Daniel Kahneman',
          subtitle: 'Comportamento',
          icon: '🧠',
          data: audit.raw_json.auditors_analysis.behavior,
          hasRecommendations: true
        },
        {
          name: 'Eugene Schwartz',
          subtitle: 'Copy',
          icon: '✍️',
          data: audit.raw_json.auditors_analysis.copy,
          hasRecommendations: true
        },
        {
          name: 'Alex Hormozi',
          subtitle: 'Ofertas',
          icon: '💰',
          data: audit.raw_json.auditors_analysis.offers,
          hasRecommendations: true
        },
        {
          name: 'Marty Cagan',
          subtitle: 'Métricas',
          icon: '📊',
          data: audit.raw_json.auditors_analysis.metrics,
          hasRecommendations: true
        },
        {
          name: 'Paul Graham',
          subtitle: 'Anomalias',
          icon: '🔍',
          data: audit.raw_json.auditors_analysis.anomalies,
          hasRecommendations: false
        }
      ]

      for (const auditor of auditors) {
        checkNewPage(30)

        // Box do auditor
        addBox(15, yPos, pageWidth - 30, 12, [249, 250, 251])

        // Nome do auditor
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${auditor.icon} ${auditor.name}`, 20, yPos + 8)

        // Subtítulo
        doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2])
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(auditor.subtitle, 20 + doc.getTextWidth(`${auditor.icon} ${auditor.name}`) + 5, yPos + 8)

        yPos += 18

        // Principais Descobertas
        if (auditor.data?.key_findings && auditor.data.key_findings.length > 0) {
          checkNewPage(20)

          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text('✓ Principais Descobertas', 20, yPos)
          yPos += 6

          auditor.data.key_findings.forEach((finding: string, idx: number) => {
            checkNewPage(15)

            // Número do item
            doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
            doc.circle(23, yPos + 1, 2, 'F')

            // Texto
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')

            const lines = doc.splitTextToSize(finding, pageWidth - 50)
            lines.forEach((line: string, lineIdx: number) => {
              if (lineIdx > 0) checkNewPage(5)
              doc.text(line, 28, yPos)
              yPos += 4
            })
            yPos += 2
          })
          yPos += 5
        }

        // Recomendações / Oportunidades
        const recommendationsKey = auditor.hasRecommendations ? 'recommendations' : 'opportunities'
        const recommendationsLabel = auditor.hasRecommendations ? '→ Recomendações' : '→ Oportunidades'

        if (auditor.data?.[recommendationsKey] && auditor.data[recommendationsKey].length > 0) {
          checkNewPage(20)

          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text(recommendationsLabel, 20, yPos)
          yPos += 6

          auditor.data[recommendationsKey].forEach((rec: string, idx: number) => {
            checkNewPage(15)

            // Número do item
            doc.setFillColor(colors.success[0], colors.success[1], colors.success[2])
            doc.circle(23, yPos + 1, 2, 'F')

            // Texto
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')

            const lines = doc.splitTextToSize(rec, pageWidth - 50)
            lines.forEach((line: string, lineIdx: number) => {
              if (lineIdx > 0) checkNewPage(5)
              doc.text(line, 28, yPos)
              yPos += 4
            })
            yPos += 2
          })
        }

        yPos += 10
      }
    }

    // ========== RODAPÉ EM TODAS AS PÁGINAS ==========
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      // Linha superior do rodapé
      addLine(pageHeight - 15, colors.border)

      // Texto do rodapé
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2])
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')

      // Esquerda: nome do perfil
      doc.text(`@${audit.profile.username}`, 15, pageHeight - 8)

      // Centro: paginação
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' })

      // Direita: data
      doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 15, pageHeight - 8, { align: 'right' })
    }

    // Gerar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="auditoria-${audit.profile.username}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}

// Funções auxiliares
function getClassificationLabel(score: number): string {
  if (score >= 91) return 'EXTRAORDINÁRIO'
  if (score >= 81) return 'EXCELENTE'
  if (score >= 61) return 'BOM'
  if (score >= 41) return 'MEDIANO'
  if (score >= 21) return 'RUIM'
  return 'CRÍTICO'
}

function getScoreColorRGB(score: number): { r: number; g: number; b: number } {
  if (score >= 75) return { r: 16, g: 185, b: 129 } // verde
  if (score >= 50) return { r: 245, g: 158, b: 11 } // amarelo
  return { r: 239, g: 68, b: 68 } // vermelho
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
