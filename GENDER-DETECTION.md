# Sistema de Detecção de Gênero

## 📋 Visão Geral

O Croko Labs agora detecta automaticamente o gênero de perfis do Instagram para personalizar a linguagem do conteúdo gerado (ex: "ele" vs "ela", "empreendedor" vs "empreendedora").

## 🎯 Por Que Isso Importa?

Sem detecção de gênero, o sistema gerava conteúdo sempre no masculino ("ele", "empreendedor"), criando uma experiência ruim para perfis femininos, empresas e marcas.

**Transformação:**

- **ANTES:** "Como **ele** conseguiu crescer sua marca..."
- **DEPOIS:** "Como **ela** conseguiu crescer sua marca..." (para perfis femininos)

## 🔧 Como Funciona

### 1. Detecção Automática

Quando um **novo perfil** é criado (via scraping), o sistema:

1. Analisa nome completo, biografia e username
2. Usa Claude API (Haiku 3.5) para detectar gênero
3. Salva resultado com nível de confiança

### 2. Detecção Manual (sob demanda)

Usuário pode clicar em "Detectar Gênero" na página de perfil para forçar detecção.

### 3. Edição Manual

Usuário pode editar manualmente o gênero via modal de edição.

## 📊 Campos no Banco de Dados

**Tabela `profiles`:**

| Campo                 | Tipo      | Valores                                    |
| --------------------- | --------- | ------------------------------------------ |
| `gender`              | `VARCHAR` | `masculino`, `feminino`, `neutro`, `empresa` |
| `gender_auto_detected` | `BOOLEAN` | `true` = auto, `false` = manual            |
| `gender_confidence`   | `NUMERIC` | 0.0 a 1.0 (confiança da detecção)          |

## 🤖 Lógica de Detecção

### Método Principal (Claude API)

Usa Claude 3.5 Haiku com prompt estruturado que analisa:
- Nome brasileiro (ex: "Ana", "João")
- Biografia (palavras-chave: "mãe", "empreendedora", "coach feminina")
- Contexto cultural brasileiro

### Método Fallback (Heurísticas)

Se Claude falhar, usa regras simples:
- Nomes femininos comuns: Ana, Maria, Julia, Beatriz...
- Nomes masculinos comuns: João, Gabriel, Pedro, Lucas...
- Palavras-chave na bio: "empresa", "loja", "marca" → empresa

## 🔗 Integração no Content Squad

### Prompt do Content Squad

O prompt de geração de carrosséis agora inclui:

```
7. **LINGUAGEM DE GÊNERO** - CRÍTICO: Use a linguagem correta baseada no gênero do perfil:
   - **Masculino**: "ele", "empreendedor", "especialista", "influenciador"
   - **Feminino**: "ela", "empreendedora", "especialista", "influenciadora"
   - **Neutro**: use linguagem neutra ("pessoa", "profissional")
   - **Empresa**: use "a empresa", "a marca", linguagem institucional
```

### Dados Enviados

```json
{
  "profile": {
    "username": "exemplo",
    "full_name": "Nome Completo",
    "gender": "feminino"  // ← NOVO campo
  }
}
```

## 🚀 Setup (Migração)

### 1. Rodar Migração SQL

Execute no SQL Editor do Supabase:

```sql
-- database/migrations/002-add-gender-fields.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'neutro', 'empresa')),
ADD COLUMN IF NOT EXISTS gender_auto_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gender_confidence NUMERIC(3,2) CHECK (gender_confidence BETWEEN 0 AND 1);

CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender) WHERE gender IS NOT NULL;
```

### 2. Verificar Variáveis de Ambiente

O sistema usa `ANTHROPIC_API_KEY` (já configurado para Content Squad).

## 🎨 Interface do Usuário

### Badge de Gênero

Na página de perfil, aparece badge ao lado do nome:

- 👨 Masculino (auto) - amarelo se auto-detectado
- 👩 Feminino (auto) - amarelo se auto-detectado
- 🧑 Neutro
- 🏢 Empresa

### Modal de Edição

Botão "Editar Perfil" → Modal com opções:

```
[👨 Masculino]  [👩 Feminino]
[🧑 Neutro]     [🏢 Empresa]
```

## 📡 APIs

### PATCH `/api/profiles/[id]`

Atualizar gênero manualmente:

```bash
curl -X PATCH /api/profiles/123 \
  -H "Content-Type: application/json" \
  -d '{"gender": "feminino"}'
```

### POST `/api/profiles/[id]/detect-gender`

Detectar gênero sob demanda:

```bash
curl -X POST /api/profiles/123/detect-gender
```

**Response:**

```json
{
  "message": "Gender detected successfully",
  "profile": { /* perfil atualizado */ },
  "detection": {
    "gender": "feminino",
    "confidence": 0.92,
    "reasoning": "Nome feminino (Ana) + biografia contém 'empreendedora'"
  }
}
```

## 📈 Custo

**Claude Haiku 3.5:**
- Input: $0.001 / 1M tokens
- Output: $0.005 / 1M tokens
- **Custo por detecção:** ~$0.0001 (centésimo de centavo)

Praticamente gratuito, mesmo com 1000 perfis/mês.

## 🔒 Privacidade

- Nenhuma informação pessoal é enviada além de nome, bio e username
- Dados não são armazenados pela Anthropic (usa API stateless)
- Usuário pode sempre alterar manualmente

## ✅ Checklist de Implementação

- [x] Migração SQL (campos gender)
- [x] Função `detectGender()` (lib/gender-detector.ts)
- [x] API PATCH `/api/profiles/[id]`
- [x] API POST `/api/profiles/[id]/detect-gender`
- [x] Componente `EditProfileModal`
- [x] Integração na página de perfil (badge + botão)
- [x] Detecção automática em `saveProfile()`
- [x] Integração no Content Squad (prompt + dados)

## 🧪 Testes

### Teste 1: Perfil Feminino

```bash
@anagadelha → "feminino" (confiança: 0.95)
```

### Teste 2: Empresa

```bash
@lojaexemplo → "empresa" (confiança: 0.88)
```

### Teste 3: Neutro

```bash
@tech_tips → "neutro" (confiança: 0.40)
```

## 🐛 Troubleshooting

**Problema:** Detecção errada

**Solução:** Usuário pode editar manualmente no modal

---

**Problema:** Claude API timeout

**Solução:** Sistema usa fallback heurístico automaticamente

---

**Problema:** Gênero null em perfis antigos

**Solução:** Executar script de migração:

```bash
node scripts/backfill-gender.js
```

(criar script separado se necessário)

---

*Última atualização: 2026-02-22*
*Versão: 1.0*
