# Story 4.2: Logs e Métricas de Performance

**Epic:** EPIC-001 | **Status:** 📋 To Do | **Priority:** P2 | **Estimate:** 4h
**Sprint:** Sprint 2 - Semana 2

---

## 📋 Descrição

Dashboard de métricas com gráficos de tweets/hora, latência média, uptime e custo mensal estimado.

---

## 🎯 Acceptance Criteria

- [ ] Página `/dashboard/twitter/metrics`
- [ ] Gráfico de tweets capturados/hora (últimas 24h)
- [ ] Latência média de detecção (published → detected)
- [ ] Uptime % do worker (últimos 30 dias)
- [ ] Custo mensal estimado (Twitter API + infra)
- [ ] Export CSV/JSON de métricas

---

## 🔧 Implementação

```typescript
// app/dashboard/twitter/metrics/page.tsx
import { LineChart } from '@/components/charts/LineChart';

export default function MetricsPage() {
  const { data: metrics } = useSWR('/api/twitter/metrics', fetcher);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* KPIs */}
      <Card>
        <h3>Tweets Capturados (24h)</h3>
        <p className="text-3xl">{metrics?.tweets_24h}</p>
      </Card>
      <Card>
        <h3>Latência Média</h3>
        <p className="text-3xl">{metrics?.avg_latency_ms}ms</p>
      </Card>
      <Card>
        <h3>Uptime (30d)</h3>
        <p className="text-3xl">{metrics?.uptime_percentage}%</p>
      </Card>
      <Card>
        <h3>Custo Estimado</h3>
        <p className="text-3xl">${metrics?.estimated_cost}/mês</p>
      </Card>

      {/* Gráfico */}
      <div className="col-span-2">
        <LineChart data={metrics?.hourly_tweets} />
      </div>
    </div>
  );
}

// app/api/twitter/metrics/route.ts
export async function GET() {
  const metrics = {
    tweets_24h: await countTweets24h(),
    avg_latency_ms: await avgLatency(),
    uptime_percentage: await calculateUptime(),
    estimated_cost: 100, // Twitter API + Railway
    hourly_tweets: await getTweetsPerHour()
  };

  return NextResponse.json(metrics);
}
```

---

## 📁 Arquivos

- `app/dashboard/twitter/metrics/page.tsx` - CRIADO
- `app/api/twitter/metrics/route.ts` - CRIADO
- `lib/metrics-calculator.ts` - CRIADO

---

## ✅ DoD

- [ ] Dashboard de métricas funcionando
- [ ] Gráficos renderizando
- [ ] KPIs calculados corretamente
- [ ] Export CSV/JSON
