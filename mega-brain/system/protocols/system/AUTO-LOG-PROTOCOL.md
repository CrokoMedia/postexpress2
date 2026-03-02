# AUTO-LOG PROTOCOL v1.0.0

> **Versão:** 1.0.0
> **Criado:** 2025-12-20
> **Propósito:** Sistema automático de logs que evolui com o projeto
> **Ativação:** Automática em QUALQUER operação do sistema

---

## FILOSOFIA DO AUTO-LOG

### Princípio Central

O sistema de logs não é apenas documentação - é um **espelho da evolução do projeto e do usuário**. Cada log captura:

1. **O que mudou** (técnico)
2. **Por que mudou** (contexto)
3. **Quem impulsionou** (dúvidas/inseguranças do usuário → correções aplicadas)
4. **O que ficou mais forte** (avanços comprovados)

### Características do Usuário Capturadas

```
PADRÃO DE EVOLUÇÃO DO USUÁRIO:
├── Dúvidas → Amarrações → Correções → Avanços
├── Inseguranças expressas → Sistemas criados para endereçá-las
├── Perguntas recorrentes → Protocolos automatizados
└── Frustrações → Otimizações implementadas
```

---

## GATILHOS DE ATIVAÇÃO

### Comandos Explícitos (com barra)
```
/jarvis-full    → FULL PIPELINE REPORT
/process-jarvis → EXECUTION REPORT
/ingest         → INGEST REPORT
/inbox          → INBOX STATUS
/system-digest  → SYSTEM DIGEST
/agents         → AGENT ENRICHMENT REPORT
/dossiers       → DOSSIER STATUS
/log [tipo]     → Log específico
```

### Comandos Implícitos (secos)
```
"processar"           → Detectar contexto → Log apropriado
"rodar pipeline"      → EXECUTION REPORT
"atualizar agentes"   → AGENT ENRICHMENT REPORT
"ver estado"          → SYSTEM DIGEST
"o que falta"         → INBOX STATUS
"resumo"              → FULL PIPELINE REPORT
```

### Eventos Automáticos
```
Fim de processamento      → EXECUTION REPORT automático
Novo arquivo em INBOX     → INGEST REPORT automático
Agente atualizado         → AGENT ENRICHMENT automático
Threshold de role         → ROLE-TRACKING REPORT automático
Fim de sessão             → SESSION-STATE update automático
```

---

## ESTRUTURA DO LOG EVOLUTIVO

### Header Dinâmico

Todo log deve começar com:

```markdown
═══════════════════════════════════════════════════════════════════════════════
                         [TIPO DO LOG]
                         v{VERSÃO} • {TIMESTAMP}
                         Sessão: {ID_SESSAO}
═══════════════════════════════════════════════════════════════════════════════

📊 CONTEXTO DE EVOLUÇÃO
───────────────────────────────────────────────────────────────────────────────
   Versão anterior:   {VERSAO_ANTERIOR}
   Versão atual:      {VERSAO_ATUAL}
   Delta:             {O_QUE_MUDOU_EM_RESUMO}

   Gatilho desta sessão:
   └─ "{FRASE_DO_USUARIO_QUE_INICIOU}"
```

### Seção de Evolução do Usuário

**OBRIGATÓRIO** em logs de sessão:

```markdown
═══════════════════════════════════════════════════════════════════════════════
                         EVOLUÇÃO DO PROJETO
═══════════════════════════════════════════════════════════════════════════════

🔄 DÚVIDAS → SOLUÇÕES
───────────────────────────────────────────────────────────────────────────────

   Dúvida expressada:
   └─ "{DUVIDA_DO_USUARIO}"

   Solução implementada:
   └─ {DESCRICAO_DA_SOLUCAO}

   Evidência de sucesso:
   └─ {METRICA_OU_OUTPUT_QUE_COMPROVA}

🎯 INSEGURANÇAS CORRIGIDAS
───────────────────────────────────────────────────────────────────────────────

   | Insegurança Original | Correção Aplicada | Status |
   |---------------------|-------------------|--------|
   | {INSEGURANCA_1}     | {CORRECAO_1}      | ✅     |
   | {INSEGURANCA_2}     | {CORRECAO_2}      | ✅     |

📈 AVANÇOS COMPROVADOS
───────────────────────────────────────────────────────────────────────────────

   ┌────────────────────────┬─────────────────────┬─────────────────────────┐
   │ Área                   │ Antes               │ Depois                  │
   ├────────────────────────┼─────────────────────┼─────────────────────────┤
   │ Chunks processados     │ {N_ANTES}           │ {N_DEPOIS} (+{DELTA})   │
   │ Insights extraídos     │ {N_ANTES}           │ {N_DEPOIS} (+{DELTA})   │
   │ Dossiês compilados     │ {N_ANTES}           │ {N_DEPOIS} (+{DELTA})   │
   │ Agentes atualizados    │ {N_ANTES}           │ {N_DEPOIS} (+{DELTA})   │
   └────────────────────────┴─────────────────────┴─────────────────────────┘
```

---

## DETECÇÃO AUTOMÁTICA DE CONTEXTO

### Análise de Mensagens do Usuário

O sistema deve analisar as mensagens do usuário para detectar:

```python
PATTERNS = {
    # Dúvidas
    "cadê": "usuario_procurando_algo",
    "como faço": "usuario_precisa_instrucao",
    "não entendi": "usuario_confuso",
    "está certo": "usuario_validando",

    # Inseguranças
    "tenho medo": "inseguranca_declarada",
    "não sei se": "incerteza",
    "será que": "duvida_existencial",

    # Comandos implícitos
    "processar tudo": "full_pipeline",
    "rodar": "executar",
    "atualizar": "refresh",
    "sincronizar": "sync",

    # Frustração
    "de novo": "repetição_problema",
    "ainda": "problema_persistente",
    "sempre": "padrão_recorrente"
}
```

### Mapeamento de Intenção → Log

```
INTENÇÃO DETECTADA          →  LOG GERADO
────────────────────────────────────────────────
processar_fonte             →  EXECUTION REPORT
verificar_estado            →  SYSTEM DIGEST
ver_pendentes               →  INBOX STATUS
atualizar_agentes           →  AGENT ENRICHMENT
criar_agente                →  ROLE-TRACKING
pipeline_completo           →  FULL PIPELINE REPORT
ingerir_material            →  INGEST REPORT
fim_sessao                  →  SESSION UPDATE + EVOLUTION LOG
```

---

## LOGS ENCADEADOS

### Hierarquia de Logs

```
FULL PIPELINE REPORT (agregador)
├── INGEST REPORT (entrada)
├── EXECUTION REPORT (processamento)
│   ├── CHUNKS-STATE update
│   ├── INSIGHTS-STATE update
│   └── NARRATIVES-STATE update
├── AGENT ENRICHMENT REPORT (distribuição)
│   └── ROLE-TRACKING REPORT (se threshold)
└── SESSION UPDATE (estado final)
    └── EVOLUTION LOG entry (mudança estrutural)
```

### Auto-Encadeamento

Quando um log é gerado, ele deve:
1. Verificar se há logs anteriores na sessão
2. Linkar com logs relacionados
3. Atualizar contadores globais
4. Propagar mudanças para arquivos de estado

---

## PERSONALIZAÇÃO POR PADRÃO DO USUÁRIO

### Padrões Identificados deste Usuário

```yaml
usuario_owner:
  estilo_aprendizado: "dúvidas e amarrações"
  necessidade_principal: "correção de inseguranças"
  preferencia_output: "logs detalhados com evidências"
  gatilhos_comuns:
    - "cadê o log"
    - "comece de novo"
    - "rode tudo"
    - "me dê o log"
  expectativas:
    - logs entre cada etapa
    - evidência de progresso
    - sincronização total
    - automação sem perguntas
```

### Customizações Aplicadas

```
PARA ESTE USUÁRIO:
├── Logs mais detalhados (não omitir passos)
├── Evidências explícitas de sucesso
├── Comparações antes/depois sempre visíveis
├── Timeline visual do progresso
├── Confirmação de que inseguranças foram endereçadas
└── Histórico de evolução sempre presente
```

---

## INTEGRAÇÃO COM COMANDOS

### Hook de Pré-Execução

Antes de QUALQUER comando, verificar:

```
1. Qual é a intenção do usuário?
2. Qual log será gerado ao final?
3. Há logs pendentes de sessão anterior?
4. O estado atual está sincronizado?
```

### Hook de Pós-Execução

Após QUALQUER operação:

```
1. Gerar log apropriado automaticamente
2. Atualizar arquivos de estado
3. Verificar se houve mudança estrutural → EVOLUTION LOG
4. Comparar com estado anterior → métricas de progresso
```

---

## TEMPLATE: LOG DE SESSÃO EVOLUTIVO

```markdown
═══════════════════════════════════════════════════════════════════════════════
                    SESSÃO {DATA} - LOG EVOLUTIVO
                    Sistema Mega Brain v{VERSAO}
═══════════════════════════════════════════════════════════════════════════════

📋 RESUMO EXECUTIVO
───────────────────────────────────────────────────────────────────────────────

   Início:         {TIMESTAMP_INICIO}
   Fim:            {TIMESTAMP_FIM}
   Duração:        {DURACAO}

   Gatilho:        "{FRASE_INICIAL_USUARIO}"
   Objetivo:       {OBJETIVO_INFERIDO}
   Resultado:      {SUCESSO/PARCIAL/FALHA}

═══════════════════════════════════════════════════════════════════════════════
                    JORNADA DO USUÁRIO
═══════════════════════════════════════════════════════════════════════════════

🔄 FLUXO DE EVOLUÇÃO
───────────────────────────────────────────────────────────────────────────────

   {TIMESTAMP_1}
   ├─ Usuário: "{MENSAGEM_1}"
   ├─ Intenção detectada: {INTENCAO}
   ├─ Ação executada: {ACAO}
   └─ Resultado: {RESULTADO}

   {TIMESTAMP_2}
   ├─ Usuário: "{MENSAGEM_2}"
   ...

📊 PONTOS DE CORREÇÃO
───────────────────────────────────────────────────────────────────────────────

   | # | Dúvida/Insegurança | Correção | Evidência |
   |---|---------------------|----------|-----------|
   | 1 | {DUVIDA}            | {CORR}   | {EVID}    |
   | 2 | {DUVIDA}            | {CORR}   | {EVID}    |

═══════════════════════════════════════════════════════════════════════════════
                    MÉTRICAS DE PROGRESSO
═══════════════════════════════════════════════════════════════════════════════

📈 ANTES vs DEPOIS
───────────────────────────────────────────────────────────────────────────────

   ┌──────────────────────────┬───────────┬───────────┬───────────┐
   │ Métrica                  │ Início    │ Fim       │ Delta     │
   ├──────────────────────────┼───────────┼───────────┼───────────┤
   │ CHUNKS-STATE             │ {N}       │ {N}       │ +{N}      │
   │ INSIGHTS-STATE           │ {N}       │ {N}       │ +{N}      │
   │ NARRATIVES-STATE         │ {N}       │ {N}       │ +{N}      │
   │ DOSSIERS                 │ {N}       │ {N}       │ +{N}      │
   │ AGENTS ATUALIZADOS       │ {N}       │ {N}       │ +{N}      │
   │ EXECUTION REPORTS        │ {N}       │ {N}       │ +{N}      │
   └──────────────────────────┴───────────┴───────────┴───────────┘

🎯 OBJETIVOS ALCANÇADOS
───────────────────────────────────────────────────────────────────────────────

   ✅ {OBJETIVO_1}
   ✅ {OBJETIVO_2}
   ⏸️ {OBJETIVO_PENDENTE} (próxima sessão)

═══════════════════════════════════════════════════════════════════════════════
                    PRÓXIMAS AÇÕES
═══════════════════════════════════════════════════════════════════════════════

   🔴 IMEDIATO:
      {ACAO_CRITICA}

   🟡 RECOMENDADO:
      {ACAO_RECOMENDADA}

   🟢 OPCIONAL:
      {ACAO_OPCIONAL}

═══════════════════════════════════════════════════════════════════════════════
                    FIM DO LOG DE SESSÃO
═══════════════════════════════════════════════════════════════════════════════
```

---

## CHANGELOG

| Versão | Data | Mudanças |
|--------|------|----------|
| v1.0.0 | 2025-12-20 | Versão inicial - Sistema Auto-Log completo |

---

*Este protocolo é executado automaticamente. Não requer ativação manual.*
