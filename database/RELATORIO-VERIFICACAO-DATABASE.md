# 📊 Relatório de Verificação do Database - Croko Lab

**Data:** 2026-02-24
**Projeto:** Croko Lab (Post Express 2)
**Database:** Supabase PostgreSQL

---

## ✅ ESTADO ATUAL DO DATABASE

### Tabelas Existentes

| Tabela | Status | Registros | Observação |
|--------|--------|-----------|------------|
| `profiles` | ❌ NÃO EXISTE | - | Tabela antiga, pode ter sido removida |
| `instagram_profiles` | ✅ EXISTE | 16 | ✅ Correto - tabela para perfis do Instagram |
| `audits` | ✅ EXISTE | 43 | ✅ Correto - auditorias realizadas |

### Teste de Relacionamento

**Auditoria testada:** `2ff3353f-a4ef-40c2-a9af-bb7d2f25e5d0`
**Profile ID:** `1c4f71ae-6c6b-468b-a303-21a5ee46e639`

- ❌ **Busca em `profiles`**: ERRO - `column profiles.id does not exist`
- ✅ **Busca em `instagram_profiles`**: SUCESSO - Username: `rodrigogunter_`

**CONCLUSÃO:** Os dados de audits estão corretamente relacionados com `instagram_profiles`, MAS a foreign key pode estar configurada incorretamente ou apontando para a tabela `profiles` que não existe mais.

---

## 🔍 VERIFICAÇÃO NECESSÁRIA: FOREIGN KEY

### SQL para verificar Foreign Keys (execute no Supabase SQL Editor)

```sql
-- ============================================
-- VERIFICAR FOREIGN KEYS DA TABELA AUDITS
-- ============================================

SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'audits'
  AND tc.table_schema = 'public'
ORDER BY kcu.column_name;
```

### Resultados Esperados

#### ❌ CENÁRIO 1: FK aponta para `profiles` (ERRADO)

```
constraint_name: audits_profile_id_fkey
foreign_table_name: profiles
```

**AÇÃO:** Execute a migração `migration-fix-audits-foreign-key.sql` (passo 2 abaixo)

#### ✅ CENÁRIO 2: FK aponta para `instagram_profiles` (CORRETO)

```
constraint_name: audits_profile_id_fkey
foreign_table_name: instagram_profiles
```

**AÇÃO:** Nenhuma! Tudo está correto.

#### ⚠️ CENÁRIO 3: Nenhuma FK encontrada

**AÇÃO:** Execute a migração `migration-fix-audits-foreign-key.sql` (passo 2 abaixo)

---

## 🔧 MIGRAÇÕES NECESSÁRIAS

### Passo 1: Verificar tabela `instagram_profiles` ✅

**Status:** ✅ JÁ EXECUTADO - Tabela existe com 16 registros

Se por algum motivo a tabela não existir, execute:

```sql
-- Conteúdo do arquivo: database/migration-create-instagram-profiles.sql
-- (Veja o arquivo completo no repositório)
```

### Passo 2: Corrigir Foreign Key de `audits.profile_id`

**Execute no SQL Editor:**

```sql
-- ============================================
-- MIGRAÇÃO: Atualizar foreign key de audits
-- ============================================
--
-- PROBLEMA:
--   A tabela 'audits' pode ter foreign key para 'profiles' (que não existe)
--   Mas deveria apontar para 'instagram_profiles'
--
-- SOLUÇÃO:
--   1. Remover constraint antiga (se existir)
--   2. Adicionar nova constraint apontando para instagram_profiles
--
-- ============================================

-- Remover constraints antigas (todos os nomes possíveis)
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS fk_audits_profile;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;

-- Adicionar nova foreign key apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;

-- Verificar se funcionou
COMMENT ON CONSTRAINT audits_profile_id_fkey ON audits
IS 'Foreign key para instagram_profiles (perfis do Instagram auditados)';

-- ============================================
-- VERIFICAÇÃO: Execute novamente a query acima
-- para confirmar que a FK agora aponta para instagram_profiles
-- ============================================
```

---

## 📋 CHECKLIST DE EXECUÇÃO

### 1. Abrir Supabase SQL Editor

```
https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/sql/new
```

### 2. Executar SQL de Verificação de FK

- [ ] Copiar SQL da seção "VERIFICAR FOREIGN KEYS DA TABELA AUDITS"
- [ ] Colar no SQL Editor
- [ ] Executar (botão RUN)
- [ ] Anotar resultado: FK aponta para `profiles` ou `instagram_profiles`?

### 3. Executar Migração (se necessário)

**Se FK aponta para `profiles` ou não existe:**

- [ ] Copiar SQL da seção "Passo 2: Corrigir Foreign Key"
- [ ] Colar no SQL Editor
- [ ] Executar (botão RUN)
- [ ] Confirmar: "ALTER TABLE" apareceu sem erros

### 4. Verificar Novamente

- [ ] Re-executar SQL de verificação de FK
- [ ] Confirmar: FK agora aponta para `instagram_profiles`

### 5. Testar Aplicação

- [ ] Reiniciar servidor Next.js: `npm run dev`
- [ ] Acessar: `http://localhost:3001/api/profiles`
- [ ] Criar nova auditoria via dashboard
- [ ] Confirmar que não há erros de FK

---

## 📊 ESTRUTURA FINAL ESPERADA

```
instagram_profiles (16 registros)
  ├── id (UUID, PRIMARY KEY)
  ├── username (VARCHAR, UNIQUE)
  ├── full_name
  ├── biography
  ├── followers_count
  ├── ...
  └── created_at

audits (43 registros)
  ├── id (UUID, PRIMARY KEY)
  ├── profile_id (UUID) ──FK──> instagram_profiles.id
  ├── audit_date
  ├── score_overall
  ├── score_behavior
  ├── score_copy
  ├── ...
  └── created_at
```

---

## 🚀 PRÓXIMOS PASSOS APÓS MIGRAÇÃO

1. **Reiniciar servidor Next.js**
   ```bash
   npm run dev
   ```

2. **Testar APIs**
   - GET `/api/profiles` - Listar perfis do Instagram
   - GET `/api/profiles/[id]` - Perfil específico
   - GET `/api/audits` - Listar auditorias
   - GET `/api/audits/[id]` - Auditoria específica

3. **Testar Dashboard**
   - `http://localhost:3001/dashboard` - Lista de perfis
   - Criar nova análise
   - Verificar se carrega corretamente

4. **Verificar logs**
   - Sem erros de FK violation
   - Sem erros de tabela não encontrada
   - Relacionamentos funcionando

---

## 📝 OBSERVAÇÕES IMPORTANTES

### Por que `profiles` não existe?

A tabela `profiles` provavelmente foi:
1. Renomeada para `instagram_profiles` (mais semântico)
2. Removida em uma migração anterior
3. Nunca criada (projeto iniciado com `instagram_profiles` direto)

Isso NÃO é um problema, desde que:
- ✅ `instagram_profiles` exista (EXISTE)
- ✅ `audits.profile_id` aponte para `instagram_profiles` (VERIFICAR)

### Segurança dos Dados

- ✅ Nenhum dado será perdido na migração
- ✅ Foreign key com `ON DELETE CASCADE` mantém integridade
- ✅ Registros existentes não serão afetados
- ⚠️ Backup recomendado antes de executar (Supabase faz backup automático)

### Compatibilidade com Código

Após a migração, certifique-se de que o código usa:

```typescript
// ✅ CORRETO
supabase.from('instagram_profiles')

// ❌ ERRADO (se ainda existir no código)
supabase.from('profiles')
```

---

**Executado por:** Claude Code (Synkra AIOS)
**Verificação:** Automática via script `verify-database-state.js`
**Última atualização:** 2026-02-24
