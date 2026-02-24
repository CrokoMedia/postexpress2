# 📚 Índice: Documentação de Migração de Database

**Projeto:** Croko Lab (Post Express 2)
**Data:** 2026-02-24
**Versão:** 1.0

---

## 🎯 INÍCIO RÁPIDO

**Você precisa executar a migração?** Leia nesta ordem:

1. **RESUMO-VERIFICACAO.md** (2 min) - Status atual e SQL rápido
2. **GUIA-EXECUCAO-MIGRACAO.md** (5 min) - Passo a passo ilustrado
3. Execute SQL no Supabase e pronto!

---

## 📁 ARQUIVOS CRIADOS

### 🚀 Para Execução

| Arquivo | Tipo | Quando Usar | Tempo |
|---------|------|-------------|-------|
| **RESUMO-VERIFICACAO.md** | Markdown | Visão geral + SQL rápido | 2 min |
| **GUIA-EXECUCAO-MIGRACAO.md** | Markdown | Passo a passo detalhado | 5 min |
| **VERIFICAR-E-CORRIGIR-FK.sql** | SQL | Script completo (verificação + correção) | 3 min |

### 📊 Para Análise

| Arquivo | Tipo | Quando Usar | Tempo |
|---------|------|-------------|-------|
| **RELATORIO-VERIFICACAO-DATABASE.md** | Markdown | Relatório completo da auditoria | 10 min |
| **DESCOBERTAS-TECNICAS.md** | Markdown | Detalhes técnicos e hipóteses | 15 min |

### 🔧 Scripts Node.js

| Arquivo | Tipo | Quando Usar | Comando |
|---------|------|-------------|---------|
| **verify-database-state.js** | Node.js | Verificar estado atual | `node scripts/verify-database-state.js` |
| **check-foreign-keys.js** | Node.js | Verificar FKs (limitado) | `node scripts/check-foreign-keys.js` |
| **check-and-migrate-database.js** | Node.js | Tentativa de migração automática (usa RPC) | `node scripts/check-and-migrate-database.js` |

### 📄 Migrações SQL (originais)

| Arquivo | Quando Foi Criado | Status |
|---------|-------------------|--------|
| **migration-create-instagram-profiles.sql** | Antes desta sessão | ✅ JÁ EXECUTADO |
| **migration-fix-audits-foreign-key.sql** | Antes desta sessão | ⚠️ PENDENTE |

---

## 🗺️ FLUXO DE NAVEGAÇÃO

### Cenário 1: "Preciso executar a migração AGORA"

```
📄 RESUMO-VERIFICACAO.md
    ↓
    Cole SQL no Supabase SQL Editor
    ↓
    Validar resultado
    ↓
    Reiniciar servidor
```

**Tempo total:** 3 minutos

---

### Cenário 2: "Quero entender tudo antes de executar"

```
📄 RESUMO-VERIFICACAO.md (visão geral)
    ↓
📄 RELATORIO-VERIFICACAO-DATABASE.md (detalhes)
    ↓
📄 GUIA-EXECUCAO-MIGRACAO.md (passo a passo)
    ↓
📄 VERIFICAR-E-CORRIGIR-FK.sql (SQL comentado)
    ↓
    Executar no Supabase
```

**Tempo total:** 20 minutos

---

### Cenário 3: "Sou desenvolvedor, quero todos os detalhes técnicos"

```
📄 DESCOBERTAS-TECNICAS.md (análise completa)
    ↓
📄 RELATORIO-VERIFICACAO-DATABASE.md (estado do banco)
    ↓
🔧 node scripts/verify-database-state.js (verificar localmente)
    ↓
📄 migration-fix-audits-foreign-key.sql (SQL original)
    ↓
    Executar no Supabase
    ↓
    Validar via script ou SQL
```

**Tempo total:** 30 minutos

---

### Cenário 4: "Já executei, quero validar"

```
🔧 node scripts/verify-database-state.js
    ↓
    Verificar output:
      ✅ FK aponta para instagram_profiles? → SUCESSO
      ❌ Ainda aponta para profiles? → Re-executar migração
    ↓
    Testar API: http://localhost:3001/api/profiles
    ↓
    Criar nova auditoria no dashboard
```

**Tempo total:** 5 minutos

---

## 📖 DESCRIÇÃO DETALHADA DOS ARQUIVOS

### 1. RESUMO-VERIFICACAO.md

**O que é:**
- Resumo executivo visual
- SQL de correção pronto para copiar/colar
- Checklist de execução
- Links rápidos

**Quando usar:**
- Você precisa executar a migração rapidamente
- Quer visão geral do problema
- Prefere ler menos e agir mais

**Destaque:**
```sql
-- SQL pronto para executar (1 minuto)
DO $$...$$;
ALTER TABLE audits...
```

---

### 2. GUIA-EXECUCAO-MIGRACAO.md

**O que é:**
- Passo a passo ilustrado
- Capturas de tela (texto)
- Troubleshooting
- Validação pós-migração

**Quando usar:**
- Primeira vez fazendo este tipo de migração
- Quer garantir que está fazendo certo
- Prefere seguir checklist detalhado

**Destaque:**
- ✅ Checklist completo
- 🔍 Seção de troubleshooting
- 📊 Diagramas antes/depois

---

### 3. VERIFICAR-E-CORRIGIR-FK.sql

**O que é:**
- Script SQL completo
- Comentários explicativos
- Verificação + Correção + Validação
- Usa `\echo` para output visual

**Quando usar:**
- Quer executar tudo de uma vez
- Prefere SQL com logs visuais
- Quer ver todos os passos no SQL Editor

**Destaque:**
```sql
-- Executa em 6 partes:
-- 1. Verificar tabelas
-- 2. Verificar FK atual
-- 3. Corrigir FK
-- 4. Verificar FK nova
-- 5. Testar JOIN
-- 6. Estatísticas
```

---

### 4. RELATORIO-VERIFICACAO-DATABASE.md

**O que é:**
- Relatório completo da auditoria
- Estado atual de todas as tabelas
- SQL de verificação comentado
- Estrutura esperada pós-migração

**Quando usar:**
- Quer documentação completa
- Precisa compartilhar com equipe
- Quer entender o problema em profundidade

**Destaque:**
- 📊 Tabelas detalhadas
- 📋 Checklist de execução completo
- 🎯 Estrutura final esperada

---

### 5. DESCOBERTAS-TECNICAS.md

**O que é:**
- Análise técnica completa
- Hipóteses sobre causa raiz
- Estruturas TypeScript das tabelas
- Referências e recomendações futuras

**Quando usar:**
- Você é desenvolvedor/arquiteto
- Quer entender o "porquê" em profundidade
- Precisa de referência técnica futura

**Destaque:**
```typescript
interface Audit { ... }
interface InstagramProfile { ... }
```
- Hipóteses sobre causa raiz
- Recomendações para CI/CD

---

### 6. verify-database-state.js

**O que é:**
- Script Node.js para verificar estado do banco
- Usa Supabase Client
- Output colorido no terminal
- Gera SQL para executar manualmente

**Quando usar:**
- Quer verificar estado atual localmente
- Prefere terminal a SQL Editor
- Quer output visual com cores

**Como executar:**
```bash
node scripts/verify-database-state.js
```

**Destaque:**
- ✅ Testa relacionamento com dados reais
- 📊 Mostra estrutura de `audits`
- 🎨 Output colorido e visual

---

### 7. check-foreign-keys.js

**O que é:**
- Script Node.js para verificar FKs
- Tentativa de consultar information_schema
- Fallback para SQL manual se RPC não funcionar

**Quando usar:**
- Quer verificar especificamente as FKs
- Complemento do verify-database-state.js

**Limitação:**
- Requer função RPC `exec_sql` no Supabase
- Se não existir, gera SQL para executar manualmente

---

### 8. check-and-migrate-database.js

**O que é:**
- Tentativa de migração automática
- Usa RPC para executar SQL
- NÃO FUNCIONA se `exec_sql` não existir

**Quando usar:**
- Se Supabase tiver função RPC habilitada
- Quer automatizar completamente

**Limitação:**
- Supabase não tem `exec_sql` por padrão
- Criado para completude, mas use SQL Editor

---

## 🎯 RECOMENDAÇÃO FINAL

### Para 90% dos casos:

1. **Leia:** `RESUMO-VERIFICACAO.md`
2. **Execute:** SQL da "Opção 2: Execução Rápida"
3. **Valide:** `node scripts/verify-database-state.js`
4. **Teste:** Reiniciar servidor e testar API

**Tempo total:** 5 minutos

---

### Para casos complexos ou primeira vez:

1. **Leia:** `GUIA-EXECUCAO-MIGRACAO.md`
2. **Execute:** `VERIFICAR-E-CORRIGIR-FK.sql` completo
3. **Valide:** Consultas SQL no final do script
4. **Documente:** Anote resultado em `RELATORIO-VERIFICACAO-DATABASE.md`

**Tempo total:** 15 minutos

---

## 📞 PRECISA DE AJUDA?

### Erro ao executar SQL?

Consulte: `GUIA-EXECUCAO-MIGRACAO.md` → Seção "TROUBLESHOOTING"

### Quer entender o problema?

Leia: `DESCOBERTAS-TECNICAS.md` → Seção "PROBLEMA IDENTIFICADO"

### Script não funciona?

Execute SQL manualmente: `VERIFICAR-E-CORRIGIR-FK.sql`

### Dúvidas técnicas?

Leia: `RELATORIO-VERIFICACAO-DATABASE.md` → Seção "ESTRUTURA FINAL ESPERADA"

---

## 🗂️ LOCALIZAÇÃO DOS ARQUIVOS

```
postexpress2/
├── database/
│   ├── INDEX-MIGRACAO.md ← VOCÊ ESTÁ AQUI
│   ├── RESUMO-VERIFICACAO.md
│   ├── GUIA-EXECUCAO-MIGRACAO.md
│   ├── VERIFICAR-E-CORRIGIR-FK.sql
│   ├── RELATORIO-VERIFICACAO-DATABASE.md
│   ├── DESCOBERTAS-TECNICAS.md
│   ├── migration-create-instagram-profiles.sql
│   └── migration-fix-audits-foreign-key.sql
└── scripts/
    ├── verify-database-state.js
    ├── check-foreign-keys.js
    └── check-and-migrate-database.js
```

---

## ✅ CHECKLIST GERAL

- [x] Verificação de database realizada
- [x] Problema identificado (FK pode estar errada)
- [x] Documentação completa criada
- [x] Scripts de verificação criados
- [x] SQL de correção preparado
- [ ] **Executar migração no Supabase SQL Editor**
- [ ] Validar resultado
- [ ] Reiniciar servidor Next.js
- [ ] Testar API e Dashboard
- [ ] Deletar arquivos temporários (opcional)

---

**Criado por:** Claude Code (Synkra AIOS)
**Data:** 2026-02-24
**Propósito:** Facilitar navegação em documentação de migração
**Versão:** 1.0
