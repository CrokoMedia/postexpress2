# Como Verificar que o Contexto está sendo Usado

Guia completo para validar que o contexto do perfil está sendo usado pelos agentes de auditoria e criação de conteúdo.

---

## 🎯 4 Formas de Verificar

### 1️⃣ Script de Teste (RECOMENDADO)

**Visualize EXATAMENTE o que será enviado ao Claude antes de rodar a análise:**

```bash
# Obter profile_id do perfil
# (copie da URL no dashboard: /profiles/[ID])

node scripts/test-context-usage.js <username> <profile_id>
```

**Exemplo:**
```bash
node scripts/test-context-usage.js karlapazos.ai 123e4567-e89b-12d3-a456-426614174000
```

**O que você verá:**
- ✅ Se o contexto foi encontrado ou não
- 📋 Todos os campos de contexto preenchidos
- 📄 Lista de documentos anexados
- 📤 Preview do prompt que será enviado ao Claude
- 📊 Estatísticas do contexto (campos, documentos, caracteres)

---

### 2️⃣ Logs Detalhados (Durante Análise)

**Quando rodar uma análise, os logs mostrarão claramente se o contexto está sendo usado:**

```bash
# Análise completa com contexto
node scripts/complete-post-analyzer.js karlapazos.ai --limit=10

# Depois, auditoria (worker busca profile_id automaticamente)
npm run worker:dev
```

**O que procurar nos logs:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 CARREGANDO CONTEXTO DO PERFIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CONTEXTO ENCONTRADO - ANÁLISE SERÁ PERSONALIZADA!

📋 Dados do contexto:
   Nicho: IA & Automação para creators
   Objetivos: Vender 10 consultorias/mês
   Público-alvo: Creators que querem escalar
   Produtos/Serviços: Consultoria de IA
   Tom de voz: Técnico mas acessível
   Documentos anexados: 2
   Texto extraído: 15437 caracteres

🎯 O Claude receberá este contexto no prompt!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Se NÃO tiver contexto, verá:**

```
⚠️  NENHUM CONTEXTO ENCONTRADO
   Análise será GENÉRICA (sem personalização)
   Adicione contexto via dashboard para análise personalizada
```

---

### 3️⃣ Endpoint de Debug (API)

**Veja o prompt completo via API sem executar a análise:**

```bash
# Obter audit_id da auditoria
# (copie da URL: /audits/[ID])

curl http://localhost:3000/api/debug/audit-prompt/[audit_id] | jq
```

**Resposta:**
```json
{
  "audit_id": "...",
  "profile": {
    "id": "...",
    "username": "karlapazos.ai"
  },
  "has_context": true,
  "context_summary": {
    "nicho": "IA & Automação para creators",
    "objetivos": "Vender 10 consultorias/mês",
    "publico_alvo": "Creators que querem escalar",
    "produtos_servicos": "Consultoria de IA",
    "tom_voz": "Técnico mas acessível",
    "documents_count": 2,
    "raw_text_length": 15437
  },
  "prompt_preview": "[PREVIEW DO PROMPT COMPLETO]",
  "warning": null
}
```

**Se `has_context: false`, verá:**
```json
{
  "has_context": false,
  "warning": "Nenhum contexto encontrado - análise será genérica"
}
```

---

### 4️⃣ Indicador Visual (UI)

**No dashboard, verá badges indicando se o contexto foi usado:**

**Badge verde (contexto usado):**
```
✅ Contexto Usado
   5 campos • 2 docs
```

**Badge amarelo (sem contexto):**
```
⚠️ Sem Contexto (Análise Genérica)
```

**Onde aparece:**
- Página de auditoria (`/dashboard/audits/[id]`)
- Página de perfil (`/dashboard/profiles/[id]`)
- Lista de conteúdos gerados

---

## 🧪 Fluxo de Teste Completo

### Teste 1: Adicionar Contexto

1. Acesse um perfil: `/dashboard/profiles/[id]`
2. Clique em "Adicionar Contexto"
3. Preencha os campos:
   - Nicho: "IA & Automação"
   - Objetivos: "Vender consultorias"
   - Público-alvo: "Creators"
   - Produtos/Serviços: "Consultoria de IA"
   - Tom de voz: "Técnico mas acessível"
4. Faça upload de 1-2 PDFs (briefing, ebook, etc.)
5. Salve

### Teste 2: Validar Contexto

```bash
# Copie o profile_id da URL
node scripts/test-context-usage.js <username> <profile_id>
```

**Você DEVE ver:**
- ✅ Contexto encontrado
- ✅ Todos os campos preenchidos
- ✅ Documentos listados
- ✅ Preview do prompt com o contexto

### Teste 3: Rodar Análise

```bash
# 1. Rodar scraping + análise
node scripts/complete-post-analyzer.js <username> --limit=10

# 2. Iniciar worker (se não estiver rodando)
npm run worker:dev

# 3. Criar nova análise via dashboard ou API
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"username":"<username>","post_limit":10}'
```

**Nos logs, procure:**
```
✅ CONTEXTO ENCONTRADO - ANÁLISE SERÁ PERSONALIZADA!
```

### Teste 4: Verificar Resultado

1. Abra a auditoria: `/dashboard/audits/[id]`
2. Verifique o badge: **"✅ Contexto Usado"**
3. Leia as recomendações - devem mencionar:
   - Nicho específico
   - Público-alvo
   - Produtos/serviços
   - Objetivos definidos

**Exemplo de recomendação com contexto:**
> "Como seu nicho é IA & Automação para creators, recomendo criar conteúdo mostrando como automatizar a criação de posts em 30 minutos. Seu público (creators que querem escalar) vai adorar isso."

**vs. sem contexto (genérico):**
> "Recomendo criar mais conteúdo educacional e interagir mais com a audiência."

---

## 🔍 Checklist de Validação

Use este checklist para validar cada perfil:

- [ ] Contexto adicionado via UI
- [ ] Script de teste executado (`test-context-usage.js`)
- [ ] Contexto aparece nos logs (`CONTEXTO ENCONTRADO`)
- [ ] Badge "Contexto Usado" aparece na UI
- [ ] Recomendações mencionam nicho/público/objetivos
- [ ] Documentos uploadados aparecem no contexto
- [ ] Texto extraído dos PDFs > 0 caracteres

---

## 🚨 Troubleshooting

### "Nenhum contexto encontrado"

**Causa:** Contexto não foi salvo ou profile_id incorreto

**Solução:**
1. Verifique se salvou o contexto via UI
2. Confirme o profile_id com: `node scripts/check-database-schema.js`
3. Busque manualmente: `SELECT * FROM profile_context WHERE profile_id = '...'`

### "Análise genérica mesmo com contexto"

**Causa:** profile_id não foi passado para o script

**Solução:**
1. Worker deve buscar profile_id automaticamente
2. Se rodar manualmente: `node scripts/audit-with-squad.js <username> <profile_id>`
3. Verifique logs: deve aparecer "Carregando contexto"

### "Badge não aparece na UI"

**Causa:** Componente não importado

**Solução:**
1. Importe: `import { ContextUsageBadge } from '@/components/molecules/context-usage-badge'`
2. Use: `<ContextUsageBadge profileId={profile.id} showDetails />`

---

## 📊 Métricas de Sucesso

**Contexto BEM configurado:**
- ✅ 5-6 campos preenchidos (de 6 possíveis)
- ✅ 1-3 documentos anexados
- ✅ 1000+ caracteres de texto extraído
- ✅ Badge verde na UI
- ✅ Logs mostram "CONTEXTO ENCONTRADO"
- ✅ Recomendações mencionam dados específicos

**Contexto PARCIAL:**
- ⚠️ 2-4 campos preenchidos
- ⚠️ 0 documentos
- ⚠️ 0 caracteres extraídos
- ⚠️ Análise usa alguns dados mas não todos

**Sem contexto:**
- ❌ 0 campos preenchidos
- ❌ Badge amarelo "Sem Contexto"
- ❌ Logs mostram "NENHUM CONTEXTO"
- ❌ Recomendações genéricas

---

**Desenvolvido para Post Express | Fevereiro 2026**
