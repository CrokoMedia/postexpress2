# 🔍 PROTOCOLO DE DETECÇÃO DE SKILLS

> Este arquivo define as regras internas para o sistema de auto-detecção.
> **Versão:** 1.0.0
> **Tipo:** Protocolo interno

---

## CHECKLIST DE OBSERVAÇÃO

Durante cada tarefa, verificar mentalmente:

### Padrões de Estrutura
- [ ] Estou usando um formato específico?
- [ ] Este formato foi usado antes?
- [ ] O formato tem regras implícitas?

### Padrões de Processo
- [ ] Estou seguindo passos específicos?
- [ ] Estes passos se repetem em outras tarefas?
- [ ] Os passos poderiam ser documentados?

### Padrões de Decisão
- [ ] Tomei decisões de formatação?
- [ ] Estas decisões são consistentes?
- [ ] Outro agente tomaria as mesmas decisões?

### Padrões de Output
- [ ] O output segue estrutura específica?
- [ ] A estrutura é replicável?
- [ ] Há elementos obrigatórios implícitos?

---

## THRESHOLD DE SUGESTÃO

| Evidência | Pontos | Descrição |
|-----------|--------|-----------|
| Estrutura repetida | +2 | Mesma estrutura usada 2+ vezes |
| Regras implícitas | +2 | Regras aplicadas sem documentação |
| Formato específico | +1 | Formato não-padrão consistente |
| Processo multi-step | +1 | Sequência de passos definida |
| Domínio sem skill | +1 | Área não coberta por skill existente |

### Ações por Pontuação

| Pontuação | Ação |
|-----------|------|
| **Total ≥ 3** | **SUGERIR** skill ao usuário |
| **Total ≥ 5** | **SUGERIR COM PRIORIDADE ALTA** |
| **Total < 3** | Apenas observar, não sugerir |

---

## ANTI-PATTERNS DE DETECÇÃO

Evitar falsos positivos:

| Situação | Por que NÃO sugerir |
|----------|---------------------|
| Código boilerplate genérico | Já coberto por skill de linguagem |
| Formatação markdown básica | Já coberto por skill de docs |
| Estrutura JSON padrão | Muito genérico |
| Resposta conversacional | Não é padronizável |
| Tarefa one-off única | Não há repetição |
| Padrão já documentado | Skill ou protocolo existe |

---

## EXEMPLOS DE DETECÇÃO CORRETA

### Exemplo 1: Relatório de Métricas
```
Tarefa: "Formata relatório de métricas de vendas"

Observado:
- Estrutura: Header → Métricas → Análise → Ações
- Formato: Tabela de KPIs, bullets de insights
- Repetição: 2ª vez fazendo similar

Pontuação:
- Estrutura repetida: +2
- Formato específico: +1
- Processo multi-step: +1
- Domínio sem skill: +1

TOTAL: 5 → SUGERIR PRIORIDADE ALTA

Sugestão: skill-relatorio-metricas
```

### Exemplo 2: Script de Automação
```
Tarefa: "Cria script para processar CSVs"

Observado:
- Estrutura: Imports → Config → Funcs → Main
- Já existe: skill-python-megabrain

Pontuação:
- Estrutura coberta por skill: 0
- Formato coberto: 0

TOTAL: 0 → NÃO SUGERIR (coberto)
```

### Exemplo 3: Documentação de API
```
Tarefa: "Documenta endpoints da API"

Observado:
- Formato: Endpoint → Método → Params → Response → Errors
- Primeira vez fazendo
- Domínio específico (APIs)

Pontuação:
- Formato específico: +1
- Processo multi-step: +1
- Domínio sem skill: +1

TOTAL: 3 → SUGERIR (threshold mínimo)

Sugestão: skill-api-docs
```

---

## FLUXO COMPLETO DE DETECÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│  DURANTE A EXECUÇÃO                                             │
│                                                                 │
│  1. Observar padrões (checklist mental)                         │
│  2. Calcular pontuação de evidência                             │
│  3. Verificar anti-patterns                                     │
│  4. Verificar se skill similar existe                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  APÓS ENTREGAR TAREFA (se pontuação ≥ 3)                        │
│                                                                 │
│  1. Formatar sugestão visual                                    │
│  2. Mostrar ao usuário                                          │
│  3. Registrar em SKILL-SUGGESTIONS.md                           │
│  4. Aguardar decisão                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SE USUÁRIO APROVAR                                             │
│                                                                 │
│  1. Ler 00-SKILL-CREATOR/SKILL.md                               │
│  2. Usar padrões detectados como base                           │
│  3. Criar nova skill na pasta /.claude/skills/                  │
│  4. Atualizar SKILL-SUGGESTIONS.md (status: 🟢 Criada)          │
│  5. Confirmar ao usuário                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SE USUÁRIO REJEITAR                                            │
│                                                                 │
│  1. Atualizar SKILL-SUGGESTIONS.md (status: 🔴 Rejeitada)       │
│  2. Continuar normalmente                                       │
│  3. Não sugerir similar por 5 interações                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## CONTEXTOS ESPECIAIS

### Urgência Detectada

Se input contiver: "rápido", "urgente", "agora", "preciso já"
→ **NÃO SUGERIR** (prioridade do usuário)

### Conversa Curta

Se menos de 3 interações na sessão
→ **NÃO SUGERIR** (contexto insuficiente)

### Sugestão Recente Rejeitada

Se usuário rejeitou sugestão similar nas últimas 5 interações
→ **NÃO SUGERIR** (respeitar decisão)

---

## INTEGRAÇÃO COM SKILL-CREATOR

Ao criar skill aprovada:

1. **Ler template** de `00-SKILL-CREATOR/SKILL.md`
2. **Usar nome sugerido** da detecção
3. **Preencher keywords** identificadas
4. **Definir prioridade** baseada em frequência
5. **Documentar regras** dos padrões observados

### Estrutura da Nova Skill

```
/.claude/skills/[nome-skill]/
└── SKILL.md
    ├── Header padrão (nome, trigger, keywords, prioridade)
    ├── Propósito
    ├── Quando usar
    ├── Regras (baseadas nos padrões detectados)
    ├── Anti-patterns
    └── Checklist
```

---

## META-INFORMAÇÃO

- **Versão:** 1.0.0
- **Criado:** Janeiro 2025
- **Tipo:** Protocolo interno
- **Atualização:** Manual quando necessário
