# Remotion - Workarounds e Manutenção

## ⚠️ Você escolheu continuar com Remotion

**Riscos aceitos:**
- Erros intermitentes de webpack
- Problemas de deploy potenciais
- Dependências nativas frágeis
- Manutenção complexa

**Benefícios:**
- ✅ Suporte a vídeos MP4 animados
- ✅ Qualidade Sofia Pro garantida
- ✅ Templates Remotion completos

---

## 🔧 Workarounds Necessários

### 1. **Sempre após `npm install`**

```bash
# Reinstalar compositor macOS
npm install --save-optional @remotion/compositor-darwin-arm64

# Limpar cache
rm -rf .next

# Reiniciar
npm run dev
```

### 2. **Se aparecer erro de webpack**

```bash
# 1. Matar todos os processos Next.js
pkill -f "next dev"

# 2. Limpar tudo
rm -rf .next node_modules/.cache

# 3. Reinstalar compositor
npm install --save-optional @remotion/compositor-darwin-arm64

# 4. Reiniciar
npm run dev
```

### 3. **Antes de deploy (Railway/Vercel)**

```bash
# 1. Gerar bundle pré-compilado
npm run build:remotion

# 2. Verificar se existe
ls -lh .remotion-bundle/

# 3. Fazer deploy
# Railway detecta e usa o bundle
```

---

## 🚨 Problemas Conhecidos

### Erro: `Module not found: @remotion/compositor-win32-x64-msvc`

**Causa:** Webpack tenta resolver pacotes Windows mesmo em macOS.

**Solução temporária:**
```bash
rm -rf .next
npm run dev
```

**Por que acontece:** O código do Remotion tem requires condicionais que o webpack analisa estaticamente.

### Erro: `ENOENT: no such file or directory` (webpack cache)

**Causa:** Cache corrompido.

**Solução:**
```bash
rm -rf .next/cache
```

---

## 📋 Checklist de Manutenção

### Diariamente
- [ ] Verificar se servidor Next.js está rodando sem erros

### Após cada `npm install`
- [ ] Reinstalar `@remotion/compositor-darwin-arm64`
- [ ] Limpar cache `.next`
- [ ] Testar preview de slides

### Antes de Deploy
- [ ] Rodar `npm run build:remotion`
- [ ] Verificar `.remotion-bundle/` existe
- [ ] Testar build localmente: `npm run build`
- [ ] Verificar env vars no Railway:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

---

## 🔍 Monitoramento

### Como saber se está funcionando:

1. **Dev Server:**
   ```bash
   curl -s http://localhost:3001 | head -1
   # Deve retornar HTML
   ```

2. **Preview de Slides:**
   - Acesse qualquer auditoria
   - Vá para "Slides"
   - Preview deve carregar sem erro 500

3. **Geração de Slides:**
   - Clique "Gerar Slides"
   - Aguarde 2-3 min
   - Verifique Cloudinary Dashboard

### Logs importantes:

```bash
# Verificar erros
tail -f .next/trace

# Verificar compositor instalado
npm list | grep compositor

# Verificar bundle
ls -lh .remotion-bundle/
```

---

## 🆘 Se Tudo Falhar

### Plano B: Migração rápida para Puppeteer

Se o Remotion quebrar em produção e você precisar de solução urgente:

```bash
# 1. Restaurar templates Puppeteer
git stash pop  # Se ainda tiver no stash

# 2. Remover Remotion
npm uninstall @remotion/bundler @remotion/renderer @remotion/player @remotion/fonts @remotion/captions @remotion/transitions remotion

# 3. Atualizar imports
# preview-carousel/route.ts
# generate-slides-v3/route.ts

# 4. Deploy
git add .
git commit -m "hotfix: migrate to Puppeteer for stable deployment"
git push
```

**Tempo:** ~10 minutos
**Downtime:** Mínimo

---

## 📊 Métricas de Saúde

### Verde (OK)
- ✅ Preview carrega em < 5s
- ✅ Geração completa em < 3min
- ✅ Zero erros de webpack no console
- ✅ Build passa sem warnings

### Amarelo (Atenção)
- ⚠️ Preview lento (> 10s)
- ⚠️ Warnings de webpack
- ⚠️ Cache corrompido ocasional

### Vermelho (Crítico)
- ❌ Erro 500 no preview
- ❌ Build falha
- ❌ Deploy quebrado
- ❌ Erros frequentes de compositor

**Ação:** Se vermelho, considerar migração para Puppeteer.

---

## 🎯 Otimizações Futuras

### 1. Dynamic Import (reduz erros webpack)

```typescript
// preview-carousel/route.ts
const { renderStill } = await import('@remotion/renderer')
const { getRemotionBundle } = await import('@/lib/remotion-bundle')
```

### 2. Remotion Cloud (remove dependências)

- Usar SaaS oficial
- Custo: ~$0.10/render
- Zero problemas de deploy

### 3. Híbrido Puppeteer + Remotion

- Puppeteer para preview (rápido)
- Remotion para slides finais (qualidade)
- Melhor dos dois mundos

---

## 📝 Notas

**Última atualização:** 2026-02-28
**Status:** Remotion ativo com workarounds
**Próxima revisão:** Após primeiro deploy em produção

**Decisão:** Aceitar complexidade do Remotion em troca de capacidade de vídeos MP4.

**Fallback:** Puppeteer + Sofia Pro (80% pronto) se Remotion quebrar em produção.
