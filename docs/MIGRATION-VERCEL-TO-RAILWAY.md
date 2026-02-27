# Migração Vercel → Railway - Guia Completo

## 📋 Checklist Antes de Apagar da Vercel

### ✅ Itens Já Migrados

- [x] **Aplicação Next.js** - Rodando 100% no Railway
- [x] **Variáveis de Ambiente** - Todas configuradas
- [x] **Build & Deploy** - Funcionando perfeitamente
- [x] **Health Check** - Status OK

### ⚠️ Itens a Verificar/Migrar

- [ ] **CRON Job** - Agendamento de geração de conteúdo
- [ ] **Domínio customizado** (se houver)
- [ ] **Logs históricos** (backup se necessário)

---

## 🕐 CRON Job - Processo de Agendamento

### O Que É?

Endpoint: `/api/cron/process-schedules`
Frequência: A cada 5 minutos
Função: Gera conteúdo automaticamente baseado em agendamentos

### Como Verificar se Você Está Usando

Execute esta query no Supabase (SQL Editor):

```sql
SELECT
  COUNT(*) as total_schedules,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM content_generation_schedules;
```

**Resultado:**

| Cenário | Ação |
|---------|------|
| `total_schedules = 0` | ✅ **Pode pular migração de CRON** - Você não usa agendamentos |
| `total_schedules > 0` | ⚠️ **PRECISA migrar CRON** - Leia abaixo |

---

## 🚀 Opção 1: Migrar CRON para Railway

Railway também suporta cron jobs! Há 2 formas:

### A. Railway Cron (Nativo) - Recomendado

**Passos:**

1. **No Railway Dashboard:**
   - Vá no seu projeto
   - Clique em **"New" > "Cron Job"**

2. **Configurar o Cron:**
   ```
   Name: process-schedules
   Schedule: */5 * * * *  (a cada 5 minutos)
   Command: curl -X POST https://crokolab-production.up.railway.app/api/cron/process-schedules -H "Authorization: Bearer $CRON_SECRET"
   ```

3. **Adicionar variável CRON_SECRET:**
   - Railway → Variables
   - Adicione: `CRON_SECRET` = `seu-secret-super-secreto`

4. **Testar manualmente:**
   ```bash
   curl -X POST https://crokolab-production.up.railway.app/api/cron/process-schedules \
     -H "Authorization: Bearer seu-secret-super-secreto"
   ```

### B. Cron-job.org (Externo) - Alternativa

Se preferir um serviço externo gratuito:

1. Acesse: https://console.cron-job.org/
2. Crie conta (grátis)
3. Create new cron job:
   ```
   Title: Croko Lab - Process Schedules
   URL: https://crokolab-production.up.railway.app/api/cron/process-schedules
   Schedule: */5 * * * * (every 5 minutes)
   Headers: Authorization: Bearer seu-secret-super-secreto
   ```

---

## 🔧 Opção 2: Desabilitar CRON (Se Não Usar)

Se você **não usa agendamentos**, pode simplesmente remover:

```bash
# Remover arquivo de configuração Vercel
rm vercel.json

# Remover pasta .vercel
rm -rf .vercel

# Commit
git add .
git commit -m "chore: remove Vercel config (migrated to Railway)"
git push
```

---

## 🌐 Domínio Customizado (Se Houver)

### Verificar se Há Domínio na Vercel

1. Acesse: Vercel Dashboard → Seu Projeto → Settings → Domains
2. Se houver domínio configurado (ex: `app.crokolab.com`):

**Migrar para Railway:**

1. **No Railway Dashboard:**
   - Settings → Domains
   - Clique em **"Add Domain"**
   - Digite seu domínio: `app.crokolab.com`

2. **No seu DNS Provider (GoDaddy, Cloudflare, etc.):**
   - Atualize o registro CNAME:
     ```
     CNAME: app
     Value: crokolab-production.up.railway.app
     ```

3. **Aguarde propagação:**
   - Tempo: 1-24 horas (geralmente < 1h)

4. **Remover da Vercel:**
   - Vercel → Domains → Remover domínio

---

## 📊 Logs Históricos (Backup Opcional)

Se quiser manter logs da Vercel:

1. **Exportar logs:**
   ```bash
   vercel logs --follow > vercel-logs-backup.txt
   ```

2. **Salvar em local seguro** (Google Drive, S3, etc.)

---

## 🗑️ Apagar Projeto da Vercel - Passo a Passo

### Antes de Apagar - Verificações Finais

- [ ] ✅ Railway está funcionando 100%
- [ ] ✅ CRON migrado (ou confirmado que não usa)
- [ ] ✅ Domínio migrado (ou confirmado que não tem)
- [ ] ✅ Logs exportados (se necessário)

### Como Apagar

1. **Acesse Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Selecione o projeto:**
   - Clique no projeto `postexpress2`

3. **Vá em Settings:**
   - Settings → General
   - Role até o final da página

4. **Clique em "Delete Project":**
   - Digite o nome do projeto para confirmar
   - Clique em **"Delete"**

5. **Remover arquivos locais (opcional):**
   ```bash
   # Remover configuração Vercel
   rm vercel.json
   rm -rf .vercel

   # Remover variável do .env
   sed -i '' '/VERCEL_TOKEN/d' .env

   # Commit
   git add .
   git commit -m "chore: remove Vercel artifacts (fully migrated to Railway)"
   git push
   ```

---

## 🎯 Decisão Rápida - O Que Fazer?

### Cenário A: Você USA agendamentos de conteúdo
```
1. ✅ Migrar CRON para Railway (Opção 1A ou 1B)
2. ✅ Testar que está funcionando
3. ✅ Apagar da Vercel
```

### Cenário B: Você NÃO USA agendamentos
```
1. ✅ Apagar direto da Vercel (é seguro!)
2. ✅ Remover vercel.json do repositório
```

---

## 🧪 Como Testar se CRON Está Funcionando

### Teste Manual

```bash
# 1. Criar um agendamento de teste no Supabase
INSERT INTO content_generation_schedules (
  profile_id,
  audit_id,
  scheduled_at,
  quantity,
  status
) VALUES (
  1,  -- ID do perfil
  1,  -- ID da auditoria
  NOW() - INTERVAL '1 minute',  -- 1 minuto atrás (já passou)
  1,
  'pending'
);

# 2. Chamar endpoint manualmente
curl -X POST https://crokolab-production.up.railway.app/api/cron/process-schedules \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# 3. Verificar resultado
SELECT * FROM content_generation_schedules
ORDER BY created_at DESC LIMIT 5;
```

**Resultado esperado:**
- Status muda de `pending` → `completed`
- `content_suggestion_id` é preenchido
- Novo registro em `content_suggestions`

---

## 📞 Resumo Executivo

| Item | Status | Ação |
|------|--------|------|
| **Aplicação** | ✅ Migrada | Funcionando no Railway |
| **Variáveis** | ✅ Migradas | Todas configuradas |
| **CRON** | ⚠️ Verificar | Migrar se usar agendamentos |
| **Domínio** | ℹ️ Opcional | Migrar se tiver customizado |
| **Logs** | ℹ️ Opcional | Backup se necessário |

---

## 🎯 Recomendação Final

**Responda:**
1. Você usa agendamentos de geração de conteúdo? (Sim/Não)
2. Tem domínio customizado configurado? (Sim/Não)

**Se NÃO para ambas:** ✅ **Pode apagar da Vercel agora mesmo!**

**Se SIM para alguma:** ⚠️ **Siga o guia de migração acima primeiro**

---

*Última atualização: 2026-02-27*
*Dúvidas? Pergunte ao @data-engineer!*
