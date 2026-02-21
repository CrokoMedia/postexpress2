# Profile Context Integration

Sistema de contexto personalizado por perfil para enriquecer auditorias e criação de conteúdo.

## 📋 Status da Implementação

### ✅ Fase 1: Schema do Banco (COMPLETO)
- [x] Tabela `profile_context` criada
- [x] Campos estruturados (nicho, objetivos, público-alvo, etc.)
- [x] Suporte a documentos (JSONB)
- [x] Campo `raw_text` para texto extraído
- [x] Soft delete
- [x] Funções e triggers
- [x] View `profiles_with_context`

**Arquivo:** `database/migrations/006_profile_context.sql`

### ✅ Fase 2: API de Contexto e Upload (COMPLETO)
- [x] GET `/api/profiles/[id]/context` - Buscar contexto
- [x] POST `/api/profiles/[id]/context` - Salvar/atualizar contexto
- [x] DELETE `/api/profiles/[id]/context` - Remover contexto
- [x] POST `/api/profiles/[id]/context/upload` - Upload de documentos
- [x] DELETE `/api/profiles/[id]/context/documents/[docId]` - Remover documento
- [x] Extração automática de texto (PDF, DOCX, TXT, MD)
- [x] Upload para Cloudinary
- [x] Validação de tipo e tamanho

**Arquivos:**
- `app/api/profiles/[id]/context/route.ts`
- `app/api/profiles/[id]/context/upload/route.ts`
- `app/api/profiles/[id]/context/documents/[docId]/route.ts`

### ⏳ Fase 3: Modal de Adicionar Contexto (PENDENTE)
- [ ] Componente modal na página do perfil
- [ ] Formulário com campos de contexto
- [ ] Upload de arquivos (drag & drop)
- [ ] Preview de documentos uploaded
- [ ] Validação e feedback visual

### ⏳ Fase 4: Integração com audit-with-squad.js (PENDENTE)
- [ ] Carregar profile_context do Supabase
- [ ] Injetar contexto no prompt do Claude
- [ ] Usar dados estruturados + raw_text
- [ ] Análise personalizada
- [ ] Fallback se não houver contexto

### ⏳ Fase 5: Integração com content-creation-squad (PENDENTE)
- [ ] Carregar profile_context
- [ ] Usar contexto na geração de carrosséis
- [ ] Tom de voz personalizado
- [ ] Conteúdo ultra-personalizado

---

## 🚀 Como Usar

### 1. Rodar a Migration

```bash
# Opção 1: SQL Editor do Supabase (recomendado)
# Cole o conteúdo de database/migrations/006_profile_context.sql

# Opção 2: Script Node.js
node scripts/run-migration-006.js
```

### 2. Testar API

```bash
# Buscar contexto de um perfil
curl http://localhost:3000/api/profiles/{profile_id}/context

# Salvar contexto
curl -X POST http://localhost:3000/api/profiles/{profile_id}/context \
  -H "Content-Type: application/json" \
  -d '{
    "nicho": "IA & Automação para creators",
    "objetivos": "Vender 10 consultorias/mês",
    "publico_alvo": "Creators que querem escalar",
    "produtos_servicos": "Consultoria de IA",
    "tom_voz": "Técnico mas acessível",
    "contexto_adicional": "Foco em automação de criação de conteúdo"
  }'

# Upload de documento
curl -X POST http://localhost:3000/api/profiles/{profile_id}/context/upload \
  -F "file=@briefing-cliente.pdf"

# Deletar documento
curl -X DELETE http://localhost:3000/api/profiles/{profile_id}/context/documents/{doc_id}
```

### 3. Estrutura de Dados

#### Campos do Contexto:
```typescript
{
  nicho: string                // Nicho de atuação
  objetivos: string            // Objetivos de negócio
  publico_alvo: string         // Público-alvo
  produtos_servicos: string    // O que vende
  tom_voz: string              // Tom de voz desejado
  contexto_adicional: string   // Notas extras
  documents: Array             // Documentos uploaded
  raw_text: string             // Texto extraído (para squads)
}
```

#### Documento no JSONB:
```json
{
  "id": "uuid",
  "filename": "briefing.pdf",
  "url": "https://cloudinary.com/...",
  "cloudinary_public_id": "post-express/...",
  "type": "application/pdf",
  "size": 245678,
  "uploaded_at": "2026-02-19T...",
  "extracted_text_length": 5432
}
```

---

## 📊 Como o Contexto Será Usado

### Auditoria (audit-with-squad.js)

```javascript
// Antes (só dados do Instagram)
const prompt = `
Analise este perfil:
${instagramData}
`

// Depois (Instagram + Contexto)
const prompt = `
Analise este perfil do Instagram:
${instagramData}

CONTEXTO DO PERFIL:
Nicho: ${context.nicho}
Público-alvo: ${context.publico_alvo}
Produto/Serviço: ${context.produtos_servicos}
Tom de voz: ${context.tom_voz}
Objetivos: ${context.objetivos}

DOCUMENTOS ADICIONAIS:
${context.raw_text}

Faça uma análise ULTRA-PERSONALIZADA baseada neste contexto.
`
```

### Criação de Conteúdo (content-creation-squad)

```javascript
// Conteúdo genérico → Conteúdo personalizado
const prompt = `
Crie carrosséis para:
Nicho: ${context.nicho}
Público: ${context.publico_alvo}
Tom: ${context.tom_voz}
Produto: ${context.produtos_servicos}

Use referências dos documentos uploaded:
${context.raw_text}

Crie conteúdo EXTREMAMENTE relevante para este perfil específico.
`
```

---

## 🔄 Próximos Passos

1. ✅ Rodar migration 006
2. ⏳ Criar modal na UI do perfil
3. ⏳ Integrar com audit-with-squad.js
4. ⏳ Integrar com content-creation-squad
5. ⏳ Testar fluxo completo

---

**Desenvolvido para Post Express | Fevereiro 2026**
