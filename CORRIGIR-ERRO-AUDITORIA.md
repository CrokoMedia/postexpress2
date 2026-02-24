# 🔧 CORRIGIR ERRO "column id does not exist"

## ❌ Problema Identificado

O erro ocorre porque:
1. O código foi migrado para usar `instagram_profiles`
2. Mas a tabela `audits` no banco ainda tem FK apontando para `profiles` (tabela antiga)
3. Quando tenta inserir uma auditoria, a FK falha

## ✅ Solução (3 minutos)

### Passo 1: Abrir SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Verificar estado atual

Execute esta query para ver a FK atual:

```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'audits'
  AND kcu.column_name = 'profile_id';
```

**Resultado esperado:**
- Se mostrar `foreign_table_name = 'profiles'` → FK ERRADA (precisa corrigir)
- Se mostrar `foreign_table_name = 'instagram_profiles'` → FK CORRETA (já está ok)

### Passo 3: Executar migração (se necessário)

Se a FK estiver apontando para `profiles`, execute:

```sql
-- ============================================
-- MIGRAÇÃO: Atualizar foreign key de audits
-- ============================================

-- Remover constraint antiga
ALTER TABLE audits
DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;

ALTER TABLE audits
DROP CONSTRAINT IF EXISTS fk_audits_profile;

ALTER TABLE audits
DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;

-- Adicionar nova foreign key apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;

-- Comentário para documentação
COMMENT ON CONSTRAINT audits_profile_id_fkey ON audits
IS 'Foreign key para instagram_profiles (perfis do Instagram auditados)';
```

### Passo 4: Verificar sucesso

Execute novamente a query do Passo 2. Agora deve mostrar:
- `foreign_table_name = 'instagram_profiles'` ✅

### Passo 5: Testar no sistema

1. Volte ao dashboard
2. Tente criar uma nova análise para `@crokolabs`
3. Deve funcionar sem erros!

## 🔍 Verificar outras FKs (opcional)

Execute para ver todas as FKs que ainda apontam para `profiles`:

```sql
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'profiles';
```

Se outras tabelas além de `audits` aparecerem, talvez precisem ser migradas também.

## 📋 Checklist de verificação

- [ ] Executei query de verificação (Passo 2)
- [ ] FK estava apontando para `profiles` (tabela errada)
- [ ] Executei migração SQL (Passo 3)
- [ ] Verifiquei que FK agora aponta para `instagram_profiles`
- [ ] Testei criar auditoria no dashboard
- [ ] Auditoria foi criada com sucesso ✅

## 🚨 Se mesmo assim não funcionar

Se após executar a migração ainda aparecer erro, execute:

```sql
-- Ver estrutura completa da tabela audits
\d audits

-- Ver todas as constraints
SELECT * FROM information_schema.table_constraints
WHERE table_name = 'audits';
```

E me envie o resultado para debug adicional.

---

**Tempo estimado:** 3 minutos
**Risco:** Baixo (apenas altera FK, não perde dados)
**Rollback:** Recriar FK antiga se necessário
