# Troubleshooting - Erro ao Gerar Slides no Railway

## 🚨 Sintoma

**Erro:** "API retornou resposta inválida (não-JSON). Verifique os logs do servidor."

**Quando ocorre:** Ao tentar gerar slides no Railway (produção)

---

## 🔍 Diagnóstico

### 1. Verificar Logs do Railway

**Acesse os logs em tempo real:**

```bash
# Opção 1: Railway Dashboard
https://railway.app → Seu Projeto → Deployments → Logs

# Opção 2: Railway CLI
railway logs
```

**O que procurar:**
- ❌ `Remotion bundle not found`
- ❌ `Error in getRemotionBundle`
- ❌ `Failed to build Remotion bundle`
- ❌ `Chromium not found`
- ❌ Erros de memória (OOM - Out of Memory)
- ❌ Timeout errors

---

## 🛠️ Soluções

### Solução 1: Verificar Bundle Remotion

**Problema:** Bundle não foi gerado ou copiado corretamente

**Como verificar:**

```bash
# SSH no container do Railway (se disponível)
railway run ls -la .remotion-bundle/
```

**Esperado:**
```
.remotion-bundle/
├── 283.bundle.js (4.2MB)
├── 761.bundle.js
├── 810.bundle.js
├── 845.bundle.js
├── bundle.js (1.6MB)
├── favicon.ico
├── index.html
└── public/
```

**Se bundle não existir:**

1. **Force rebuild no Railway:**
   ```bash
   git commit --allow-empty -m "chore: force Railway rebuild"
   git push
   ```

2. **Ou adicione variável de ambiente temporária:**
   - Railway → Variables → Add Variable
   - Name: `FORCE_REBUILD`
   - Value: `true`
   - Redeploy

---

### Solução 2: Aumentar Memória do Container

**Problema:** Rendering de slides consome muita memória (Chromium + Remotion)

**Railway free tier:** 512MB RAM (pode ser insuficiente)
**Recomendado:** 1GB+ para rendering

**Como aumentar:**

1. Railway Dashboard → Settings → Resources
2. Ajuste **Memory Limit** para 1024 MB ou mais
3. Redeploy

---

### Solução 3: Adicionar Timeout Maior

**Problema:** Rendering demora > 60s e Railway mata o processo

**Como aumentar timeout:**

Edite `app/api/content/[id]/generate-slides-v3/route.ts`:

```typescript
// Linha 15 (já existe mas pode estar baixo)
export const maxDuration = 300 // 5 minutos
```

**E no Railway:**

Adicione variável de ambiente:
```
REQUEST_TIMEOUT=300000
```

---

### Solução 4: Verificar Variáveis de Ambiente

**Variáveis CRÍTICAS para geração de slides:**

```bash
# Supabase (obrigatórias)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Cloudinary (obrigatórias para upload de slides)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# FAL.ai (obrigatório para geração de imagens)
FAL_KEY=

# Chromium (já definido no Dockerfile, mas pode verificar)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
REMOTION_CHROMIUM_PATH=/usr/bin/chromium-browser
```

**Como verificar:**

Railway Dashboard → Variables → Confirme que TODAS existem

---

### Solução 5: Adicionar Logs de Debug

**Para entender onde está falhando:**

Edite `lib/remotion-bundle.ts`:

```typescript
export async function getRemotionBundle(): Promise<string> {
  const bundlePath = path.resolve(process.cwd(), '.remotion-bundle')

  console.log('🔍 [DEBUG] Checking bundle path:', bundlePath)
  console.log('🔍 [DEBUG] Current working directory:', process.cwd())
  console.log('🔍 [DEBUG] NODE_ENV:', process.env.NODE_ENV)

  if (process.env.NODE_ENV === 'production') {
    const exists = fs.existsSync(bundlePath)
    console.log('🔍 [DEBUG] Bundle exists:', exists)

    if (!exists) {
      console.error('❌ [ERROR] Bundle not found at:', bundlePath)
      console.error('❌ [ERROR] Directory contents:', fs.readdirSync(process.cwd()))
      throw new Error(
        'Remotion bundle not found. Ensure "npm run build:remotion" runs during build.'
      )
    }
    console.log('📦 [Remotion] Usando bundle pré-compilado')
    return bundlePath
  }

  // ... resto do código
}
```

**Deploy e verifique logs:**

```bash
railway logs --tail 100
```

---

### Solução 6: Testar Geração Manual (Debug Mode)

**Criar endpoint de teste para verificar cada etapa:**

Crie `app/api/debug/test-slides/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { getServerlessRenderOptions } from '@/lib/remotion-chromium'
import fs from 'fs'

export async function GET() {
  const checks = []

  // Check 1: Bundle exists
  try {
    const bundlePath = await getRemotionBundle()
    checks.push({
      name: 'Remotion Bundle',
      status: 'OK',
      path: bundlePath,
      exists: fs.existsSync(bundlePath)
    })
  } catch (error) {
    checks.push({
      name: 'Remotion Bundle',
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error)
    })
  }

  // Check 2: Chromium
  try {
    const options = await getServerlessRenderOptions()
    checks.push({
      name: 'Chromium',
      status: 'OK',
      chromiumPath: options.chromiumPath
    })
  } catch (error) {
    checks.push({
      name: 'Chromium',
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error)
    })
  }

  // Check 3: Cloudinary
  checks.push({
    name: 'Cloudinary',
    status: process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING',
    configured: !!process.env.CLOUDINARY_CLOUD_NAME
  })

  // Check 4: FAL.ai
  checks.push({
    name: 'FAL.ai',
    status: process.env.FAL_KEY ? 'OK' : 'MISSING',
    configured: !!process.env.FAL_KEY
  })

  return NextResponse.json({
    status: 'Debug Checks',
    checks,
    environment: process.env.NODE_ENV,
    cwd: process.cwd(),
    platform: process.platform,
    nodeVersion: process.version
  })
}
```

**Acesse:**
```
https://crokolab-production.up.railway.app/api/debug/test-slides
```

---

## 🎯 Checklist de Solução

Execute na ordem:

- [ ] 1. Verificar logs do Railway (`railway logs`)
- [ ] 2. Confirmar todas variáveis de ambiente estão configuradas
- [ ] 3. Aumentar memória para 1GB+ (Settings → Resources)
- [ ] 4. Adicionar logs de debug em `remotion-bundle.ts`
- [ ] 5. Criar endpoint `/api/debug/test-slides` e testar
- [ ] 6. Se bundle não existir, force rebuild com commit vazio
- [ ] 7. Se memória estourar, aumentar limite no Railway

---

## 📊 Comparação: Funciona Local vs Falha Railway

| Aspecto | Local (✅ Funciona) | Railway (❌ Falha) | Solução |
|---------|---------------------|-------------------|---------|
| Bundle | `.remotion-bundle/` existe | Pode não existir | Force rebuild |
| Memória | Ilimitada | 512MB (free) | Aumentar para 1GB+ |
| Timeout | Ilimitado | 60s default | `maxDuration = 300` |
| Chromium | System chromium | Alpine chromium | Já configurado no Dockerfile |
| Logs | Console direto | Railway logs | `railway logs` |

---

## 🆘 Se Nada Funcionar

**Último recurso: Gerar bundle localmente e commitar**

```bash
# 1. Rebuild bundle local
npm run build:remotion

# 2. Force add to git (se estava ignorado)
git add -f .remotion-bundle/

# 3. Commit
git commit -m "fix: add pre-built Remotion bundle for Railway"

# 4. Push
git push

# 5. Aguarde redeploy no Railway
```

**Por que isso funciona:**
- Bundle pré-compilado no git → Railway apenas copia (rápido)
- Não depende de build dinâmico no Railway
- Garante bundle idêntico ao local

**Trade-off:**
- ⚠️ Bundle ocupa ~6MB no repo
- ⚠️ Precisa rebuild sempre que mudar templates Remotion

---

## 📞 Próximos Passos

1. **Execute Solução 6** (endpoint de debug) PRIMEIRO
2. **Copie output completo** do `/api/debug/test-slides`
3. **Copie logs do Railway** (`railway logs`)
4. **Compartilhe aqui** para diagnóstico preciso

---

*Última atualização: 2026-02-27*
*Autor: @aios-master*
