# Setup CRON - Guia Rápido (2 Minutos)

## 🎯 Objetivo

Configurar CRON para processar agendamentos de geração de conteúdo automaticamente a cada 5 minutos.

---

## ✅ Opção A: Cron-job.org (Recomendado - GRÁTIS)

### 1. Gerar Secret Key

```bash
# Gere uma chave secreta (copie o resultado)
openssl rand -base64 32
```

**Exemplo de resultado:**
```
A8xK2mN9pQ7rS3tU5vW6yZ8aC0bD1eF2
```

---

### 2. Adicionar CRON_SECRET no Railway

1. **Railway Dashboard:**
   - https://railway.app/dashboard
   - Seu projeto → **Variables**

2. **Adicionar variável:**
   ```
   Key:   CRON_SECRET
   Value: A8xK2mN9pQ7rS3tU5vW6yZ8aC0bD1eF2
   ```
   (use a chave que você gerou no passo 1)

3. **Não precisa redeploy** - variável fica disponível imediatamente

---

### 3. Criar conta no Cron-job.org

1. Acesse: **https://console.cron-job.org/signup**
2. Crie conta gratuita (email + senha)
3. Confirme email

---

### 4. Criar o CRON Job

1. **Login em:** https://console.cron-job.org/
2. Clique em **"Create cron job"**

3. **Preencha os campos:**

```
┌─────────────────────────────────────────┐
│ Title:                                  │
│ Croko Lab - Process Schedules           │
├─────────────────────────────────────────┤
│ URL:                                    │
│ https://crokolab-production.up.railway.app/api/cron/process-schedules │
├─────────────────────────────────────────┤
│ Schedule:                               │
│ ● Every 5 minutes                       │
│   (selecione no dropdown)               │
├─────────────────────────────────────────┤
│ Request method:                         │
│ ● POST                                  │
├─────────────────────────────────────────┤
│ Request headers:                        │
│ + Add header                            │
│                                         │
│   Name:  Authorization                  │
│   Value: Bearer A8xK...F2               │
│          (sua CRON_SECRET)              │
└─────────────────────────────────────────┘
```

4. **Clique em "Create"**

---

### 5. Testar o CRON

**Opção 1 - Teste Manual Via Browser:**

Acesse no navegador:
```
https://console.cron-job.org/jobs
```

- Encontre seu job
- Clique em **"▶️ Run now"** (executar agora)
- Veja o resultado na aba **"History"**

**Esperado:**
- ✅ Status: `200 OK`
- ✅ Response: `{"message": "Processamento concluído", ...}`

---

**Opção 2 - Teste Via Terminal:**

```bash
curl -X POST https://crokolab-production.up.railway.app/api/cron/process-schedules \
  -H "Authorization: Bearer SUA_CRON_SECRET_AQUI"
```

**Resposta esperada:**
```json
{
  "message": "Nenhum agendamento pendente",
  "processed": 0
}
```

ou

```json
{
  "message": "Processamento concluído",
  "processed": 2,
  "succeeded": 2,
  "failed": 0
}
```

---

### 6. Verificar que Está Funcionando

No Cron-job.org → **History tab**:

```
✅ 2026-02-27 14:35:00  200 OK  120ms
✅ 2026-02-27 14:30:00  200 OK  115ms
✅ 2026-02-27 14:25:00  200 OK  118ms
```

---

## 🎉 Pronto!

Agora o CRON está rodando automaticamente a cada 5 minutos!

**Benefícios:**
- ✅ Grátis
- ✅ Monitoring visual
- ✅ Email notifications (se falhar)
- ✅ Logs de execução
- ✅ Estatísticas

---

## ✅ Opção B: Railway Cron (Alternativa)

**IMPORTANTE:** Railway cobra $5/mês para cron jobs.

Se preferir usar Railway nativo:

1. **Railway Dashboard → New**
2. **Selecione "Cron Job"**
3. **Configure:**
   ```
   Schedule: */5 * * * *
   Command: curl -X POST $SERVICE_URL/api/cron/process-schedules -H "Authorization: Bearer $CRON_SECRET"
   ```

**Custo:** $5/mês adicional

---

## 📊 Comparação

| Feature | Cron-job.org | Railway Cron |
|---------|--------------|--------------|
| **Preço** | Grátis | $5/mês |
| **Setup** | 2 min | 5 min |
| **Monitoring** | Visual + Email | Logs |
| **Confiabilidade** | Alta | Alta |

**Recomendação:** Use **Cron-job.org** (grátis e melhor interface)

---

## 🐛 Troubleshooting

### "401 Unauthorized"
- Verifique se CRON_SECRET está correta
- Verifique header: `Authorization: Bearer SUA_SECRET`

### "500 Internal Server Error"
- Verifique logs no Railway: `railway logs`
- Verifique variáveis Supabase estão configuradas

### Cron não executa
- Verifique schedule: `*/5 * * * *`
- Verifique URL está correta
- Teste manual primeiro

---

**Tempo total:** 5 minutos
**Custo:** R$ 0,00 (grátis)

✅ **Depois de configurar, me avise para passarmos para a próxima task!**
