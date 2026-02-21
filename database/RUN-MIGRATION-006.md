# Migration 006: Profile Context

## O que faz

Adiciona sistema de **contexto personalizado** por perfil, permitindo armazenar informações adicionais + upload de documentos para enriquecer auditorias e criação de conteúdo.

### Mudanças:
1. ✅ Cria tabela `profile_context` (1:1 com profiles)
2. ✅ Campos estruturados (nicho, público, tom de voz, etc.)
3. ✅ Suporte a documentos (JSONB) + texto extraído
4. ✅ Funções para rastrear uso do contexto
5. ✅ View `profiles_with_context` para queries otimizadas

## Como executar

### Opção 1: SQL Editor (Supabase Dashboard) ⭐ RECOMENDADO

1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Cole o conteúdo de `database/migrations/006_profile_context.sql`
3. Clique em **Run**
4. Verifique sucesso com a query abaixo

### Opção 2: psql (local)

```bash
psql $DATABASE_URL -f database/migrations/006_profile_context.sql
```

## Verificar sucesso

```sql
-- Deve retornar a estrutura da tabela
\d profile_context

-- Deve retornar a view
SELECT * FROM profiles_with_context LIMIT 1;

-- Testar função de incremento
SELECT increment_context_usage(
  (SELECT id FROM profiles LIMIT 1),
  'audit'
);
```

## Estrutura de dados

### Campos principais:
- `who_is` - Quem é a pessoa/marca
- `niche` - Nicho de atuação
- `target_audience` - Público-alvo
- `products_services` - O que vende
- `pain_points` - Dores que resolve
- `tone_of_voice` - Tom de voz desejado
- `goals` - Objetivos
- `documents` - JSONB array de documentos uploaded
- `raw_text` - Texto extraído dos documentos

### Exemplo de documento em JSONB:
```json
{
  "id": "uuid-v4",
  "filename": "briefing-cliente.pdf",
  "url": "https://cloudinary.com/...",
  "type": "application/pdf",
  "size": 245678,
  "uploaded_at": "2026-02-19T...",
  "extracted_text_length": 5432
}
```

## Rollback (se necessário)

```sql
DROP VIEW IF EXISTS profiles_with_context;
DROP FUNCTION IF EXISTS increment_context_usage(UUID, TEXT);
DROP TRIGGER IF EXISTS trigger_profile_context_updated_at ON profile_context;
DROP FUNCTION IF EXISTS update_profile_context_updated_at();
DROP TABLE IF EXISTS profile_context CASCADE;
```

## Próximos passos

Após rodar esta migration:
1. ✅ Criar endpoints API para contexto e upload
2. ✅ Criar modal na UI do perfil
3. ✅ Integrar com audit-with-squad.js
4. ✅ Integrar com content-creation-squad
