# Guia de Migração - Criar Tabela instagram_profiles

## Problema

O dashboard em `http://localhost:3001/dashboard` não mostra perfis auditados porque:

1. ✅ Tabela `audits` existe e tem 3 auditorias
2. ✅ Tabela `posts` existe
3. ❌ Tabela `profiles` existe **MAS é a tabela errada**
   - A tabela `profiles` atual armazena perfis de **creators do sistema** (campos: `positioning`, `tone_of_voice`, `beliefs`, etc.)
   - O sistema de auditoria precisa de perfis do **Instagram** (campos: `username`, `followers_count`, `biography`, etc.)

## Solução

Criar tabela `instagram_profiles` para perfis do Instagram auditados, mantendo a tabela `profiles` atual para creators.

## Passo 1: Executar migração no Supabase

1. Abra o **SQL Editor** do Supabase: https://supabase.com/dashboard/project/[SEU_PROJETO]/sql
2. Copie e execute o conteúdo do arquivo: `database/migration-create-instagram-profiles.sql`
3. Clique em **Run** (ou Ctrl/Cmd + Enter)
4. Verifique se aparece: **Success. No rows returned**

## Passo 2: Atualizar código para usar instagram_profiles

Após executar a migração, os seguintes arquivos serão atualizados automaticamente:

- `app/api/profiles/route.ts` → usar `instagram_profiles`
- `worker/analysis-worker.ts` → usar `instagram_profiles`
- Outros arquivos do sistema de auditoria

## Passo 3: Verificar

Execute no terminal:

```bash
curl -s http://localhost:3001/api/profiles | jq '.'
```

Deve retornar:

```json
{
  "profiles": [],
  "total": 0
}
```

## Próximos passos

Após a migração, você poderá:

1. Criar nova análise de perfil do Instagram
2. Os perfis auditados aparecerão no dashboard
3. O sistema de creators continuará funcionando normalmente com a tabela `profiles`

## Comandos úteis

```sql
-- Verificar se a tabela foi criada
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'instagram_profiles';

-- Ver estrutura da tabela
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'instagram_profiles';

-- Contar registros (deve retornar 0 inicialmente)
SELECT COUNT(*) FROM instagram_profiles;
```
