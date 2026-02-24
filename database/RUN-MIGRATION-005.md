# Migration 005: Adicionar profile_id aos Twitter Experts

## 🎯 O que essa migration faz

Adiciona associação entre Twitter Experts e Perfis (clientes):
- Adiciona coluna `profile_id` (FK para `profiles`)
- Remove UNIQUE de `twitter_username` (um expert pode ser monitorado por vários clientes)
- Adiciona UNIQUE composto (`twitter_username` + `profile_id`)
- Adiciona índice para performance

## 📝 Como executar

### 1. Via Supabase Dashboard (SQL Editor)

```sql
-- Copie todo o conteúdo de:
-- database/migrations/005_twitter_add_profile_id.sql

-- E execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/[PROJECT_ID]/sql
```

### 2. Via CLI (se configurado)

```bash
supabase db push
```

## ✅ Validação

Após executar, verificar:

```sql
-- Verificar se coluna foi adicionada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'twitter_experts'
  AND column_name = 'profile_id';

-- Verificar constraint UNIQUE
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'twitter_experts'
  AND constraint_name = 'twitter_experts_username_profile_unique';

-- Verificar índice
SELECT indexname
FROM pg_indexes
WHERE tablename = 'twitter_experts'
  AND indexname = 'idx_twitter_experts_profile_id';
```

## 🔄 Rollback (se necessário)

```sql
-- Remover constraint
ALTER TABLE twitter_experts DROP CONSTRAINT IF EXISTS twitter_experts_username_profile_unique;

-- Remover índice
DROP INDEX IF EXISTS idx_twitter_experts_profile_id;

-- Remover coluna
ALTER TABLE twitter_experts DROP COLUMN IF EXISTS profile_id;

-- Restaurar UNIQUE original
ALTER TABLE twitter_experts
ADD CONSTRAINT twitter_experts_twitter_username_key UNIQUE (twitter_username);
```

---

✅ Migration pronta para ser executada!
