# Story 4.1: Health Check & Auto-Recovery Dashboard

**Epic:** EPIC-001 | **Status:** 📋 To Do | **Priority:** P2 | **Estimate:** 3h
**Sprint:** Sprint 2 - Semana 2 | **Depends On:** Story 2.1

---

## 📋 Descrição

Dashboard de status do worker com indicador de conexão, logs de reconnects, botão manual de restart e alertas automáticos.

---

## 🎯 Acceptance Criteria

- [ ] Página `/dashboard/twitter/status`
- [ ] Indicador visual de status (🟢 Conectado / 🔴 Desconectado)
- [ ] Uptime atual e histórico 24h
- [ ] Logs de reconnects com timestamps
- [ ] Botão "Force Restart" (admin)
- [ ] Alertas Slack quando desconecta > 5 min

---

## 🔧 Implementação

```typescript
// app/dashboard/twitter/status/page.tsx
export default function StatusPage() {
  const [status, setStatus] = useState(null);

  // Poll health check a cada 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(process.env.WORKER_HEALTH_URL + '/health');
      const data = await res.json();
      setStatus(data);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <StatusIndicator status={status?.status} />
      <UptimeChart uptime={status?.uptime} />
      <ReconnectLogs />
      <Button onClick={forceRestart}>🔄 Force Restart</Button>
    </div>
  );
}
```

---

## 📁 Arquivos

- `app/dashboard/twitter/status/page.tsx` - CRIADO
- `components/twitter/StatusIndicator.tsx` - CRIADO
- `lib/worker-control.ts` - CRIADO (force restart API)

---

## ✅ DoD

- [ ] Dashboard mostrando status em tempo real
- [ ] Uptime tracking
- [ ] Force restart funcionando
- [ ] Alertas Slack configurados
