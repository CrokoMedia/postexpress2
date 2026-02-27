# Railway: API Routes Returning 404

## 🚨 Problema

**Novas rotas API retornam 404 no Railway**, mesmo após deploy bem-sucedido:

- `/api/debug/test-slides` → 404
- `/api/test-json` → 404
- Mas `/api/health` → 200 OK (rota antiga funciona)

## 📊 Evidências

1. **BuildId muda** a cada deploy (confirma que build está acontecendo)
2. **Rotas antigas funcionam** (`/api/health`, `/api/content/*`)
3. **Rotas novas retornam 404** (HTML, não JSON)
4. **Build local funciona** perfeitamente

## 🔍 Causa Raiz (Suspeita)

**Next.js Standalone Mode** no Dockerfile pode não estar incluindo novas rotas API no runtime.

### Dockerfile Atual (linhas 100-102):

```dockerfile
# Copy built Next.js app (standalone já inclui tudo necessário)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

**Problema:** Standalone pode estar cacheando rotas durante o build e não incluindo arquivos novos.

## ✅ Soluções Possíveis

### Solução 1: Copiar API Routes Explicitamente

Adicionar no Dockerfile após linha 102:

```dockerfile
# CRITICAL: Copy API routes explicitly (standalone may miss new routes)
COPY --from=builder /app/.next/server/app/api ./.next/server/app/api
```

### Solução 2: Desabilitar Standalone (Mais Pesado)

Em `next.config.mjs`, remover:

```javascript
// output: 'standalone', // REMOVE esta linha
```

Dockerfile passa a copiar `.next` completo:

```dockerfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
```

### Solução 3: Force Clean Build no Railway

No Railway Dashboard:
1. Settings → "Clear build cache"
2. Trigger manual redeploy

### Solução 4: Verificar next.config.mjs

Confirmar que não há exclusão de API routes:

```javascript
// next.config.mjs
const nextConfig = {
  // Não deve ter: exclude: ['api/**']
}
```

## 🎯 Recomendação

**Tentar Solução 1 primeiro** (menos invasiva):

1. Adicionar linha no Dockerfile
2. Commit & push
3. Aguardar deploy
4. Testar `/api/test-json`

Se não funcionar, partir para Solução 2 (desabilitar standalone).

## 📝 Logs para Investigação

```bash
# No Railway, verificar se arquivos existem no container:
railway run ls -la .next/server/app/api/
railway run ls -la .next/server/app/api/debug/
railway run ls -la .next/server/app/api/test-json/

# Se não existirem → confirma que standalone não está incluindo
```

## 🔗 Referências

- [Next.js Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Railway Deployment Issues](https://docs.railway.app/troubleshoot/fixing-common-errors)

---

*Última atualização: 2026-02-27*
*Status: Investigando*
