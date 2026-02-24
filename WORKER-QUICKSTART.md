# 🚀 Worker Quick Start Guide

Guia rápido para iniciar o sistema de workers do Croko Labs.

## ✅ Pré-requisitos

1. **Supabase configurado** com schema aplicado
2. **Variáveis de ambiente** no arquivo `.env`
3. **Dependências instaladas**

## 📦 Setup em 3 passos

### 1. Instalar dependências

```bash
npm install
```

Isso instalará o `tsx` necessário para rodar TypeScript.

### 2. Aplicar schema no Supabase (se ainda não fez)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Cole o conteúdo de `database/optimized-schema.sql`
4. Execute

### 3. Iniciar o worker

```bash
npm run worker
```

Você verá:

```
🤖 Analysis Worker iniciado
📊 Monitorando fila a cada 5s...
🔄 Máximo de 3 tentativas por análise
```

**Pronto!** O worker está rodando e monitorando a fila. ✅

---

## 🧪 Testar com primeira análise

### Opção 1: Via Interface Web

1. Inicie a aplicação Next.js:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:3000/dashboard/new

3. Preencha:
   - **Username:** rodrigogunter_
   - **Posts:** 10
   - **Skip OCR:** não

4. Clique em **Iniciar Análise**

5. O worker processará automaticamente!

### Opção 2: Via API

```bash
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rodrigogunter_",
    "post_limit": 10,
    "skip_ocr": false
  }'
```

Resposta:
```json
{
  "queue_id": "abc-123-def-456",
  "status": "queued",
  "message": "Analysis queued successfully",
  "estimated_time": "20 seconds"
}
```

### Opção 3: Direto no Supabase

No SQL Editor do Supabase:

```sql
INSERT INTO analysis_queue (username, post_limit, skip_ocr, priority)
VALUES ('rodrigogunter_', 10, false, 5);
```

---

## 📊 Acompanhar progresso

### No worker (terminal)

Você verá logs em tempo real:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 PROCESSANDO ANÁLISE: @rodrigogunter_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 FASE 1/3: Scraping de posts e comentários...
✅ Scraping concluído!

🔍 FASE 2/3: Análise OCR com Gemini Vision...
✅ OCR concluído!

🎯 FASE 3/3: Auditoria com 5 auditores...
✅ Auditoria concluída!

💾 FASE 4/4: Salvando dados no Supabase...
✅ ANÁLISE CONCLUÍDA!
```

### Na interface web

Acesse: http://localhost:3000/dashboard/new

A barra de progresso será atualizada em tempo real.

### No Supabase

```sql
SELECT
  username,
  status,
  progress,
  current_phase,
  created_at
FROM analysis_queue
ORDER BY created_at DESC;
```

---

## ⏱️ Tempo estimado

| Fase | Tempo médio |
|------|-------------|
| Scraping (10 posts) | 1-2 min |
| OCR (10 imagens) | 2-3 min |
| Auditoria (5 auditores) | 1-2 min |
| **Total** | **4-7 min** |

---

## 🛑 Parar o worker

Pressione **Ctrl+C** no terminal:

```
⏹️  Worker interrompido pelo usuário
```

O worker finaliza gracefully (aguarda análise atual completar).

---

## 🐛 Problemas comuns

### "Missing Supabase environment variables"

**Solução:** Verifique se `.env` contém:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### "tsx: command not found"

**Solução:**
```bash
npm install
```

### "Scraping failed"

**Causas:**
- Username não existe no Instagram
- `APIFY_API_TOKEN` inválido ou sem créditos
- Rate limit do Apify

**Solução:** Verifique credenciais e créditos Apify.

### "OCR failed"

**Causas:**
- `GOOGLE_API_KEY` inválido
- Quota excedida na Gemini Vision API

**Solução:**
1. Verificar key e quota
2. Ou usar `skip_ocr: true` temporariamente

### "Audit failed"

**Causas:**
- `ANTHROPIC_API_KEY` inválido
- Créditos Claude API esgotados

**Solução:** Verificar credenciais e créditos Anthropic.

---

## 📚 Próximos passos

✅ Worker funcionando
→ [Documentação completa](worker/README.md)
→ [Deploy em produção](worker/README.md#-produção)
→ [Configurações avançadas](worker/README.md#-configurações)

---

## 💡 Dicas

- **Rode em background:** Use `pm2` ou `systemd`
- **Multiple workers:** Rode múltiplas instâncias para paralelizar
- **Monitor logs:** Use `tail -f` ou dashboard do PM2
- **Database backups:** Configure backups automáticos no Supabase

---

**Dúvidas?** Consulte [worker/README.md](worker/README.md) para documentação detalhada.
