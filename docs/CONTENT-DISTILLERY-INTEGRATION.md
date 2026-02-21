# Content Distillery - Integração Completa

> Documentação da integração do Content Distillery Squad no Post Express

**Versão:** 1.0
**Data:** 2026-02-17
**Status:** ✅ Implementado

---

## 📋 O Que Foi Implementado

### 1. Página Standalone (`/dashboard/distillery`)

**Localização:** `app/dashboard/distillery/page.tsx`

**Funcionalidades:**
- ✅ Dois modos de operação com tabs:
  - **Modo Auditoria**: Gera conteúdo baseado em auditorias existentes
  - **Modo YouTube**: Extrai e gera conteúdo de vídeos do YouTube
- ✅ Lista de auditorias disponíveis (query Supabase)
- ✅ Input de URL do YouTube com validação
- ✅ Progress indicator das 6 fases do pipeline
- ✅ Exibição de resultados (frameworks, ideias, carrosséis)
- ✅ Cards informativos sobre os 9 agentes e pipeline

**Componentes:**
- Interface responsiva com Tailwind CSS
- Estados de loading, erro e sucesso
- Preview dos resultados com métricas

---

### 2. API Route (`/api/content/distill-youtube`)

**Localização:** `app/api/content/distill-youtube/route.ts`

**Endpoints:**
```typescript
POST /api/content/distill-youtube
Body: {
  mode: 'audit' | 'youtube',
  audit_id?: string,      // obrigatório se mode = 'audit'
  youtube_url?: string    // obrigatório se mode = 'youtube'
}
```

**Features:**
- ✅ Suporte a ambos os modos (audit e youtube)
- ✅ Integração com YouTube Transcript API
- ✅ Fallback de idiomas (pt-BR → en → auto)
- ✅ Validação de URL do YouTube
- ✅ Extração de video ID
- ✅ Limite de tamanho de transcrição (50k caracteres)
- ✅ Truncamento automático se necessário
- ✅ Integração com Claude Sonnet 4
- ✅ System prompt completo com os 9 agentes
- ✅ Salvamento em `content_suggestions` (modo audit)
- ✅ Logs detalhados para debug

**Processamento:**
```
Input (audit ou YouTube)
        ↓
Fetch transcript (youtube-transcript)
        ↓
Validação + truncamento
        ↓
Claude API (20k tokens output)
  - System prompt com 9 agentes
  - 6 fases do pipeline
        ↓
Parse JSON response
        ↓
Adiciona metadados
        ↓
Salva em Supabase (modo audit)
        ↓
Return JSON com results
```

---

### 3. Sidebar Navigation

**Localização:** `components/organisms/sidebar.tsx`

**Mudanças:**
- ✅ Adicionado ícone `Factory` (🏭)
- ✅ Link para `/dashboard/distillery`
- ✅ Posicionado após "Fila de Análises"

---

### 4. Dependências Instaladas

```bash
npm install youtube-transcript --legacy-peer-deps
npm install youtubei.js --legacy-peer-deps  # fallback
```

---

### 5. Script de Teste

**Localização:** `scripts/test-youtube-transcript.mjs`

**Uso:**
```bash
node scripts/test-youtube-transcript.mjs <VIDEO_ID>
```

**Funcionalidades:**
- Testa transcrição em pt-BR, en e auto
- Exibe preview dos primeiros 500 caracteres
- Debug detalhado de segmentos retornados

---

## 🔄 Fluxo Completo

### Modo Auditoria

```
1. Usuário acessa /dashboard/distillery
2. Seleciona tab "A partir de Auditoria"
3. Escolhe auditoria da lista
4. Clica "Destilar Conteúdo"
        ↓
5. POST /api/content/distill-youtube
   - mode: 'audit'
   - audit_id: '...'
        ↓
6. API busca auditoria completa no Supabase
7. Monta contexto com scores, insights, oportunidades
8. Envia para Claude com system prompt
9. Claude processa com 9 agentes (6 fases)
10. Retorna frameworks + ideias + carrosséis
11. Salva em content_suggestions
12. Retorna JSON para frontend
        ↓
13. Frontend exibe:
    - X frameworks extraídos
    - Y ideias geradas
    - Z peças de conteúdo
    - Preview dos carrosséis
```

### Modo YouTube

```
1. Usuário acessa /dashboard/distillery
2. Seleciona tab "A partir de Vídeo YouTube"
3. Cola URL do YouTube
4. Clica "Destilar Vídeo"
        ↓
5. POST /api/content/distill-youtube
   - mode: 'youtube'
   - youtube_url: '...'
        ↓
6. API extrai video ID da URL
7. Busca transcrição (youtube-transcript)
   - Tenta pt-BR
   - Fallback para en
   - Fallback para auto
8. Valida tamanho (limite 50k chars)
9. Trunca se necessário
10. Monta contexto com transcrição
11. Envia para Claude com system prompt
12. Claude processa com 9 agentes (6 fases)
13. Retorna frameworks + ideias + carrosséis
14. Retorna JSON para frontend (não salva no Supabase)
        ↓
15. Frontend exibe:
    - Video ID
    - Tamanho da transcrição
    - Se foi truncado
    - X frameworks extraídos
    - Y ideias geradas
    - Z peças de conteúdo
    - Preview dos carrosséis
```

---

## 🎯 Os 9 Agentes do Distillery

| Tier | Agente | Base | Responsabilidade |
|------|--------|------|------------------|
| **Orquestrador** | distillery-chief | - | Gerencia pipeline, quality gates |
| **Tier 0** | tacit-extractor | Cedric Chin | Conhecimento tácito (NDM/RPD) |
| **Tier 0** | model-identifier | Shane Parrish | Modelos mentais, frameworks |
| **Tier 1** | knowledge-architect | Tiago Forte | Progressive Summarization (5 camadas) |
| **Tier 1** | content-atomizer | Gary Vaynerchuk | Reverse Pyramid, 64-piece |
| **Tier 2** | idea-multiplier | Nicolas Cole & Dickie Bush | 4A Framework, 80+ ideias |
| **Tier 2** | ecosystem-designer | Dan Koe | Content Map, calendário |
| **Tier 2** | production-ops | Justin Welsh | Batch production, 730-day library |
| **Tier 3** | youtube-strategist | Paddy Galloway | CCN Rule, YouTube SEO |

---

## 📊 Output JSON

```typescript
{
  "frameworks": [
    {
      "nome": string,
      "categoria": "mental_model" | "heuristic" | "process",
      "descricao": string,
      "componentes": string[],
      "aplicacao_pratica": string
    }
  ],
  "summary_layers": {
    "layer_1_tweet": string,      // 140 chars
    "layer_2_thread": string,      // 3-5 tweets
    "layer_3_article": string,     // 500 palavras
    "layer_4_deep_dive": string,   // 1500 palavras
    "layer_5_full": string         // resumo completo
  },
  "ideas": [
    {
      "titulo": string,
      "angulo_4a": "Actionable" | "Analytical" | "Aspirational" | "Anthropological",
      "formato": "carousel" | "reel" | "post" | "story",
      "score": number (0-100),
      "plataforma": "instagram" | "linkedin" | "twitter" | "youtube"
    }
  ],
  "carousels": [
    {
      "titulo": string,
      "tipo": "educacional" | "vendas" | "autoridade" | "viral",
      "objetivo": string,
      "baseado_em": string,
      "slides": [
        {
          "numero": number,
          "tipo": "hook" | "conteudo" | "cta",
          "titulo": string,
          "corpo": string,
          "notas_design": string
        }
      ],
      "caption": string,
      "hashtags": string[],
      "cta": string
    }
  ],
  "calendar": {
    "semana_1": string[],
    "semana_2": string[],
    "semana_3": string[],
    "semana_4": string[]
  },

  // Metadados adicionados pela API
  "frameworks_count": number,
  "ideas_count": number,
  "content_pieces": number,
  "processed_at": string (ISO 8601),
  "source_mode": "audit" | "youtube",
  "source_identifier": string
}
```

---

## ⚠️ Limitações Conhecidas

### youtube-transcript

A biblioteca `youtube-transcript` tem algumas limitações:

1. **Alguns vídeos retornam array vazio** mesmo com transcrição disponível
2. **Legendas automáticas** podem não ser capturadas corretamente
3. **Vídeos privados** ou com restrições não funcionam
4. **Rate limiting** do YouTube pode bloquear após muitas requisições

**Solução alternativa:**
Usar o **etl-data-collector** que já tem `youtube-collector.js` funcional:

```javascript
// Em fetchYouTubeTranscript, como fallback:
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // Tentar youtube-transcript primeiro
    return await fetchWithYoutubeTranscript(videoId)
  } catch (error) {
    console.log('[Distillery] Fallback para etl-data-collector')

    // Fallback: usar etl-data-collector
    const cmd = `node expansion-packs/etl-data-collector/collectors/youtube-collector.js https://youtube.com/watch?v=${videoId}`
    await execAsync(cmd)

    // Ler transcript.md gerado
    const outputDir = `expansion-packs/etl-data-collector/output/${videoId}/`
    const transcript = await fs.readFile(`${outputDir}transcript.md`, 'utf-8')
    return transcript
  }
}
```

---

## 🚀 Próximos Passos

### Implementações Futuras

1. **Integração com etl-data-collector** (fallback robusto)
2. **Cache de transcrições** (evitar refetch)
3. **Queue system** para processamento assíncrono
4. **Webhook** para notificar quando processamento completo
5. **Geração automática de slides visuais** após distillery
6. **Export direto para Google Drive** dos carrosséis gerados
7. **Histórico de processamentos** (tabela `distillery_history`)
8. **Comparação entre distillery e content-creation-squad**
9. **A/B testing** de conteúdo gerado
10. **Análise de performance** dos conteúdos gerados

### Melhorias de UX

1. Progress bar com % de cada fase
2. Stream de logs em tempo real
3. Cancelamento de processamento
4. Preview antes de finalizar
5. Edição inline dos resultados

---

## 📖 Documentação de Referência

- **Content Distillery Squad**: `content-distillery/README.md`
- **youtube-transcript**: https://www.npmjs.com/package/youtube-transcript
- **Claude API**: https://docs.anthropic.com/claude/reference/messages_post
- **etl-data-collector**: `expansion-packs/etl-data-collector/README.md`

---

## ✅ Checklist de Implementação

- [x] Página `/dashboard/distillery` criada
- [x] API `/api/content/distill-youtube` implementada
- [x] Integração com youtube-transcript
- [x] Integração com Claude Sonnet 4
- [x] System prompt com 9 agentes
- [x] Modo Auditoria funcional
- [x] Modo YouTube funcional
- [x] Salvamento em Supabase (modo audit)
- [x] Validação e tratamento de erros
- [x] Logs detalhados
- [x] Link na sidebar
- [x] Script de teste
- [x] Documentação completa
- [ ] Integração com etl-data-collector (fallback)
- [ ] Queue system para processamento assíncrono
- [ ] Geração automática de slides visuais
- [ ] Cache de transcrições
- [ ] Histórico de processamentos

---

**Última atualização:** 2026-02-17
**Mantido por:** Pazos Media
