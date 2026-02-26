# Fix: Remotion Bundle Path (26/02/2026)

## Problema

Erro em produção ao gerar slides:
```
Module not found: Error: Can't resolve './compositions/CarouselReel' in '/var/task/remotion'
```

### Causa Raiz

**Race condition no processo de build:**

1. ✅ `npm run build:remotion` gera bundle em `.next/remotion-bundle/`
2. ❌ `next build` executa e **LIMPA** a pasta `.next/` inteira
3. ❌ Bundle desaparece antes do deploy
4. ❌ Em produção, bundle não existe → erro `Module not found`

**Script de build anterior:**
```json
{
  "scripts": {
    "build": "npm run build:remotion && next build"
  }
}
```

O Next.js limpa `.next/` como parte do build process, removendo o bundle pré-compilado.

---

## Solução Implementada

**Mover bundle para FORA da pasta `.next/`** → agora usa `.remotion-bundle/` na raiz.

### Mudanças

**1. Script de build (`scripts/build-remotion-bundle.js`)**
```diff
- const targetDir = path.resolve(__dirname, '..', '.next', 'remotion-bundle')
+ const targetDir = path.resolve(__dirname, '..', '.remotion-bundle')
```

**2. Utilitário de bundle (`lib/remotion-bundle.ts`)**
```diff
- const bundlePath = path.resolve(process.cwd(), '.next', 'remotion-bundle')
+ const bundlePath = path.resolve(process.cwd(), '.remotion-bundle')
```

**3. Gitignore (`.gitignore`)**
```diff
# Build outputs
dist/
build/
.next/
out/
+.remotion-bundle/
```

### Por que funciona

✅ Bundle é gerado em `.remotion-bundle/` (fora de `.next/`)
✅ `next build` limpa `.next/` → bundle permanece intacto
✅ Em produção, bundle existe e funciona corretamente

---

## Testagem Local

```bash
# 1. Limpar builds antigos (opcional)
rm -rf .next .remotion-bundle

# 2. Gerar bundle
npm run build:remotion

# 3. Verificar conteúdo
ls -la .remotion-bundle/
# Deve conter: bundle.js, *.bundle.js, index.html, etc.

# 4. Build completo
npm run build

# 5. Testar em dev
npm run dev
# Acessar: http://localhost:3001/dashboard/content/[id]/configurar-slides
```

---

## Deploy em Produção (Railway)

**Railway executa automaticamente:**
```bash
npm run build
# ↓
# npm run build:remotion (gera .remotion-bundle/)
# next build (mantém .remotion-bundle/ intacto)
```

**Verificação pós-deploy:**
1. Acessar painel de configuração de slides
2. Gerar slides de um carrossel aprovado
3. Confirmar que não há erro `Module not found`

---

## Arquivos Modificados

- `scripts/build-remotion-bundle.js` → novo targetDir
- `lib/remotion-bundle.ts` → novo bundlePath
- `.gitignore` → adicionar `.remotion-bundle/`
- `docs/FIX-REMOTION-BUNDLE-PATH.md` → esta documentação

---

## Referências

- Remotion SSR Bundling: https://www.remotion.dev/docs/ssr#pre-bundling
- Issue original: "Module not found: CarouselReel" em `/var/task/remotion`
- Contexto: `.next/` é limpo pelo Next.js build process
