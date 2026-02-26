# Railway Deployment Troubleshooting

## ❌ Erro: `https://placeholder.supabase.co/`

### Sintoma
A aplicação está rodando mas mostra erro de Supabase com URL placeholder:
```
Error: Invalid Supabase URL: https://placeholder.supabase.co/
```

### Causa
As variáveis de ambiente do Supabase **não estão sendo passadas corretamente** durante o build ou runtime.

---

## ✅ Solução Passo a Passo

### 1️⃣ Verificar Variáveis no Railway Dashboard

Acesse: **Railway Dashboard > Seu Projeto > Settings > Variables**

**Certifique-se que TODAS essas variáveis estão configuradas:**

| Variável | Exemplo | Onde encontrar |
|----------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abc123.supabase.co` | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1Ni...` | Supabase Dashboard > Settings > API > anon/public |
| `SUPABASE_URL` | `https://abc123.supabase.co` | (mesmo que acima) |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1Ni...` | (mesmo que acima) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1Ni...` | Supabase Dashboard > Settings > API > service_role ⚠️ SECRETO |

---

### 2️⃣ Verificar Build Args no Railway

O arquivo `railway.toml` já está configurado corretamente com:

```toml
[build.buildArgs]
NEXT_PUBLIC_SUPABASE_URL = "$NEXT_PUBLIC_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
SUPABASE_URL = "$SUPABASE_URL"
SUPABASE_ANON_KEY = "$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY = "$SUPABASE_SERVICE_ROLE_KEY"
```

**Mas o Railway precisa que as variáveis estejam configuradas ANTES do build!**

---

### 3️⃣ Forçar Rebuild Completo

Depois de configurar as variáveis:

**Opção A - Via Dashboard:**
1. Settings > Deployments
2. Clique nos 3 pontos (⋮) do último deploy
3. Clique em **"Redeploy"**

**Opção B - Via CLI:**
```bash
railway up --detach
```

**Opção C - Trigger via Git:**
```bash
git commit --allow-empty -m "chore: trigger Railway rebuild with env vars"
git push
```

---

### 4️⃣ Verificar Logs do Build

Durante o deploy, verifique se as variáveis estão sendo detectadas:

```bash
railway logs --deployment
```

**Procure por:**
- ❌ `Missing SUPABASE_URL` → Variável não passou pro build
- ✅ Sem erros de "Missing" → Build OK

---

### 5️⃣ Testar no Container Localmente (Opcional)

Para garantir que o Dockerfile funciona:

```bash
# Build com as variáveis
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key" \
  --build-arg SUPABASE_URL="https://seu-projeto.supabase.co" \
  --build-arg SUPABASE_ANON_KEY="sua-anon-key" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="sua-service-key" \
  -t postexpress-test .

# Rodar
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="sua-service-key" \
  postexpress-test
```

Acesse: `http://localhost:3000`

Se funcionar localmente mas não no Railway → problema nas variáveis do Railway.

---

## 🔧 Checklist Rápido

- [ ] Todas as 5 variáveis configuradas no Railway (Settings > Variables)
- [ ] Variáveis **SEM espaços em branco** no começo/fim
- [ ] `NEXT_PUBLIC_*` variáveis são as mesmas que `SUPABASE_*` (exceto service_role)
- [ ] Railway tem acesso ao repositório com `railway.toml` e `Dockerfile`
- [ ] Redeploy completo feito (não apenas restart)
- [ ] Logs do build **não mostram** erros de "Missing"

---

## 🐛 Problemas Comuns

### 1. "Variáveis configuradas mas ainda dá erro"

**Causa:** Railway pode ter cache do build anterior.

**Solução:**
```bash
# Limpar cache e rebuild
railway up --detach
```

### 2. "Erro só em produção, local funciona"

**Causa:** Arquivo `.env` funciona localmente mas não existe no Railway.

**Solução:** Configurar TODAS as variáveis no Railway Dashboard.

### 3. "Service Role Key exposta"

**Causa:** Variável `SUPABASE_SERVICE_ROLE_KEY` é SECRETA e não deve ser exposta no client.

**Solução:**
- ✅ Está correta: só é usada em API routes (`getServerSupabase()`)
- ✅ Não está no código client (não tem `NEXT_PUBLIC_`)
- ⚠️ Nunca commitar no `.env` no Git

### 4. "Build passa mas runtime falha"

**Causa:** Next.js precisa das variáveis `NEXT_PUBLIC_*` em **build time** E **runtime**.

**Solução:**
- Build args passam variáveis pro build (já configurado)
- Variáveis de ambiente passam pro runtime (configurar no Railway)

---

## 📞 Suporte

Se o problema persistir:

1. Execute o script de verificação:
   ```bash
   ./scripts/check-railway-env.sh
   ```

2. Capture os logs completos:
   ```bash
   railway logs --deployment > railway-deploy.log
   ```

3. Verifique se o arquivo `railway.toml` está no repositório:
   ```bash
   git ls-files railway.toml
   ```

4. Verifique qual branch o Railway está usando:
   - Dashboard > Settings > Deployment > Branch

---

## 🎯 Resumo da Solução

```bash
# 1. Configure as variáveis no Railway Dashboard
# 2. Force rebuild
railway up --detach

# 3. Monitore logs
railway logs

# 4. Teste a aplicação
curl https://seu-projeto.up.railway.app/api/health
```

**Tempo esperado:** 5-10 minutos para rebuild completo.

---

*Última atualização: 2026-02-27*
