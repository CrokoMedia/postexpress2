# Migration Brand Kits - Instruções de Execução

## Arquivos Criados

1. **20260224000000_add_brand_kits.sql** - Migration principal
2. **20260224000001_validate_brand_kits.sql** - Script de validação

## Como Executar no Supabase

### Passo 1: Rodar a Migration Principal

1. Acesse o **Supabase Dashboard** do projeto
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie TODO o conteúdo de `20260224000000_add_brand_kits.sql`
5. Cole no editor
6. Clique em **Run** (ou `Ctrl/Cmd + Enter`)
7. Aguarde a confirmação de sucesso

### Passo 2: Validar a Migration

1. No mesmo **SQL Editor**, abra uma nova query
2. Copie TODO o conteúdo de `20260224000001_validate_brand_kits.sql`
3. Cole no editor
4. Clique em **Run**
5. Verifique os resultados:
   - ✅ Tabela `brand_kits` deve aparecer
   - ✅ 15 colunas devem estar presentes
   - ✅ 4 indexes devem estar criados
   - ✅ 3 triggers devem estar ativos
   - ✅ 2 RLS policies devem estar habilitadas

### Passo 3 (Opcional): Rodar Testes Automáticos

Para testar os triggers e constraints:

1. No script de validação, **descomente** o bloco de teste (remover `/*` e `*/`)
2. Execute novamente
3. Aguarde os `RAISE NOTICE` confirmando que todos os 4 testes passaram

## O Que Foi Criado

### Tabela `brand_kits`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `profile_id` | UUID | FK para `profiles` (CASCADE delete) |
| `brand_name` | VARCHAR(100) | Nome do brand kit |
| `is_default` | BOOLEAN | Se é o kit padrão (apenas 1 por perfil) |
| `primary_color` | VARCHAR(7) | Cor primária (formato HEX: #RRGGBB) |
| `secondary_color` | VARCHAR(7) | Cor secundária |
| `accent_color` | VARCHAR(7) | Cor de acento |
| `background_color` | VARCHAR(7) | Cor de fundo |
| `text_color` | VARCHAR(7) | Cor de texto |
| `logo_url` | TEXT | URL completa do logo (Cloudinary) |
| `logo_public_id` | VARCHAR(255) | Public ID do Cloudinary |
| `primary_font` | VARCHAR(100) | Fonte primária |
| `secondary_font` | VARCHAR(100) | Fonte secundária |
| `tone_of_voice` | JSONB | Tom de voz (estrutura JSON) |
| `deleted_at` | TIMESTAMPTZ | Soft delete |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização (auto) |

### Constraints

- **CHECK**: Todas as cores devem estar em formato HEX válido (`#RRGGBB`)
- **CASCADE**: Deletar perfil deleta todos os brand kits
- **UNIQUE**: Apenas 1 kit padrão por perfil (com index UNIQUE parcial)

### Indexes

1. `idx_brand_kits_profile_id` - Busca por profile_id
2. `idx_brand_kits_default` - Busca por kit padrão
3. `idx_brand_kits_created_at` - Ordenação temporal
4. `idx_brand_kits_one_default_per_profile` - Garantir 1 padrão/perfil

### Triggers

1. **update_brand_kits_updated_at** - Atualiza `updated_at` automaticamente
2. **ensure_default_brand_kit** - Garante que:
   - Primeiro kit é sempre padrão
   - Ao marcar novo padrão, desmarca os outros
3. **prevent_last_kit_deletion** - Impede deletar último kit e promove novo padrão

### RLS Policies

1. **Service role full access** - Acesso total para backend
2. **Public read access** - Leitura pública (apenas kits não deletados)

## Estrutura do JSONB `tone_of_voice`

Exemplo de formato esperado:

```json
{
  "characteristics": ["profissional", "amigável", "direto"],
  "examples": [
    "Oi, tudo bem? Vamos direto ao ponto!",
    "Aqui está o que você precisa saber..."
  ],
  "avoid": [
    "gírias excessivas",
    "jargões técnicos desnecessários"
  ]
}
```

## Validações Automáticas

### Cores HEX
- ✅ `#FF5733` - válido
- ✅ `#ff5733` - válido (case-insensitive)
- ❌ `FF5733` - inválido (falta #)
- ❌ `#F57` - inválido (formato curto)
- ❌ `rgb(255,87,51)` - inválido (não é HEX)

### Primeiro Kit
- Ao inserir primeiro kit → `is_default = TRUE` (automático)
- Impossível criar perfil sem ao menos 1 kit

### Kit Padrão
- Ao marcar novo kit como padrão → desmarca anteriores
- Ao deletar kit padrão → promove outro automaticamente
- Impossível deletar último kit (erro com mensagem descritiva)

## Rollback (Se Necessário)

Para reverter a migration:

```sql
-- CUIDADO: Isso apaga TODOS os dados da tabela brand_kits!
DROP TRIGGER IF EXISTS trigger_update_brand_kits_updated_at ON brand_kits;
DROP TRIGGER IF EXISTS trigger_ensure_default_brand_kit ON brand_kits;
DROP TRIGGER IF EXISTS trigger_prevent_last_kit_deletion ON brand_kits;

DROP FUNCTION IF EXISTS update_brand_kits_updated_at();
DROP FUNCTION IF EXISTS ensure_default_brand_kit();
DROP FUNCTION IF EXISTS prevent_last_kit_deletion();

DROP TABLE IF EXISTS brand_kits CASCADE;
```

## Próximos Passos

Após confirmar que a migration funcionou:

1. ✅ Task #2: Adicionar TypeScript types
2. ✅ Task #3: Implementar API POST /api/brand-kits
3. ✅ Task #4: Implementar API GET /api/brand-kits
4. E assim por diante...

---

**Criado em:** 2026-02-24
**Database Engineer:** Claude Sonnet 4.5
**Task ID:** #1
