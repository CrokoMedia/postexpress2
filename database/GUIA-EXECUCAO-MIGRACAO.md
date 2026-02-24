# 🚀 Guia de Execução: Migração de Foreign Keys

**Tempo estimado:** 5 minutos
**Risco:** Baixo (não perde dados)
**Backup:** Supabase faz automático

---

## 📋 O QUE VAMOS FAZER

Corrigir a foreign key da tabela `audits` para apontar para a tabela correta `instagram_profiles`.

**Problema encontrado:**
- ✅ Tabela `instagram_profiles` existe (16 registros)
- ✅ Tabela `audits` existe (43 registros)
- ❌ Tabela `profiles` NÃO existe (erro ao buscar)
- ⚠️  Foreign key de `audits.profile_id` pode estar apontando para `profiles` (errado)

**Solução:**
- Remover FK antiga que aponta para `profiles`
- Criar FK nova que aponta para `instagram_profiles`

---

## 🎯 PASSO A PASSO

### 1. Abrir Supabase SQL Editor

**Acesse:**
```
https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/sql/new
```

Ou navegue manualmente:
1. Dashboard do Supabase
2. Projeto: `kxhtoxxprobdjzzxtywb`
3. Menu lateral: **SQL Editor**
4. Botão: **New query**

---

### 2. Verificar Estado Atual (OPCIONAL)

Cole este SQL primeiro para ver o estado atual:

```sql
-- Verificar foreign keys existentes
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'audits'
  AND kcu.column_name = 'profile_id';
```

**O que esperar:**
- Se aparecer `foreign_table: profiles` → Precisa corrigir (vá para passo 3)
- Se aparecer `foreign_table: instagram_profiles` → Já está correto (PARE aqui!)
- Se não aparecer nada → Precisa criar FK (vá para passo 3)

---

### 3. Executar Migração (PRINCIPAL)

**OPÇÃO A: Script Completo (Recomendado)**

Cole todo o conteúdo do arquivo `VERIFICAR-E-CORRIGIR-FK.sql` no SQL Editor e clique em **RUN**.

Este script faz tudo:
- Verifica tabelas
- Verifica FK atual
- Remove FK antiga (se existir)
- Cria FK nova
- Valida resultado
- Testa com dados reais

**OPÇÃO B: Apenas a Correção (Rápido)**

Se preferir executar apenas a correção, cole este SQL:

```sql
-- 1. Remover constraints antigas (se existirem)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audits_profile_id_fkey'
    AND table_name = 'audits'
  ) THEN
    ALTER TABLE audits DROP CONSTRAINT audits_profile_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_audits_profile'
    AND table_name = 'audits'
  ) THEN
    ALTER TABLE audits DROP CONSTRAINT fk_audits_profile;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audits_profile_id_profiles_id_fk'
    AND table_name = 'audits'
  ) THEN
    ALTER TABLE audits DROP CONSTRAINT audits_profile_id_profiles_id_fk;
  END IF;
END $$;

-- 2. Adicionar nova foreign key
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;

-- 3. Verificar resultado
SELECT
  tc.constraint_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'audits'
  AND tc.constraint_name = 'audits_profile_id_fkey';
```

---

### 4. Validar Resultado

Execute este SQL para testar se funcionou:

```sql
-- Testar relacionamento com dados reais
SELECT
  a.id AS audit_id,
  ip.username,
  ip.followers_count,
  a.score_overall,
  a.posts_analyzed
FROM audits a
JOIN instagram_profiles ip ON a.profile_id = ip.id
ORDER BY a.created_at DESC
LIMIT 5;
```

**O que esperar:**
- ✅ Apareceram 5 auditorias com username e dados → SUCESSO!
- ❌ Erro de FK violation → Algo deu errado, entre em contato

---

### 5. Reiniciar Aplicação

No terminal do projeto:

```bash
# Parar servidor (Ctrl+C)

# Reiniciar
npm run dev
```

---

## ✅ CHECKLIST FINAL

- [ ] Abriu Supabase SQL Editor
- [ ] Executou verificação (passo 2) - OPCIONAL
- [ ] Executou migração (passo 3) - Script completo ou só correção
- [ ] Validou resultado (passo 4) - JOIN funcionou sem erros
- [ ] Reiniciou servidor Next.js (passo 5)
- [ ] Testou API: `http://localhost:3001/api/profiles`
- [ ] Testou dashboard: `http://localhost:3001/dashboard`

---

## 🔍 TROUBLESHOOTING

### Erro: "constraint already exists"

**Causa:** FK já existe e está correta
**Solução:** Nada! Está tudo certo. Pode pular a migração.

### Erro: "table instagram_profiles does not exist"

**Causa:** Tabela não foi criada
**Solução:** Execute primeiro `migration-create-instagram-profiles.sql`

### Erro: "violates foreign key constraint"

**Causa:** Existem audits com profile_id que não existe em instagram_profiles
**Solução:**
```sql
-- Encontrar audits órfãs
SELECT a.id, a.profile_id
FROM audits a
LEFT JOIN instagram_profiles ip ON a.profile_id = ip.id
WHERE ip.id IS NULL;

-- Deletar audits órfãs (se confirmar que não são importantes)
DELETE FROM audits
WHERE profile_id NOT IN (SELECT id FROM instagram_profiles);
```

### JOIN não retorna resultados

**Causa:** Não há auditorias ou perfis no banco
**Solução:** Normal se banco está vazio. Crie uma auditoria via dashboard.

---

## 📊 RESULTADO ESPERADO

```
Antes:
audits.profile_id ─FK─> profiles.id  ❌ (tabela profiles não existe)

Depois:
audits.profile_id ─FK─> instagram_profiles.id  ✅ (correto!)
```

---

## 📞 SUPORTE

Se algo der errado:

1. **Não entre em pânico** - Supabase tem backup automático
2. **Copie a mensagem de erro completa**
3. **Execute** `node scripts/verify-database-state.js` para ver estado atual
4. **Entre em contato** com a mensagem de erro

---

**Criado por:** Claude Code (Synkra AIOS)
**Data:** 2026-02-24
**Versão:** 1.0
