# 🔬 Squad Auditores

> Squad especializado em auditoria e análise de dados scrapeados de Instagram e redes sociais.

## Ativar

```bash
/squad-auditores
```

## Os 5 Auditores

| Auditor | Mente | Especialidade |
|---------|-------|--------------|
| 🧠 Audit Lead | Daniel Kahneman | Comportamento & viés da audiência |
| ✍️ Copy Auditor | Eugene Schwartz | Copy, hooks & awareness stage |
| 💰 Offer Auditor | Alex Hormozi | Ofertas, CTAs & value equation |
| 📊 Metrics Auditor | Marty Cagan | Métricas, outcomes & produto |
| 🔍 Anomaly Detector | Paul Graham | Anomalias & oportunidades |

## Estrutura

```
squad-auditores/
├── squad.yaml                    # Configuração do squad
├── minds/                        # 5 mentes completas
│   ├── daniel_kahneman/
│   ├── eugene_schwartz/
│   ├── alex_hormozi/
│   ├── marty_cagan/
│   └── paul_graham/
├── agents/                       # 5 agentes especializados
│   ├── audit-lead.md
│   ├── copy-auditor.md
│   ├── offer-auditor.md
│   ├── metrics-auditor.md
│   └── anomaly-detector.md
├── tasks/                        # Tarefas de auditoria
│   ├── audit-account.md
│   ├── audit-content.md
│   └── compare-competitors.md
├── workflows/                    # Workflows
│   ├── full-audit.md
│   └── quick-audit.md
├── templates/                    # Templates de relatório
│   └── audit-report.md
└── data/
    └── audit-criteria.json       # Critérios e benchmarks
```

## Inputs Aceitos

- JSON do scraper (Apify, Phantombuster, etc.)
- CSV com posts e métricas
- Posts colados diretamente
- URL de perfil (análise qualitativa)

## Output

Score Card (0-100) em 5 dimensões + relatório com recomendações priorizadas.
