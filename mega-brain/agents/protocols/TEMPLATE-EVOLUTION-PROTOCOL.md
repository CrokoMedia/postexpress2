# TEMPLATE-EVOLUTION-PROTOCOL

> **Versao:** 1.1.0
> **Criado:** 2025-12-26
> **Atualizado:** 2025-12-26
> **Proposito:** Governar a evolucao do template AGENT-MD-FLEXIVEL quando novo conteudo exigir mudancas estruturais

---

## OBJETIVO

Definir QUANDO, COMO e QUEM aprova mudancas no template de agentes, garantindo que:
1. Evolucoes sejam consistentes em TODOS os agentes
2. Novas categorias sejam justificadas por conteudo real
3. Versionamento seja rastreavel
4. Propagacao seja sistematica

---

## ESTRUTURA ATUAL DO TEMPLATE

### Template AGENT-MD-FLEXIVEL-V1

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ESTRUTURA FIXA (10 PARTES)                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  HEADER           │ ASCII Art + Metadados + Barra Maturidade                   │
│  DOSSIE EXECUTIVO │ 🛡️🧬🗣️🧠📁📋 (resumo rapido)                               │
│  PARTE 0          │ INDICE com dots visuais                                    │
│  PARTE 1          │ COMPOSICAO ATOMICA (arquitetura, DNA, materiais)           │
│  PARTE 2          │ GRAFICO DE IDENTIDADE (radar, quem sou)                    │
│  PARTE 3          │ MAPA NEURAL (TOP insights destilados)                      │
│  PARTE 4          │ NUCLEO OPERACIONAL (missao, frameworks, triggers)          │
│  PARTE 5          │ SISTEMA DE VOZ (tom, frases, exemplos)                     │
│  PARTE 6          │ MOTOR DE DECISAO (heuristicas, regras, decision tree)      │
│  PARTE 7          │ INTERFACES DE CONEXAO (mapa de agentes)                    │
│  PARTE 8          │ PROTOCOLO DE DEBATE (tensoes internas)                     │
│  PARTE 9          │ MEMORIA EXPERIENCIAL (padroes, calibracao BR, casos)       │
│  PARTE 10         │ EXPANSOES E REFERENCIAS (knowledge base, gaps)             │
│  VALIDACAO        │ Box final com maturidade + proximos passos                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Arquivo de Referencia

**Template canônico:** `/agents/cargo/C-LEVEL/CMO/AGENT.md`

Qualquer mudanca no template DEVE primeiro ser aplicada no CMO e depois propagada.

---

## TRIGGERS DE EVOLUCAO

### Trigger 1: NOVO CONTEUDO NAO CABE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONDICAO                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Novo conteudo processado pelo Pipeline Jarvis que:                            │
│  • NAO se encaixa em nenhuma das 10 partes existentes                          │
│  • E relevante para MULTIPLOS agentes (nao apenas 1)                           │
│  • Tem substancia suficiente (>3 insights ou 1 framework)                      │
│                                                                                 │
│  ACAO                                                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  1. Identificar o GAP no template atual                                        │
│  2. Propor nova PARTE ou SUBSECAO                                              │
│  3. Documentar justificativa com chunk_ids                                     │
│  4. Solicitar aprovacao do usuario                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Trigger 2: PADRAO EMERGENTE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONDICAO                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Durante uso dos agentes, identificar:                                         │
│  • Perguntas recorrentes nao cobertas pelo template                            │
│  • Informacao que usuarios sempre pedem e nao esta visivel                     │
│  • Secoes que sempre ficam vazias (candidatas a remocao)                       │
│                                                                                 │
│  ACAO                                                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  1. Registrar padrao em EVOLUTION-LOG.md                                       │
│  2. Acumular 3+ ocorrencias antes de propor mudanca                            │
│  3. Propor ajuste (adicao, remocao ou reorganizacao)                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Trigger 3: FEEDBACK EXPLICITO

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONDICAO                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Usuario solicita explicitamente:                                              │
│  • "Adicione uma secao para X"                                                 │
│  • "Remova a parte Y, nunca uso"                                               │
│  • "Reorganize Z para ficar mais acessivel"                                    │
│                                                                                 │
│  ACAO                                                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  1. Implementar imediatamente no agente solicitado                             │
│  2. Perguntar: "Propagar para todos os agentes?"                               │
│  3. Se sim, atualizar template canonico + propagar                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Trigger 4: AUTO-VERIFICAÇÃO (A cada leitura)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONDICAO                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  Sistema lê AGENT.md para QUALQUER operação:                                   │
│  • Consulta de agente (/ask)                                                   │
│  • Debate entre agentes (/debate, /council)                                    │
│  • Atualização de agente (Pipeline Jarvis)                                     │
│  • Início de nova sessão                                                       │
│                                                                                 │
│  VERIFICAR AUTOMATICAMENTE                                                      │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  1. AGENT.md está alinhado com INDEX.md atual?                                 │
│     • Todas as 10 PARTEs presentes na ordem correta                            │
│     • Subsecões obrigatórias existem (1.1, 1.2, 2.1, 2.2, 2.3, etc.)          │
│                                                                                 │
│  2. Formato visual está completo?                                              │
│     • Seção 1.1 tem ARQUITETURA com ████ bars                                  │
│     • Seção 1.2 tem 5 CAMADAS DE DNA visual                                    │
│     • Seção 2.1 tem MAPA DE DOMÍNIOS com barras %                              │
│     • Seção 2.2 tem RADAR com ●●●●● dots                                       │
│     • Seção 2.3 tem FONTES DE DNA com boxes elaborados                         │
│                                                                                 │
│  3. Versão do template no AGENT = versão canônica (INDEX.md)?                  │
│                                                                                 │
│  4. Rastreabilidade completa?                                                  │
│     • Toda afirmação tem ^[FONTE:arquivo:linha]                                │
│     • Números são derivados, não inventados                                    │
│                                                                                 │
│  ACAO SE DIVERGENCIA DETECTADA                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  1. Gerar FLAG visual no output:                                               │
│     ⚠️ TEMPLATE DESATUALIZADO: [lista de gaps]                                 │
│                                                                                 │
│  2. Sugerir comando de atualização:                                            │
│     "Executar atualização do template? (s/n)"                                  │
│                                                                                 │
│  3. Se aprovado: Aplicar correções automaticamente                             │
│                                                                                 │
│  4. Registrar em EVOLUTION-LOG.md                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Trigger 5: SINCRONIZAÇÃO COM INDEX

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONDICAO                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  INDEX.md (_TEMPLATES/INDEX.md) é modificado:                                  │
│  • Nova seção adicionada                                                       │
│  • Ordem de seções alterada                                                    │
│  • Novo elemento visual definido                                               │
│  • Especificação de camada alterada                                            │
│                                                                                 │
│  ACAO AUTOMATICA                                                                │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  1. Identificar TODOS os AGENT.md afetados:                                    │
│     • C-LEVEL: CFO, CMO, COO, CRO                                              │
│     • SALES: CLOSER, BDR, SDS, SDR, LNS, SALES-MANAGER, etc.                  │
│                                                                                 │
│  2. Gerar DIFF visual do que precisa mudar em cada agente                      │
│                                                                                 │
│  3. Executar propagação em batch:                                              │
│     a) Atualizar CFO (canônico de referência)                                  │
│     b) Propagar para demais C-LEVEL                                            │
│     c) Propagar para SALES                                                     │
│                                                                                 │
│  4. Registrar em EVOLUTION-LOG.md                                              │
│                                                                                 │
│  IMPORTANTE: Esta sincronização é AUTOMATICA - não requer aprovação            │
│  O INDEX.md é a fonte de verdade para estrutura do template                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## PROCESSO DE EVOLUCAO

### Fase 1: PROPOSTA

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  FORMATO DE PROPOSTA                                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ## PROPOSTA DE EVOLUCAO DO TEMPLATE                                           │
│                                                                                 │
│  **Tipo:** [NOVA_PARTE | NOVA_SUBSECAO | REMOCAO | REORGANIZACAO]              │
│  **Template atual:** AGENT-MD-FLEXIVEL-V{X}                                    │
│  **Template proposto:** AGENT-MD-FLEXIVEL-V{X+1}                               │
│                                                                                 │
│  ### Mudanca Proposta                                                          │
│  [Descricao clara da mudanca]                                                  │
│                                                                                 │
│  ### Justificativa                                                             │
│  - Trigger: [NOVO_CONTEUDO | PADRAO_EMERGENTE | FEEDBACK]                      │
│  - Evidencia: [chunk_ids ou descricao do padrao]                               │
│  - Agentes afetados: [lista]                                                   │
│                                                                                 │
│  ### Impacto                                                                   │
│  - Arquivos a modificar: [quantidade]                                          │
│  - Complexidade: [BAIXA | MEDIA | ALTA]                                        │
│                                                                                 │
│  ### Exemplo Visual                                                            │
│  [Mockup da nova estrutura]                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Fase 2: APROVACAO

| Tipo de Mudanca | Aprovacao Necessaria |
|-----------------|---------------------|
| Nova subsecao dentro de parte existente | Automatica (aplicar e informar) |
| Nova PARTE (11+) | Usuario deve aprovar explicitamente |
| Remocao de PARTE | Usuario deve aprovar explicitamente |
| Reorganizacao major | Usuario deve aprovar explicitamente |

### Fase 3: IMPLEMENTACAO

```
ORDEM DE IMPLEMENTACAO
        │
        ▼
┌─────────────────────┐
│ 1. CMO (canonico)   │ ← Sempre primeiro
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 2. COO              │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 3. CRO              │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 4. CFO              │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 5. SALES (todos)    │ ← CLOSER, SDR, BDR, etc.
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 6. Atualizar docs   │ ← SESSION-STATE, EVOLUTION-LOG
└─────────────────────┘
```

### Fase 4: VALIDACAO

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CHECKLIST DE VALIDACAO POS-EVOLUCAO                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [ ] Template canonico (CMO) atualizado                                        │
│  [ ] Todos os agentes C-LEVEL atualizados                                      │
│  [ ] Todos os agentes SALES atualizados                                        │
│  [ ] INDICE (PARTE 0) reflete nova estrutura em todos                          │
│  [ ] Versao do template incrementada (V1 → V2)                                 │
│  [ ] SESSION-STATE.md atualizado                                               │
│  [ ] EVOLUTION-LOG.md registrado                                               │
│  [ ] CLAUDE.md atualizado (se necessario)                                      │
│                                                                                 │
│  SE qualquer [ ] = NAO → Evolucao NAO esta completa                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## VERSIONAMENTO

### Nomenclatura

```
AGENT-MD-FLEXIVEL-V{MAJOR}.{MINOR}

MAJOR: Mudanca estrutural (nova PARTE, remocao, reorganizacao)
MINOR: Mudanca incremental (nova subsecao, ajuste visual)

Exemplos:
- V1.0 → V1.1: Adicionar subsecao 3.2 em MAPA NEURAL
- V1.1 → V2.0: Adicionar PARTE 11: METRICAS DE PERFORMANCE
- V2.0 → V2.1: Ajustar formato visual do header
```

### Historico

| Versao | Data | Mudanca | Autor |
|--------|------|---------|-------|
| V1.0 | 2025-12-26 | Template inicial (CMO de referencia) | Sistema |
| V1.1 | 2025-12-26 | Adicionado Trigger 4 (AUTO-VERIFICAÇÃO) e Trigger 5 (SYNC INDEX) | Sistema |
| V1.2 | - | *reservado* | - |

---

## REGRAS DE EXPANSAO

### Quando EXPANDIR (criar nova parte/subsecao)

| Criterio | Threshold |
|----------|-----------|
| Insights novos sobre tema inedito | >= 5 insights |
| Framework novo nao categorizado | >= 1 framework estruturado |
| Dominio novo para o agente | Confirmado em DNA-CONFIG |
| Perguntas recorrentes nao cobertas | >= 3 ocorrencias |

### Quando NAO EXPANDIR

| Situacao | Acao Correta |
|----------|--------------|
| Conteudo cabe em parte existente | Adicionar na parte existente |
| Conteudo e especifico de 1 agente | Adicionar apenas naquele agente |
| Conteudo e operacional (nao estrategico) | Adicionar em MEMORY.md, nao AGENT.md |
| Conteudo e temporario/contextual | NAO adicionar ao template |

---

## REGRAS DE CONTRACAO

### Quando REMOVER parte/subsecao

| Criterio | Threshold |
|----------|-----------|
| Parte vazia em >80% dos agentes | Candidata a remocao |
| Nunca consultada em 30+ dias | Candidata a merge com outra |
| Redundante com outra parte | Merge obrigatorio |

### Processo de Remocao

1. Identificar parte candidata
2. Verificar se conteudo pode migrar para outra parte
3. Propor remocao com justificativa
4. Aprovar com usuario
5. Migrar conteudo (se houver)
6. Remover de TODOS os agentes
7. Atualizar versao do template

---

## PROPAGACAO AUTOMATICA

### Quando um agente e atualizado com novo conteudo via Pipeline Jarvis

```
NOVO CONTEUDO PROCESSADO
        │
        ▼
┌─────────────────────┐
│ Cabe no template    │
│ atual?              │
└─────────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
  SIM       NAO
   │         │
   ▼         ▼
ADICIONAR  ┌─────────────────┐
NA PARTE   │ E relevante     │
EXISTENTE  │ para MULTIPLOS  │
           │ agentes?        │
           └─────────────────┘
                  │
             ┌────┴────┐
             ▼         ▼
            SIM       NAO
             │         │
             ▼         ▼
        PROPOR     ADICIONAR
        EVOLUCAO   COMO SUBSECAO
        DO         ESPECIFICA
        TEMPLATE   DESTE AGENTE
```

---

## INTEGRACAO COM OUTROS PROTOCOLOS

| Protocolo | Integracao |
|-----------|------------|
| VISUAL-DIFF-PROTOCOL | Marcar novas partes/subsecoes com 🟩 |
| AGENT-INTEGRITY-PROTOCOL | Toda nova parte deve ter rastreabilidade |
| CORTEX-PROTOCOL | Propagar mudancas de template como mudanca estrutural |
| **PIPELINE-JARVIS** | **⚡ TRIGGER AUTOMATICO na Phase 7.5** |

### ⚡ TRIGGER AUTOMATICO (Pipeline Jarvis Phase 7.5)

```
LOCALIZAÇÃO: /system/protocols/PIPELINE/PIPELINE-JARVIS-v2.1.md
SEÇÃO: Phase 7.5 - Template Evolution Check

QUANDO: Após Agent Enrichment, para cada insight/framework descoberto
CONDIÇÃO: Conteúdo não cabe + Relevante para >1 agente + >3 insights ou 1 framework
AÇÃO: Ativar TEMPLATE-EVOLUTION-PROTOCOL automaticamente

FLUXO:
  Pipeline Jarvis Phase 7.4 (Agent Enrichment)
           │
           ▼
  Phase 7.5 - Template Evolution Check
           │
           ├─ Conteúdo CABE → Continuar para Phase 8
           │
           └─ Conteúdo NÃO CABE
                  │
                  ├─ Relevante para 1 agente → Subsecção específica
                  │
                  └─ Relevante para 2+ agentes
                         │
                         └─ ⚡ TRIGGER ATIVADO
                                │
                                └─ Aplicar este protocolo
```

---

## EXEMPLO: EVOLUCAO HIPOTETICA

### Cenario

Processado novo material de Jeremy Haynes com 8 insights sobre "METRICAS DE RECURRING REVENUE" que nao cabem bem em nenhuma das 10 partes atuais.

### Proposta

```
## PROPOSTA DE EVOLUCAO DO TEMPLATE

**Tipo:** NOVA_SUBSECAO
**Template atual:** AGENT-MD-FLEXIVEL-V1.0
**Template proposto:** AGENT-MD-FLEXIVEL-V1.1

### Mudanca Proposta
Adicionar subsecao "9.4 METRICAS ESPECIFICAS" na PARTE 9 (MEMORIA EXPERIENCIAL)

### Justificativa
- Trigger: NOVO_CONTEUDO
- Evidencia: JH001_045, JH001_046, JH001_047 (churn metrics)
- Agentes afetados: CRO, CFO

### Impacto
- Arquivos a modificar: 2 (CRO, CFO)
- Complexidade: BAIXA

### Exemplo Visual
## 9.4 METRICAS ESPECIFICAS ^[JH001]

| Metrica | Valor | Fonte |
|---------|-------|-------|
| Churn anualizado | 3.4-3.7% | ^[JH001_045] |
| LTV:CAC target | 3:1 | ^[JH001_046] |
```

### Decisao

Como e NOVA_SUBSECAO (nao nova PARTE), aprovacao e automatica. Implementar e informar usuario.

---

## REGISTRO DE EVOLUCOES

Todas as evolucoes devem ser registradas em:

1. **SESSION-STATE.md** - Resumo da mudanca
2. **EVOLUTION-LOG.md** - Detalhes completos
3. **Cada AGENT.md afetado** - Versao do template atualizada

---

## VALIDACAO DO PROTOCOLO

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TEMPLATE-EVOLUTION-PROTOCOL v1.1.0                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [✓] 5 Triggers de evolucao definidos                                          │
│      • Trigger 1: NOVO CONTEÚDO NÃO CABE                                       │
│      • Trigger 2: PADRÃO EMERGENTE                                             │
│      • Trigger 3: FEEDBACK EXPLÍCITO                                           │
│      • Trigger 4: AUTO-VERIFICAÇÃO (a cada leitura)                            │
│      • Trigger 5: SINCRONIZAÇÃO COM INDEX                                      │
│  [✓] 4 Fases do processo (proposta → aprovacao → implementacao → validacao)    │
│  [✓] Versionamento semantico definido                                          │
│  [✓] Regras de expansao com thresholds                                         │
│  [✓] Regras de contracao com thresholds                                        │
│  [✓] Ordem de propagacao definida                                              │
│  [✓] Integracao com outros protocolos                                          │
│  [✓] Exemplo pratico documentado                                               │
│  [✓] Auto-verificação em toda leitura de AGENT.md                              │
│  [✓] Sincronização automática quando INDEX.md muda                             │
│                                                                                 │
│  APLICACAO: Obrigatória antes de qualquer mudanca estrutural no template       │
│  AUTO-CHECK: Executado automaticamente em toda leitura de AGENT.md             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

*TEMPLATE-EVOLUTION-PROTOCOL v1.1.0*
*Criado: 2025-12-26*
*Atualizado: 2025-12-26*
*Integrado com: CORTEX-PROTOCOL, VISUAL-DIFF-PROTOCOL, AGENT-INTEGRITY-PROTOCOL*
