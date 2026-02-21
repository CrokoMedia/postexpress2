# 🚀 Como Executar Migration 004 (Twitter Monitoring)

## Opção 1: SQL Editor do Supabase (RECOMENDADO)

1. **Acessar SQL Editor:**
   ```
   https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/sql
   ```

2. **Copiar conteúdo:**
   ```bash
   cat database/migrations/004_twitter_monitoring.sql | pbcopy
   # OU abrir o arquivo: database/migrations/004_twitter_monitoring.sql
   ```

3. **Colar no SQL Editor** e clicar em **"Run"**

4. **Verificar sucesso:**
   - Deve mostrar: "✅ Migration 004 completa: 4 tabelas Twitter criadas"
   - Verificar na aba "Table Editor" → tabelas `twitter_*` criadas

---

## Opção 2: Script Automático (se tiver Supabase CLI)

```bash
cd database/migrations
supabase db push
```

---

## Verificação Pós-Migration

```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'twitter_%'
ORDER BY table_name;

-- Deve retornar:
-- twitter_content_updates
-- twitter_experts
-- twitter_monitoring_log
-- twitter_stream_rules
```

---

## Próximo Passo

Após executar a migration, rodar:

```bash
npm run generate:types
# OU
npx supabase gen types typescript --project-id kxhtoxxprobdjzzxtywb > types/supabase-twitter.ts
```

---

**Status:** 📋 Aguardando execução manual no Supabase SQL Editor
