# Análise: Mapeamento de Threads de Comentários

**Data:** 2025-02-25
**Task:** #5 - Mapear threads de comentários (parent_comment_id)
**Status:** ✅ ESTRUTURA JÁ IMPLEMENTADA (parcialmente)

---

## 📋 RESUMO EXECUTIVO

A estrutura de threads de comentários **JÁ ESTÁ IMPLEMENTADA** tanto no schema do banco quanto nos dados coletados pelo Apify. Porém, há uma **inconsistência de nomenclatura** que precisa ser resolvida:

- **Schema:** usa `replied_to_comment_id` (linha 263 do schema)
- **Dados Apify:** retorna `replies[]` (array aninhado)

## 🔍 ANÁLISE DO SCHEMA ATUAL

### Tabela `comments` (linhas 250-282)

```sql
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Dados do comentário
  comment_id VARCHAR(50),               -- ID do Instagram
  text TEXT NOT NULL CHECK (length(text) > 0),
  owner_username VARCHAR(100),
  owner_id VARCHAR(50),
  owner_profile_pic_url TEXT,
  owner_is_verified BOOLEAN DEFAULT FALSE,

  -- Threads (respostas) ✅ JÁ EXISTE!
  replied_to_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  reply_level INTEGER DEFAULT 0,        -- 0 = comentário raiz, 1+ = resposta

  -- Métricas
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),

  -- Categorização
  category comment_category_enum DEFAULT 'outros',
  is_relevant BOOLEAN DEFAULT TRUE,
  sentiment_score NUMERIC(3,2),         -- -1.00 a 1.00

  -- Timestamp
  comment_timestamp TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos de threading já existentes:**
- `replied_to_comment_id` → UUID da tabela `comments` (self-reference)
- `reply_level` → profundidade da thread (0 = raiz, 1+ = resposta)

## 📊 ESTRUTURA DE DADOS DO APIFY

### Comentário Raiz (sem respostas)

```json
{
  "id": "18047143682637745",
  "text": "👏👏👏👏",
  "ownerUsername": "drapalomaosteopata",
  "timestamp": "2025-08-19T13:05:21.000Z",
  "repliesCount": 0,
  "replies": [],
  "likesCount": 1
}
```

### Comentário com Respostas (thread)

```json
{
  "id": "18031148639497137",
  "text": "Lembro demais dessa fase do Crossfit...",
  "ownerUsername": "erikaalvino",
  "timestamp": "2025-08-19T12:20:51.000Z",
  "repliesCount": 2,
  "replies": [
    {
      "id": "18350705119094437",
      "text": "@erikaalvino obrigado por sempre apoiar...",
      "ownerUsername": "rodrigogunter_",
      "timestamp": "2025-08-19T12:33:24.000Z",
      "repliesCount": 0,
      "replies": [],
      "likesCount": 1
    }
  ],
  "likesCount": 2
}
```

**Observações importantes:**
1. `replies` é um **array aninhado** (não flat)
2. `repliesCount` indica número de respostas diretas
3. Replies podem ter suas próprias `replies` (threads recursivos)
4. Não há campo `parent_id` explícito — é implícito pela estrutura aninhada

## 🔧 ESTRUTURA ATUAL DO SCRAPER

### Script: `instagram-scraper-with-comments.js`

**Função:** `extractCommentsForPost()` (linhas 87-110)

```javascript
async function extractCommentsForPost(postUrl, limit = 50) {
  try {
    const run = await client.actor('apify/instagram-scraper').call({
      directUrls: [postUrl],
      resultsType: 'comments',
      resultsLimit: limit,
      proxy: { useApifyProxy: true },
    });

    const finishedRun = await client.run(run.id).waitForFinish();

    if (finishedRun.status !== 'SUCCEEDED') {
      console.log(`   ⚠️  Comentários não disponíveis para ${postUrl}`);
      return [];
    }

    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();

    return items; // ✅ RETORNA replies[] aninhadas
  } catch (error) {
    console.log(`   ⚠️  Erro ao extrair comentários: ${error.message}`);
    return [];
  }
}
```

**O scraper JÁ COLETA threads completas!** Porém:
- ❌ Não está fazendo **flatten** da estrutura aninhada
- ❌ Não está populando `replied_to_comment_id`
- ❌ Não está calculando `reply_level`

## 🚨 PROBLEMA IDENTIFICADO

### Inconsistência de Nomenclatura

| Contexto | Campo usado | Tipo |
|----------|------------|------|
| **Schema SQL** | `replied_to_comment_id` | UUID (FK para comments.id) |
| **Dados Apify** | `replies[]` | Array aninhado |
| **Scraper atual** | (nenhum) | Salva estrutura aninhada sem processar |

### Dados sendo salvos atualmente

O arquivo `squad-auditores/data/{username}-posts-with-comments.json` armazena:

```json
{
  "posts": [
    {
      "comments": {
        "raw": [/* comentários com replies[] aninhadas */],
        "categorized": {/* sem threading */}
      }
    }
  ]
}
```

**Problema:** A estrutura aninhada (`replies[]`) não pode ser inserida diretamente no Supabase sem transformação!

## ✅ SOLUÇÃO NECESSÁRIA

### 1. Flatten da estrutura de comentários

Transformar estrutura aninhada em flat list com referências:

```javascript
function flattenComments(comments, parentId = null, level = 0) {
  const flattened = [];

  for (const comment of comments) {
    const { replies, ...commentData } = comment;

    flattened.push({
      ...commentData,
      parent_comment_id: parentId,  // ID do Instagram (não UUID!)
      reply_level: level
    });

    // Processar replies recursivamente
    if (replies && replies.length > 0) {
      flattened.push(
        ...flattenComments(replies, comment.id, level + 1)
      );
    }
  }

  return flattened;
}
```

### 2. Inserção no Supabase com lookup de UUID

Quando inserir no banco:

```javascript
// 1. Inserir comentários raiz primeiro (parent_comment_id = null)
// 2. Inserir replies, fazendo lookup do UUID do parent
// 3. Popular replied_to_comment_id com o UUID do Supabase

const parentUuid = await supabase
  .from('comments')
  .select('id')
  .eq('comment_id', comment.parent_comment_id)  // Instagram ID
  .single();

await supabase.from('comments').insert({
  post_id: postUuid,
  comment_id: comment.id,
  text: comment.text,
  replied_to_comment_id: parentUuid?.id || null,  // UUID do Supabase
  reply_level: comment.reply_level,
  // ... outros campos
});
```

### 3. Modificações necessárias

#### A. `instagram-scraper-with-comments.js`

Adicionar função `flattenComments()` e aplicar antes de salvar:

```javascript
// Linha ~210 (após filterRelevantComments)
const flattenedComments = flattenComments(relevantComments);

postsWithComments.push({
  ...post,
  comments: {
    total: rawComments.length,
    relevant: relevantComments.length,
    raw: rawComments,
    flat: flattenedComments,  // ✅ NOVA estrutura flat
    categorized: categorizedComments,
  },
});
```

#### B. API de inserção de comentários

Criar endpoint `/api/posts/[id]/comments` que:
1. Recebe estrutura flat de comentários
2. Insere comentários raiz primeiro
3. Insere replies fazendo lookup de `replied_to_comment_id`
4. Retorna estatísticas de threads

## 📊 EXEMPLO DE TRANSFORMAÇÃO

### Antes (aninhado - Apify)

```json
[
  {
    "id": "18031148639497137",
    "text": "Comentário raiz",
    "repliesCount": 1,
    "replies": [
      {
        "id": "18350705119094437",
        "text": "Resposta ao comentário",
        "repliesCount": 0,
        "replies": []
      }
    ]
  }
]
```

### Depois (flat - para inserção)

```json
[
  {
    "id": "18031148639497137",
    "text": "Comentário raiz",
    "parent_comment_id": null,
    "reply_level": 0
  },
  {
    "id": "18350705119094437",
    "text": "Resposta ao comentário",
    "parent_comment_id": "18031148639497137",
    "reply_level": 1
  }
]
```

## ✅ TESTES REALIZADOS

### Teste com dados reais: @rodrigogunter_ (10 posts, 186 comentários)

```bash
node scripts/test-flatten-comments.js rodrigogunter_
```

**Resultados:**
- ✅ **Todos os posts validados com sucesso**
- 186 comentários raw → 212 flat (após deduplicação)
- 170 comentários raiz
- 42 replies totais
- Profundidade máxima: 1 nível
- **0 erros de validação** (após implementar deduplicação e filtros)

**Problemas identificados e resolvidos:**
1. ✅ IDs duplicados nos dados do Apify → resolvido com `seenIds` set
2. ✅ Comentários com erro (HTTP 404) → resolvido com `filterInvalidComments()`
3. ✅ Comentários sem ID ou texto → resolvido com validação

### Arquivos criados

1. `/scripts/utils/flatten-comments.js` - Utilitário de flatten
   - `filterInvalidComments()` - Remove erros do Apify
   - `flattenComments()` - Transforma estrutura aninhada em flat
   - `groupByLevel()` - Agrupa por nível de profundidade
   - `getThreadStats()` - Estatísticas de threads
   - `validateFlatComments()` - Validação completa

2. `/scripts/test-flatten-comments.js` - Script de testes
   - Testa flatten com dados reais
   - Valida estrutura gerada
   - Exibe estatísticas detalhadas

## 🎯 PRÓXIMAS AÇÕES

1. ✅ **Schema está OK** — não precisa modificar
2. ✅ **Função flatten criada e testada** — `scripts/utils/flatten-comments.js`
3. ⚠️ **Scraper precisa integrar flatten** — modificar `instagram-scraper-with-comments.js`
4. ⚠️ **API precisa lookup** — resolver `replied_to_comment_id` (Instagram ID → Supabase UUID)
5. ⚠️ **Criar endpoint de inserção** — `/api/posts/[id]/comments` com suporte a threads

## 📝 NOTAS TÉCNICAS

### Profundidade de threads no Instagram

Segundo a estrutura observada:
- Threads podem ter **múltiplos níveis** (recursão)
- Apify retorna **até 50 replies por comentário** (limite do parâmetro `resultsLimit`)
- Comentários raiz + replies contam no total de `resultsLimit`

### Performance considerations

- **Inserção em batch:** Inserir comentários raiz primeiro, depois replies
- **Index necessário:** `comment_id` deve ter índice único (já tem no schema linha 286)
- **Transação:** Usar transaction para inserir post + comentários atomicamente

---

**Conclusão:** A estrutura de threads JÁ ESTÁ PRONTA no schema e nos dados coletados. Só falta **implementar a transformação flatten** no scraper e **resolver o lookup de UUIDs** na API de inserção.
