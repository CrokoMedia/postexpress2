# Vercel: Custos e Como Evitar Surpresas

## 🚨 Por Que Custou $60?

**Diagnóstico provável:**

1. **Excedeu limites do plano Hobby ($20/mês)**
2. **Custos adicionais por:**
   - ⚠️ **Function Executions** - Muitas chamadas de API (geração de slides)
   - ⚠️ **Function Duration** - Cada slide demora 30-60s (Remotion + Puppeteer)
   - ⚠️ **Bandwidth** - Download de imagens do Instagram + uploads para Cloudinary
   - ⚠️ **Edge Functions GB-Hours** - Processamento pesado

## 📊 Estrutura de Preços da Vercel (2026)

### Plano Hobby ($20/mês)

| Recurso | Limite Incluído | Custo Extra |
|---------|----------------|-------------|
| **Function Executions** | 100 GB-Hours | $40 por 100 GB-Hours extra |
| **Bandwidth** | 100 GB | $40 por 100 GB extra |
| **Edge Requests** | 1M | $0.65 por 100k extra |
| **Build Executions** | 100 min | $0.05 por minuto extra |
| **Max Function Duration** | 10s | 60s com Edge Middleware |

**⚠️ PROBLEMA:** Geração de slides demora 30-60s → **EXCEDE limite de 10s**

### Plano Pro ($20/mês base + usage)

| Recurso | Limite Incluído | Custo Extra |
|---------|----------------|-------------|
| **Function Executions** | 100 GB-Hours | $40 por 100 GB-Hours extra |
| **Bandwidth** | 100 GB | $40 por 100 GB extra |
| **Max Function Duration** | **300s (5 min)** ✅ | — |

**✅ VANTAGEM:** Timeout de 5 minutos (suficiente para slides)

---

## 💸 SIMULAÇÃO: Quanto Custa Gerar Slides na Vercel?

### Cenário Real (Post Express)

**Por carrossel (10 slides):**
- **Duração:** ~60s total (Remotion + Puppeteer + Cloudinary)
- **Memória:** 1GB (Puppeteer + Chromium)
- **Bandwidth:** ~5MB (download imagens + upload Cloudinary)

**Custo por carrossel:**
- **Function Execution:** 1GB × 60s = 0.0167 GB-Hours = **$0.0067**
- **Bandwidth:** 5MB = **~$0.001**
- **Total por carrossel:** **~$0.008 (menos de 1 centavo)**

**100 carrosséis/mês:**
- **Function Executions:** 1.67 GB-Hours = **$0.67**
- **Bandwidth:** 500MB = **$0.20**
- **Total:** **$0.87/mês** (dentro do limite incluído)

### Por Que Custou $60 Então?

**Possíveis causas:**

1. **Testes excessivos durante deploy** (50+ tentativas = muitas execuções)
2. **Retries automáticos** (Vercel retenta chamadas que falham)
3. **Webhooks do UAZapi** gerando muitas requisições
4. **Hot reloading em produção** (se deixou `npm run dev` rodando)
5. **Análises de perfil pesadas** (scraping + OCR = muito bandwidth)

---

## ✅ COMO EVITAR CUSTOS ALTOS NA VERCEL

### 1. **Configurar Limites de Custo** (CRÍTICO)

No dashboard da Vercel:
1. Settings → Billing
2. **Spending Limits**
3. Configurar: **$30/mês** (proteção)

Se exceder, Vercel **pausa** o projeto (não cobra mais).

### 2. **Otimizar Duração de Funções**

**Problema atual:**
```typescript
// API demora 60s → 6x o limite Hobby (10s)
export async function POST() {
  await renderSlides() // 60s ❌
}
```

**Solução: Usar Queue + Background Jobs**
```typescript
// API retorna imediatamente (< 1s)
export async function POST() {
  const jobId = await queue.add('render-slides', { carouselId })
  return NextResponse.json({ jobId, status: 'queued' })
}

// Worker separado processa em background
worker.process('render-slides', async (job) => {
  await renderSlides(job.data.carouselId)
})
```

**Benefícios:**
- API retorna em **< 1s** ✅
- Não consome Function GB-Hours (roda em worker)
- Usuário recebe notificação quando pronto

**Opções de Queue:**
- **Inngest** (free tier generoso, recomendado)
- **QStash** (Upstash, free tier até 500 jobs/dia)
- **BullMQ** + Redis (self-hosted)

### 3. **Reduzir Bandwidth**

**Problema atual:**
- Faz scraping do Instagram (download de imagens)
- Faz upload para Cloudinary
- Total: **~5-10MB por carrossel**

**Solução:**
- Usar **Cloudinary auto-fetch** (não baixar imagem, apenas passar URL)
- Reduzir qualidade de imagens intermediárias
- Cachear imagens já processadas

### 4. **Usar Edge Functions para Rotas Leves**

Rotas que não precisam de Node.js completo → mover para Edge:
```typescript
// middleware.ts (Edge Runtime - mais barato)
export const config = {
  runtime: 'edge', // ⚡ 10x mais barato que Node.js
}
```

**Use Edge para:**
- Webhooks simples (UAZapi)
- APIs de consulta (GET de dados)
- Validações rápidas

**Use Node.js apenas para:**
- Geração de slides (Puppeteer)
- OCR pesado
- Scraping

### 5. **Implementar Caching Agressivo**

```typescript
// Cache por 1 hora (reduz executions)
export const revalidate = 3600

export async function GET() {
  // Esta resposta é cacheada por 1h
}
```

### 6. **Monitorar Uso em Tempo Real**

Dashboard Vercel → **Usage**:
- Function Executions (ver quais APIs consomem mais)
- Bandwidth (identificar endpoints pesados)
- Edge Requests (ver tráfego)

**Configure alertas:**
- Alert quando atingir 50% do limite
- Alert quando atingir 80%

---

## 🆚 VERCEL vs RAILWAY: Comparação de Custos

| Aspecto | Railway | Vercel Hobby | Vercel Pro |
|---------|---------|-------------|------------|
| **Preço base** | $5/mês (Hobby) | $20/mês | $20/mês + usage |
| **Function timeout** | ∞ ilimitado ✅ | 10s ❌ | 300s (5 min) ✅ |
| **Memory limit** | 8GB ✅ | 1GB | 1GB |
| **Build time** | ∞ ilimitado ✅ | 45 min | 45 min |
| **Custos extras** | Previsíveis | Imprevisíveis ❌ | Mais previsíveis |
| **Remotion** | ✅ Funciona | ⚠️ Problemático | ✅ Pode funcionar |
| **Deploy** | Dockerfile | Automático | Automático |

**Conclusão:**

- **Railway:** Melhor para jobs pesados (Remotion, Puppeteer)
- **Vercel:** Melhor para APIs leves e rápidas

---

## 🎯 RECOMENDAÇÃO PARA POST EXPRESS

### Opção A: **Migrar para Vercel (COM otimizações)**

**Pré-requisitos:**
1. Implementar **queue system** (Inngest ou QStash)
2. Mover geração de slides para **background worker**
3. Configurar **spending limit de $30/mês**
4. Usar **Vercel Pro** ($20/mês) para timeout de 5 min

**Custo estimado:** **$20-25/mês** (previsível)

### Opção B: **Ficar no Railway (resolver problema Remotion)**

**Pré-requisitos:**
1. **Desabilitar standalone mode** (já feito)
2. **Simplificar stack:** Substituir Remotion por Puppeteer puro
3. Reduzir tamanho da imagem Docker (< 4GB)

**Custo estimado:** **$5-10/mês** (mais barato)

### Opção C: **Híbrido (melhor custo/benefício)**

1. **Vercel:** APIs leves (webhooks, consultas)
2. **Railway:** Worker pesado (geração de slides)
3. Comunicação via Queue (Inngest ou QStash)

**Custo estimado:** **$25-30/mês total** (Railway $5 + Vercel $20)

---

## 🚀 PRÓXIMOS PASSOS (escolher 1)

### 1. **Migrar para Vercel COM queue** (recomendado)
- Implementar Inngest para background jobs
- Resolver problema de timeout definitivamente
- Custo previsível e otimizado

### 2. **Simplificar no Railway** (mais rápido)
- Substituir Remotion por Puppeteer puro
- Reduzir complexidade do stack
- Resolver problema atual sem migração

### 3. **Desabilitar slides temporariamente** (emergencial)
- Focar em outras features
- Implementar slides depois com stack simplificado

---

**Qual opção você prefere?**
