# Fix: Remotion Bundle em Ambiente Serverless

## Problema Original

```
Module not found: Error: Can't resolve './compositions/CarouselReel'
in '/var/task/remotion'
```

O erro ocorria porque o Remotion bundler tentava fazer bundle **em runtime** no ambiente serverless (Railway/Vercel), mas os arquivos TypeScript fonte não estavam disponíveis no path `/var/task/remotion`.

### Root Cause

As APIs tentavam criar o bundle dinamicamente durante o request:

```typescript
const entryPoint = path.resolve(process.cwd(), 'remotion/index.tsx')
const bundle = await bundle({ entryPoint, ... })
```

Em ambiente serverless:
- Apenas arquivos compilados (.js) são deployados
- Arquivos TypeScript fonte (.tsx) não existem em runtime
- O webpack não consegue resolver imports relativos
- Resultado: erro "Module not found"

---

## Solução Implementada

**Pré-compilar o bundle durante o build** e usar ele em runtime (recomendação oficial do Remotion).

### 1. Script de Build (`scripts/build-remotion-bundle.js`)

Cria o bundle durante `npm run build` e salva em `.next/remotion-bundle/`:

```javascript
import { bundle } from '@remotion/bundler'
import path from 'path'
import fs from 'fs'

async function buildRemotionBundle() {
  const entryPoint = path.resolve(__dirname, '..', 'remotion', 'index.tsx')
  const bundleLocation = await bundle({ entryPoint, ... })

  // Copiar para .next/remotion-bundle/ para persistência
  const targetDir = path.resolve(__dirname, '..', '.next', 'remotion-bundle')
  fs.cpSync(bundleLocation, targetDir, { recursive: true })
}
```

### 2. Função Utilitária (`lib/remotion-bundle.ts`)

Gerencia o bundle de forma centralizada:

```typescript
export async function getRemotionBundle(): Promise<string> {
  const bundlePath = path.resolve(process.cwd(), '.next', 'remotion-bundle')

  // Em produção, usar bundle pré-compilado
  if (process.env.NODE_ENV === 'production') {
    if (!fs.existsSync(bundlePath)) {
      throw new Error('Remotion bundle not found. Run "npm run build:remotion" during build.')
    }
    return bundlePath
  }

  // Em desenvolvimento, criar bundle sob demanda (uma vez)
  if (fs.existsSync(bundlePath)) {
    return bundlePath
  }

  // ... criar e cachear bundle
}
```

### 3. Atualização do package.json

```json
{
  "scripts": {
    "build": "npm run build:remotion && next build",
    "build:remotion": "node scripts/build-remotion-bundle.js"
  }
}
```

### 4. Atualização das APIs

Todas as 5 APIs que usavam Remotion foram atualizadas:

- ✅ `app/api/content/[id]/preview-carousel/route.ts`
- ✅ `app/api/content/[id]/generate-slides-v3/route.ts`
- ✅ `app/api/content/[id]/generate-reels-batch/route.ts`
- ✅ `app/api/content/[id]/generate-reel/route.ts`
- ✅ `app/api/audits/[id]/generate-audit-video/route.ts`

**Antes:**
```typescript
import { bundle } from '@remotion/bundler'

async function getBundle() {
  return await bundle({ entryPoint: 'remotion/index.tsx' })
}
```

**Depois:**
```typescript
import { getRemotionBundle } from '@/lib/remotion-bundle'

const bundleLocation = await getRemotionBundle()
```

---

## Como Funciona

### Desenvolvimento (local)

1. Primeira vez que uma API é chamada, o bundle é criado sob demanda
2. Bundle é salvo em `.next/remotion-bundle/` para cache
3. Próximas chamadas reutilizam o bundle cacheado

### Produção (Railway/Vercel)

1. Durante `npm run build`, o script `build:remotion` é executado
2. Bundle é gerado e salvo em `.next/remotion-bundle/`
3. Deploy inclui o bundle pré-compilado
4. APIs usam o bundle pré-compilado diretamente (sem criar em runtime)

---

## Teste Local

### 1. Limpar bundle existente (se houver)

```bash
rm -rf .next/remotion-bundle/
```

### 2. Rodar build do Remotion

```bash
npm run build:remotion
```

**Saída esperada:**
```
🎬 Building Remotion bundle...
📍 Entry point: /Users/.../remotion/index.tsx
✅ Bundle created at: /var/folders/.../remotion-webpack-bundle-XXXXX
📦 Bundle copied to: /Users/.../.next/remotion-bundle
✅ Remotion bundle build complete!
```

### 3. Verificar conteúdo do bundle

```bash
ls -lh .next/remotion-bundle/
```

**Arquivos esperados:**
```
283.bundle.js       # ~4.0MB
283.bundle.js.map   # ~4.5MB
bundle.js           # ~1.5MB
bundle.js.map       # ~1.9MB
index.html
favicon.ico
public/
source-map-helper.wasm
```

### 4. Testar em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3001/dashboard/audits/[id]/create-content/slides`

**Preview dos slides deve funcionar sem erros.**

### 5. Build completo

```bash
npm run build
```

O comando executa automaticamente:
1. `npm run build:remotion` (cria bundle)
2. `next build` (compila Next.js)

---

## Deploy (Railway/Vercel)

### Railway

O `railway.toml` já está configurado para rodar `npm run build` que inclui o `build:remotion`:

```toml
[build]
builder = "DOCKERFILE"
```

O Dockerfile deve executar:
```dockerfile
RUN npm install
RUN npm run build
```

### Vercel

O Vercel executa automaticamente `npm run build` durante o deploy.

### Verificação pós-deploy

Após o deploy, acesse o sistema e teste:

1. **Preview de Slides**: `/dashboard/audits/[id]/create-content/slides`
2. **Geração de Slides**: Botão "Gerar Slides"
3. **Geração de Reels**: Botão "Gerar Reel"
4. **Vídeo de Auditoria**: Geração de vídeo de resultado

**Todos devem funcionar sem o erro "Module not found".**

---

## Benefícios

1. ✅ **Funciona em ambiente serverless** (Railway, Vercel, Netlify)
2. ✅ **Mais rápido** - bundle já está pronto, sem overhead de build em runtime
3. ✅ **Mais confiável** - bundle é testado no build, não em produção
4. ✅ **Centralizado** - função utilitária `getRemotionBundle()` reutilizável
5. ✅ **Compatível com desenvolvimento** - cria bundle automaticamente se não existir

---

## Arquivos Modificados

### Novos Arquivos
- ✅ `scripts/build-remotion-bundle.js` - Script de build do bundle
- ✅ `lib/remotion-bundle.ts` - Função utilitária centralizada
- ✅ `docs/FIX-REMOTION-BUNDLE-SERVERLESS.md` - Esta documentação

### Arquivos Modificados
- ✅ `package.json` - Adicionado `build:remotion` e modificado `build`
- ✅ `app/api/content/[id]/preview-carousel/route.ts` - Usa `getRemotionBundle()`
- ✅ `app/api/content/[id]/generate-slides-v3/route.ts` - Usa `getRemotionBundle()`
- ✅ `app/api/content/[id]/generate-reels-batch/route.ts` - Usa `getRemotionBundle()`
- ✅ `app/api/content/[id]/generate-reel/route.ts` - Usa `getRemotionBundle()`
- ✅ `app/api/audits/[id]/generate-audit-video/route.ts` - Usa `getRemotionBundle()`

---

## Troubleshooting

### Erro: "Remotion bundle not found"

**Causa:** Bundle não foi gerado durante o build.

**Solução:**
```bash
npm run build:remotion
```

### Bundle desatualizado após mudanças em `remotion/`

**Causa:** Bundle é cacheado.

**Solução:**
```bash
rm -rf .next/remotion-bundle/
npm run build:remotion
```

### Erro em produção após deploy

**Causa:** Build do Remotion não foi executado no deploy.

**Solução:** Verificar logs do build e garantir que `npm run build:remotion` foi executado.

---

## Referências

- [Remotion SSR Documentation](https://www.remotion.dev/docs/ssr)
- [Remotion Pre-bundling](https://www.remotion.dev/docs/ssr#pre-bundling)
- [Next.js Serverless Functions](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

**Status:** ✅ Implementado e testado localmente
**Data:** 2026-02-26
**Autor:** Claude (Orion - AIOS Master)
