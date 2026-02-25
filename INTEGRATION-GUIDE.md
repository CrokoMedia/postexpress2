# Guia de Integração: Threads de Comentários

**Objetivo:** Integrar a função `flattenComments()` no scraper e na API de inserção.

---

## 1. MODIFICAR SCRAPER

### Arquivo: `scripts/instagram-scraper-with-comments.js`

#### Passo 1: Importar utilitário

```javascript
// No topo do arquivo (linha ~18)
import { ApifyClient } from 'apify-client';
import fs from 'fs';
import 'dotenv/config';
import { flattenComments } from './utils/flatten-comments.js'; // ✅ ADICIONAR
```

#### Passo 2: Aplicar flatten antes de salvar

```javascript
// Linha ~210 (dentro do loop de posts)
for (let i = 0; i < posts.length; i++) {
  const post = posts[i];

  console.log(`   [${i + 1}/${posts.length}] ${post.url}`);

  // Extrair comentários
  const rawComments = await extractCommentsForPost(post.url, commentsPerPost);

  // Filtrar comentários relevantes
  const relevantComments = filterRelevantComments(rawComments);

  // ✅ ADICIONAR: Flatten para estrutura com parent_comment_id
  const flatComments = flattenComments(relevantComments);

  // Categorizar comentários
  const categorizedComments = categorizeComments(relevantComments);

  postsWithComments.push({
    ...post,
    isPinned: post.isPinned || false,
    comments: {
      total: rawComments.length,
      relevant: relevantComments.length,
      raw: rawComments,
      flat: flatComments,  // ✅ NOVA propriedade
      categorized: categorizedComments,
    },
  });

  console.log(`   ✅ ${rawComments.length} comentários (${relevantComments.length} relevantes, ${flatComments.length} flat)\n`);
}
```

---

## 2. CRIAR API DE INSERÇÃO DE COMENTÁRIOS

### Arquivo: `app/api/posts/[id]/comments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

interface FlatComment {
  id: string;                    // Instagram comment ID
  text: string;
  ownerUsername: string;
  ownerProfilePicUrl?: string;
  timestamp?: string;
  likesCount?: number;
  parent_comment_id?: string | null;  // Instagram ID do pai (não UUID!)
  reply_level: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;  // UUID do Supabase
    const { comments } = await request.json() as { comments: FlatComment[] };

    const supabase = getServerSupabase();

    // 1. Verificar se post existe
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // 2. Inserir comentários em ordem (raiz primeiro, depois replies)
    const sortedComments = comments.sort((a, b) => a.reply_level - b.reply_level);

    // Map: Instagram comment ID → Supabase UUID
    const commentIdMap = new Map<string, string>();

    for (const comment of sortedComments) {
      // Resolver UUID do parent (se for reply)
      let repliedToUuid: string | null = null;
      if (comment.parent_comment_id) {
        repliedToUuid = commentIdMap.get(comment.parent_comment_id) || null;
      }

      // Inserir comentário
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          comment_id: comment.id,
          text: comment.text,
          owner_username: comment.ownerUsername,
          owner_profile_pic_url: comment.ownerProfilePicUrl,
          comment_timestamp: comment.timestamp,
          likes_count: comment.likesCount || 0,
          replied_to_comment_id: repliedToUuid,
          reply_level: comment.reply_level,
        })
        .select('id, comment_id')
        .single();

      if (error) {
        console.error(`Erro ao inserir comentário ${comment.id}:`, error);
        continue;
      }

      // Armazenar mapeamento Instagram ID → Supabase UUID
      if (data) {
        commentIdMap.set(comment.id, data.id);
      }
    }

    return NextResponse.json({
      success: true,
      inserted: commentIdMap.size,
      total: comments.length,
    });

  } catch (error) {
    console.error('Erro ao inserir comentários:', error);
    return NextResponse.json(
      { error: 'Erro ao inserir comentários' },
      { status: 500 }
    );
  }
}
```

---

## 3. USAR A API NO FRONTEND

### Exemplo: Inserir comentários após scraping

```typescript
// components/InsertCommentsButton.tsx
import { useState } from 'react';

export function InsertCommentsButton({ postId, flatComments }: {
  postId: string;
  flatComments: FlatComment[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleInsert() {
    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: flatComments }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${data.inserted} comentários inseridos com sucesso!`);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao inserir comentários');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleInsert}
      disabled={loading}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg"
    >
      {loading ? 'Inserindo...' : `Inserir ${flatComments.length} comentários`}
    </button>
  );
}
```

---

## 4. QUERY DE THREADS (FRONTEND)

### Buscar comentários com threads

```typescript
// lib/queries/comments.ts
import { supabase } from '@/lib/supabase';

export async function getCommentsWithThreads(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('reply_level', { ascending: true })
    .order('comment_timestamp', { ascending: true });

  if (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }

  // Reconstruir estrutura de threads
  const commentsById = new Map();
  const rootComments = [];

  // Primeiro pass: criar map de todos os comentários
  data.forEach(comment => {
    commentsById.set(comment.id, { ...comment, replies: [] });
  });

  // Segundo pass: montar hierarquia
  data.forEach(comment => {
    const commentWithReplies = commentsById.get(comment.id);

    if (comment.replied_to_comment_id) {
      // É uma reply - adicionar ao parent
      const parent = commentsById.get(comment.replied_to_comment_id);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      // É comentário raiz
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}
```

### Renderizar threads recursivamente

```tsx
// components/CommentThread.tsx
interface Comment {
  id: string;
  text: string;
  owner_username: string;
  reply_level: number;
  replies: Comment[];
}

export function CommentThread({ comment }: { comment: Comment }) {
  return (
    <div className="ml-0">
      {/* Comentário atual */}
      <div className="p-4 bg-white border rounded-lg">
        <div className="font-semibold">@{comment.owner_username}</div>
        <div className="text-gray-700">{comment.text}</div>
      </div>

      {/* Replies recursivas */}
      {comment.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
          {comment.replies.map(reply => (
            <CommentThread key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentThread key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
```

---

## 5. TESTES

### Teste de inserção completa

```bash
# 1. Rodar scraper com flatten ativado
node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=5

# 2. Verificar estrutura flat no JSON
jq '.posts[0].comments.flat[0:3]' squad-auditores/data/rodrigogunter_-posts-with-comments.json

# 3. Inserir comentários via API (em desenvolvimento)
# POST /api/posts/{post_uuid}/comments
# Body: { "comments": [...flat_comments] }

# 4. Verificar no Supabase
# SELECT * FROM comments WHERE post_id = 'xxx' ORDER BY reply_level, comment_timestamp;
```

---

## 6. TROUBLESHOOTING

### Problema: IDs duplicados

**Causa:** Apify retorna mesmo comentário como raiz e como reply

**Solução:** ✅ Já resolvido com `seenIds` set em `flattenComments()`

### Problema: Referências órfãs (parent não existe)

**Causa:** Parent comment não foi coletado pelo Apify (limite de `resultsLimit`)

**Solução:** Validar com `validateFlatComments()` e tratar como comentário raiz:

```javascript
const validation = validateFlatComments(flatComments);
if (!validation.valid) {
  // Converter órfãos em comentários raiz
  flatComments = flatComments.map(c => {
    if (validation.errors.some(e => e.includes(c.id) && e.includes('parent inexistente'))) {
      return { ...c, parent_comment_id: null, reply_level: 0 };
    }
    return c;
  });
}
```

### Problema: Profundidade máxima de threads

**Observação:** Nos testes com dados reais, profundidade máxima = 1 nível

**Comportamento do Instagram:**
- Comentários raiz (level 0)
- Replies diretas (level 1)
- Instagram não permite replies de replies (no carrossel)

**Schema suporta N níveis:** O campo `reply_level` aceita qualquer valor ≥ 0

---

## 7. MÉTRICAS DE SUCESSO

Após implementação completa:

✅ **Schema:** `replied_to_comment_id` e `reply_level` populados corretamente

✅ **Scraper:** `comments.flat` presente no JSON de saída

✅ **API:** Inserção com lookup de UUID funcionando

✅ **Frontend:** Threads renderizadas corretamente

✅ **Performance:** Inserção de 200+ comentários em < 5 segundos

---

**Próximo passo:** Integrar flatten no scraper e criar endpoint de API.
