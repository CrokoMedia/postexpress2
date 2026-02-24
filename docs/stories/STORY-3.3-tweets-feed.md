# Story 3.3: Visualização de Tweets Capturados

**Epic:** EPIC-001 | **Status:** 📋 To Do | **Priority:** P1 | **Estimate:** 5h
**Sprint:** Sprint 2 - Semana 1 | **Depends On:** Story 2.2

---

## 📋 Descrição

Feed em tempo real de tweets capturados com filtros (expert, tema, data), cards visuais e link para tweet original.

---

## 🎯 Acceptance Criteria

- [ ] Página `/dashboard/twitter/feed`
- [ ] Lista de tweets em cards visuais
- [ ] Filtros: expert dropdown, tema tags, date range
- [ ] Infinite scroll ou paginação
- [ ] Link para tweet original (abre em nova aba)
- [ ] Real-time updates (Supabase Realtime)
- [ ] Indicador de tweets novos

---

## 🔧 Implementação (Concisa)

```typescript
// app/dashboard/twitter/feed/page.tsx
export default function TwitterFeedPage() {
  const [tweets, setTweets] = useState([]);
  const [filters, setFilters] = useState({ expert: null, theme: null });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('twitter-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'twitter_content_updates'
      }, (payload) => {
        setTweets(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
      <Filters onChange={setFilters} />
      <div className="space-y-4">
        {tweets.map(tweet => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </div>
  );
}

// components/twitter/TweetCard.tsx
function TweetCard({ tweet }) {
  return (
    <Card>
      <div className="flex gap-3">
        <div className="flex-1">
          <h4>@{tweet.author_username}</h4>
          <p>{tweet.tweet_text}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>❤️ {tweet.likes_count}</span>
            <span>🔁 {tweet.retweets_count}</span>
            <a href={tweet.tweet_url} target="_blank">Ver no Twitter →</a>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

## 📁 Arquivos

- `app/dashboard/twitter/feed/page.tsx` - CRIADO
- `components/twitter/TweetCard.tsx` - CRIADO
- `components/twitter/TweetFilters.tsx` - CRIADO

---

## ✅ DoD

- [ ] Feed funcionando com Realtime
- [ ] Filtros aplicados
- [ ] Cards visuais completos
- [ ] Infinite scroll
- [ ] Link para Twitter
