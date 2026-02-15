# EPIC 002: Pipeline de Dados (Apify → Supabase)

**Status**: ⏳ Pendente
**Prioridade**: 🔴 Crítica
**Duração Estimada**: 1 semana (Semana 2)
**Agente Responsável**: @data-engineer + @analyst (Atlas)

---

## 🎯 OBJETIVO

Implementar pipeline completo de coleta, transformação e carga de dados de redes sociais (Instagram, TikTok, YouTube) via Apify para Supabase.

---

## 📊 CONTEXTO

Este épico estabelece o fluxo de dados que alimentará os Squads Auditores. Sem dados, não há auditoria nem criação de conteúdo.

**Dependências**:
- ✅ EPIC-001 (Fundação & Setup) - Schema Supabase + Apify MCP

**Bloqueia**:
- EPIC-003 (Squad Auditores) - Precisa dos dados para auditar
- EPIC-004 (Squad Criação) - Usa insights da auditoria

---

## 📋 TAREFAS

###

 Task 2.1: Pesquisa de Actors Apify
**Responsável**: @analyst (Atlas)
**Duração**: 4 horas

**Descrição**:
Pesquisar, validar e documentar Actors do Apify para cada plataforma.

**Prompt para @analyst**:
```
Pesquisar e validar Actors do Apify:

Tarefas:
1. Instagram Profile Scraper:
   - Testar com conta real (escolher uma pública)
   - Documentar schema JSON retornado
   - Validar dados: posts, likes, comments, captions, hashtags
   - Rate limits e créditos por scrape

2. TikTok Scraper:
   - Testar com perfil público
   - Documentar schema JSON
   - Validar: vídeos, views, likes, shares, trending status
   - Custos

3. YouTube Scraper:
   - Testar com canal público
   - Validar transcrições automáticas
   - Schema de vídeos + estatísticas
   - Custos

4. Calcular custos por cliente/mês:
   - Scraping semanal (4x/mês) de cada plataforma
   - Estimativa total de créditos Apify
   - Plano Apify recomendado

Gere documento completo com exemplos de JSON real.
```

**Critérios de Aceitação**:
- [ ] 3 Actors testados com sucesso
- [ ] Schema JSON documentado para cada
- [ ] Custos calculados por cliente/mês
- [ ] Rate limits identificados
- [ ] Plano Apify recomendado

**Entregáveis**:
- [ ] `docs/integrations/apify-actors-research.md`
- [ ] `docs/integrations/apify-instagram-schema.json` (exemplo real)
- [ ] `docs/integrations/apify-tiktok-schema.json`
- [ ] `docs/integrations/apify-youtube-schema.json`
- [ ] `docs/integrations/apify-cost-analysis.md`

---

### Task 2.2: Pipeline ETL - Apify Connector
**Responsável**: @data-engineer
**Duração**: 1 dia

**Descrição**:
Wrapper para Apify MCP que abstrai chamadas aos Actors.

**Especificação Técnica**:
```javascript
// src/etl/apify-connector.js

class ApifyConnector {
  async scrapeInstagram(username) {
    // Chama Apify MCP: search-actors → call-actor → get-actor-output
    // Retorna: { posts: [...], profile: {...}, metrics: {...} }
  }

  async scrapeTikTok(username) { /* ... */ }
  async scrapeYouTube(channelId) { /* ... */ }

  async getActorCost(actorId, runId) {
    // Retorna créditos usados
  }
}
```

**Critérios de Aceitação**:
- [ ] 3 métodos implementados (Instagram, TikTok, YouTube)
- [ ] Error handling robusto (timeout, rate limit, actor error)
- [ ] Retry logic com backoff exponencial
- [ ] Logging detalhado
- [ ] Testes unitários (coverage > 80%)

**Entregáveis**:
- [ ] `src/etl/apify-connector.js`
- [ ] `src/etl/apify-connector.test.js`
- [ ] Documentação inline (JSDoc)

---

### Task 2.3: Pipeline ETL - Data Transformer
**Responsável**: @data-engineer
**Duração**: 1 dia

**Descrição**:
Transformar dados brutos dos Actors para schema Supabase.

**Especificação Técnica**:
```javascript
// src/etl/data-transformer.js

class DataTransformer {
  transformInstagramData(apifyOutput, clienteId) {
    // Apify JSON → Schema Supabase
    return {
      auditoria: {
        cliente_id: clienteId,
        dados_brutos: apifyOutput,
        // Extrair métricas agregadas
      },
      scraping_log: {
        plataforma: 'Instagram',
        status: 'success',
        creditos_usados: calculateCredits(apifyOutput)
      }
    };
  }

  transformTikTokData(apifyOutput, clienteId) { /* ... */ }
  transformYouTubeData(apifyOutput, clienteId) { /* ... */ }
}
```

**Critérios de Aceitação**:
- [ ] Transformações para 3 plataformas
- [ ] Validação de dados (schema validation)
- [ ] Normalização de campos (datas, números)
- [ ] Testes com dados reais (do Task 2.1)
- [ ] Coverage > 85%

**Entregáveis**:
- [ ] `src/etl/data-transformer.js`
- [ ] `src/etl/data-transformer.test.js`
- [ ] `src/etl/schemas/validation.js` (JSON Schema validation)

---

### Task 2.4: Pipeline ETL - Supabase Loader
**Responsável**: @data-engineer
**Duração**: 1 dia

**Descrição**:
Carregar dados transformados no Supabase com transações atômicas.

**Especificação Técnica**:
```javascript
// src/etl/supabase-loader.js

class SupabaseLoader {
  async loadAuditData(transformedData) {
    // Transaction: insert em auditorias + scraping_logs
    // Rollback se qualquer insert falhar
  }

  async loadClienteData(clienteData) { /* ... */ }

  async getLastScrapeDate(clienteId, plataforma) {
    // Para scraping incremental
  }
}
```

**Critérios de Aceitação**:
- [ ] Inserts atômicos (transações)
- [ ] Rollback em caso de erro
- [ ] Idempotência (não duplicar dados)
- [ ] Batch inserts para performance
- [ ] Testes de integração com Supabase real

**Entregáveis**:
- [ ] `src/etl/supabase-loader.js`
- [ ] `src/etl/supabase-loader.test.js`
- [ ] Testes de integração

---

### Task 2.5: Pipeline Completo End-to-End
**Responsável**: @data-engineer
**Duração**: 1 dia

**Descrição**:
Orquestrar os 3 componentes (Connector → Transformer → Loader) em pipeline completo.

**Especificação Técnica**:
```javascript
// src/etl/pipeline.js

async function runScraping(clienteId, plataformas = ['instagram', 'tiktok', 'youtube']) {
  const connector = new ApifyConnector();
  const transformer = new DataTransformer();
  const loader = new SupabaseLoader();

  for (const plataforma of plataformas) {
    try {
      // 1. Scrape
      const rawData = await connector.scrape(plataforma, clienteUsername);

      // 2. Transform
      const transformed = transformer.transform(plataforma, rawData, clienteId);

      // 3. Load
      await loader.load(transformed);

      // 4. Log success
      console.log(`✅ ${plataforma} scraping complete`);
    } catch (error) {
      // Log error mas continua outras plataformas
      console.error(`❌ ${plataforma} failed:`, error);
    }
  }
}
```

**Critérios de Aceitação**:
- [ ] Pipeline completo funciona para 3 plataformas
- [ ] Error handling não quebra todo o pipeline
- [ ] Logs estruturados
- [ ] CLI para rodar manualmente: `npm run scrape -- --cliente=123`
- [ ] Scheduler básico (cron) para scraping semanal

**Entregáveis**:
- [ ] `src/etl/pipeline.js`
- [ ] `scripts/run-scraping.js` (CLI)
- [ ] `scripts/schedule-scraping.js` (cron setup)
- [ ] Teste end-to-end com 1 cliente real

---

## 🚦 GATE DE QUALIDADE

**Critérios para considerar EPIC-002 completo**:

### Técnicos:
- [ ] Pipeline completo funciona (Apify → Supabase)
- [ ] 3 plataformas testadas com dados reais
- [ ] Error handling robusto (nenhum crash)
- [ ] Performance aceitável (< 2 min por plataforma)
- [ ] Tests coverage > 80%

### Code Review (@architect):
- [ ] Arquitetura aprovada
- [ ] Separação de responsabilidades (SRP)
- [ ] Error handling em todas as camadas
- [ ] Código documentado

### QA (@qa):
- [ ] Testes passando (unit + integration)
- [ ] Edge cases cobertos (rate limit, timeout, dados inválidos)
- [ ] Scraping testado com 3 contas reais
- [ ] Dados no Supabase validados (schema correto, sem duplicatas)

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Tempo de scraping | < 2 min/plataforma | Logs do pipeline |
| Taxa de sucesso | > 95% | scraping_logs.status |
| Créditos Apify | < $3.50/cliente/mês | Estimativa validada |
| Coverage de testes | > 80% | Jest coverage report |

---

## 🔗 DEPENDÊNCIAS EXTERNAS

### APIs:
- Apify MCP (via Docker)
- Supabase (dev environment)

### Dados de Teste:
- 3 contas públicas (Instagram, TikTok, YouTube)
- Exemplos de JSON real dos Actors

---

## 📝 NOTAS

- **Prioridade em robustez**: Pipeline deve lidar com falhas sem quebrar
- **Custo**: Monitorar créditos Apify durante testes
- **Rate Limits**: Implementar retry com backoff exponencial
- **Dados sensíveis**: Nunca commitar usernames reais ou chaves API

---

## 🎯 PRÓXIMO PASSO

Após completar EPIC-002:
→ **EPIC-003: Squad Auditores**
(Agora com dados reais para auditar!)

---

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
**Versão**: 1.0
