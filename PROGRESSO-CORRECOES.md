# 📊 Progresso das Correções - Sistema Croko Lab

**Data:** 2026-02-24
**Modo:** YOLO (correções em paralelo)
**Status:** EM ANDAMENTO

---

## ✅ FASE 1: APIs CRÍTICAS (CONCLUÍDA)

### Sistema de Auditoria (3 arquivos)

| Arquivo | Linhas Corrigidas | Status | Impacto |
|---------|------------------|--------|---------|
| `app/api/profiles/[id]/route.ts` | 133, 147 | ✅ CORRIGIDO | DELETE de perfis auditados |
| `app/api/profiles/[id]/fresh-audit/route.ts` | 53, 89 | ✅ CORRIGIDO | Nova auditoria com scraping |
| `worker/analysis-worker.ts` | 173 | ✅ CORRIGIDO | Worker de processamento |

**Mudanças:**
- `.from('profiles')` → `.from('instagram_profiles')`
- Sistema de auditoria agora aponta para tabela correta

**Resultado:** Sistema de auditoria funcional ✅

---

## ✅ FASE 2: APIs DE CONTEÚDO (CONCLUÍDA)

### Sistema de Conteúdo (4 arquivos)

| Arquivo | Linhas Corrigidas | Status | Impacto |
|---------|------------------|--------|---------|
| `app/api/content/[id]/export-drive/route.ts` | 67 | ✅ CORRIGIDO | Export Google Drive |
| `app/api/content/[id]/link/route.ts` | 47 | ✅ CORRIGIDO | Vincular conteúdo a perfil |
| `app/api/content/[id]/preview-carousel/route.ts` | 92 | ✅ CORRIGIDO | Preview de carrossel |
| `app/api/content/distill-youtube/route.ts` | 73 | ✅ CORRIGIDO | Destilação YouTube |

**Mudanças:**
- `.from('profiles')` → `.from('instagram_profiles')`
- Busca de username para Google Drive corrigida
- Preview de carrosséis funcional
- Destilação YouTube com perfil correto

**Resultado:** Sistema de conteúdo funcional ✅

---

## 🔄 FASE 3: FEATURES ADICIONAIS (EM ANDAMENTO)

### APIs de Features (9 arquivos pendentes)

| Arquivo | Linhas | Status | Prioridade |
|---------|--------|--------|------------|
| `app/api/profiles/[id]/upload/route.ts` | 18 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/profiles/[id]/detect-gender/route.ts` | 19, 40 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/profiles/[id]/chat/route.ts` | 102 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/profiles/[id]/voice-clone/route.ts` | 58, 191, 246, 286 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/profiles/[id]/context/upload/route.ts` | 54 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/profiles/[id]/context/route.ts` | 53 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/documents/route.ts` | 103 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/brand-kits/route.ts` | 219 | ⏳ PENDENTE | 🟡 MÉDIO |
| `app/api/whatsapp/webhook/route.ts` | 125 | ⏳ PENDENTE | 🟡 MÉDIO |

---

## ⚠️ FASE 4: OAuth/Admin (REVISAR)

### OAuth/Instagram (2 arquivos)

| Arquivo | Linhas | Status | Decisão Necessária |
|---------|--------|--------|--------------------|
| `app/api/auth/instagram/callback/route.ts` | 60 | ⚠️ REVISAR | OAuth: `profiles` ou `instagram_profiles`? |
| `app/api/content/[id]/publish-instagram/route.ts` | 81 | ⚠️ REVISAR | OAuth: `profiles` ou `instagram_profiles`? |

**Questão arquitetural:**
- OAuth tokens (`instagram_access_token`, `facebook_page_id`) devem ficar em qual tabela?
- Opção A: `profiles` (creators que fazem login OAuth)
- Opção B: `instagram_profiles` (perfis auditados que também têm OAuth)
- Opção C: Nova tabela `instagram_oauth_tokens`

---

### Admin (1 arquivo)

| Arquivo | Linhas | Status | Decisão Necessária |
|---------|--------|--------|--------------------|
| `app/api/admin/users/route.ts` | 31, 109, 163 | ⚠️ REVISAR | Gerencia creators ou perfis auditados? |

---

## 🟢 FASE 5: Scripts (14 arquivos)

### Scripts de Manutenção

| Script | Status | Prioridade |
|--------|--------|------------|
| `scripts/check-onepercent-profile.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/upload-profile-pics-to-cloudinary.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/list-profiles-for-test.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/test-content-linking.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/fix-missing-profile-pics.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/test-supabase-connection.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/add-whatsapp-user.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/test-context-usage.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/process-oauth-code.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/check-karla-reaudit.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/check-felipe-reaudit.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/list-whatsapp-users.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/test-profile-pic.js` | ⏳ PENDENTE | 🟢 BAIXO |
| `scripts/vincular-whatsapp.js` | ⏳ PENDENTE | 🟢 BAIXO |

---

## 📊 ESTATÍSTICAS GERAIS

| Categoria | Total | Corrigido | Pendente | Revisar |
|-----------|-------|-----------|----------|---------|
| APIs Críticas | 3 | ✅ 3 | 0 | 0 |
| APIs Conteúdo | 4 | ✅ 4 | 0 | 0 |
| APIs Features | 9 | 0 | ⏳ 9 | 0 |
| OAuth/Admin | 3 | 0 | 0 | ⚠️ 3 |
| Scripts | 14 | 0 | ⏳ 14 | 0 |
| **TOTAL** | **33** | **✅ 7** | **⏳ 23** | **⚠️ 3** |

**Progresso:** 21.2% (7/33 arquivos)

---

## 🎯 PRÓXIMOS PASSOS

### Agora (20 min):
1. ✅ Corrigir 9 APIs de features adicionais
2. ⏳ Testar sistema de auditoria
3. ⏳ Testar sistema de conteúdo

### Depois (30 min):
4. ⚠️ Decidir arquitetura OAuth (consultar usuário?)
5. ⚠️ Corrigir ou manter OAuth/Admin files
6. ✅ Corrigir 14 scripts de manutenção

### Finalmente (10 min):
7. ✅ Executar migração SQL no Supabase (foreign key)
8. ✅ Testar sistema completo
9. ✅ Commit das mudanças

---

## 🔥 MUDANÇAS REALIZADAS

### Padrão de correção:
```typescript
// ANTES (errado)
.from('profiles')

// DEPOIS (correto)
.from('instagram_profiles')
```

### Contexto:
- `profiles` → tabela antiga/inexistente para creators
- `instagram_profiles` → tabela correta para perfis auditados do Instagram
- `audits.profile_id` → aponta para `instagram_profiles.id`

---

## ⚠️ IMPORTANTE

**Banco de dados:**
- A migração SQL ainda NÃO foi executada no Supabase
- Foreign key de `audits.profile_id` pode ainda apontar para `profiles` (tabela inexistente)
- Após corrigir código, executar: `database/VERIFICAR-E-CORRIGIR-FK.sql`

**Testes necessários:**
- [ ] Criar nova auditoria
- [ ] Deletar perfil auditado
- [ ] Export Google Drive
- [ ] Preview carrossel
- [ ] Destilação YouTube

---

*Atualizado em: 2026-02-24 (Fase 2 concluída)*
