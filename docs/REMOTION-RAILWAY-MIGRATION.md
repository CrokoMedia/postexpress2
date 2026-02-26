# Plano B: Migrar Remotion para Railway

## Problema na Vercel

A Vercel tem limitações para Remotion:

1. **Limite de 250MB** (functions unzipped) - Difícil com @remotion + @sparticuz/chromium
2. **Timeout de 10s (Hobby) / 300s (Pro)** - Renderização pode exceder
3. **Chromium em serverless** - @sparticuz/chromium pode não funcionar corretamente
4. **Cold starts** - Chromium demora para inicializar

## Por que Railway é Melhor para Remotion

| Característica | Vercel | Railway |
|----------------|--------|---------|
| Limite de tamanho | 250MB | Ilimitado |
| Timeout | 10s-300s | Ilimitado |
| Chromium | @sparticuz (limitado) | Chromium completo |
| Cold starts | Frequentes | Menos frequentes |
| Memória | 1GB (Hobby) | Configurável (até 8GB) |
| Custo | $20/mês (Pro) | $5-20/mês (usage-based) |

## Estratégia Híbrida (Recomendado)

### Opção 1: Vercel (frontend) + Railway (renderização)

```
Vercel (Next.js frontend + APIs leves)
    ↓
Railway (APIs de renderização Remotion)
    ↓
Cloudinary (armazenamento de imagens/vídeos)
```

**Vantagens:**
- ✅ Vercel para frontend (rápido, CDN global)
- ✅ Railway para renderização pesada (sem limites)
- ✅ Melhor custo-benefício
- ✅ Escalabilidade independente

**Implementação:**
1. Deploy do Next.js na Vercel (sem APIs de renderização)
2. Deploy das APIs de renderização no Railway
3. Variável de ambiente `REMOTION_API_URL` apontando para Railway
4. Frontend chama Railway para renderizar

### Opção 2: Tudo no Railway

```
Railway (Next.js completo + Remotion)
```

**Vantagens:**
- ✅ Setup mais simples
- ✅ Sem limites de tamanho/timeout
- ✅ Chromium completo disponível

**Desvantagens:**
- ❌ Sem CDN global (mais lento para usuários distantes)
- ❌ Um único ponto de deploy

## Como Migrar para Railway

### 1. Criar projeto no Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto
railway init
```

### 2. Configurar variáveis de ambiente

No Railway dashboard, adicionar:
```
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ANTHROPIC_API_KEY=...
# ... todas as outras env vars
```

### 3. Configurar build

Criar `railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3
```

### 4. Deploy

```bash
railway up
```

## Configuração de Chromium no Railway

No Railway, Chromium funciona nativamente sem precisar de @sparticuz/chromium.

**Atualizar `lib/remotion-chromium.ts`:**

```typescript
export async function getServerlessRenderOptions() {
  const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined

  if (isRailway) {
    // Railway: usar Puppeteer com Chromium nativo
    console.log('🚂 [Remotion] Usando Chromium nativo do Railway')
    return {
      // Deixar Remotion usar Chromium padrão do sistema
    }
  }

  // Vercel: tentar @sparticuz/chromium
  // ... código existente
}
```

## Testes Antes de Migrar

Antes de migrar completamente, testar:

1. **Teste local com Chromium:**
   ```bash
   npm run dev
   # Testar geração de slides
   ```

2. **Verificar logs da Vercel:**
   - Chromium está carregando?
   - Onde exatamente falha?
   - É timeout ou erro?

3. **Considerar Vercel Pro:**
   - Se for só timeout, Vercel Pro ($20/mês) tem 300s
   - Mas limite de 250MB ainda existe

## Custos Estimados

| Plataforma | Configuração | Custo/mês |
|------------|--------------|-----------|
| Vercel Hobby | Frontend + APIs simples | $0 |
| Vercel Pro | Frontend + todas APIs | $20 |
| Railway Starter | 500h compute + 100GB transfer | $5 |
| Railway Pro | Ilimitado | $20 |
| **Híbrido** | Vercel (front) + Railway (render) | **$5-10** |

## Decisão

### Use Railway se:
- ✅ Geração de slides na Vercel falhar consistentemente
- ✅ Erros de Chromium persistirem
- ✅ Timeouts frequentes (>300s)
- ✅ Bundle exceder 250MB mesmo otimizado

### Fique na Vercel se:
- ✅ Slides gerarem corretamente (mesmo que devagar)
- ✅ Chromium carregar sem erros
- ✅ Tempo de renderização < 300s
- ✅ Budget permite Vercel Pro ($20/mês)

## Próximos Passos (Após Verificar Logs)

1. **Deploy atual completou?** → Ver logs da Vercel
2. **Logs mostram erro de Chromium?** → Considerar Railway
3. **Logs mostram timeout?** → Otimizar ou migrar
4. **Funciona mas lento?** → Avaliar Vercel Pro vs Railway

---

**Status:** 🟡 Aguardando logs da Vercel para decidir próximo passo
**Data:** 2026-02-26
**Autor:** Claude (Orion - AIOS Master)
