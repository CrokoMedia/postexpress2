# 🏠 Wireframes — Portal do Cliente PostExpress

**Data:** 2026-02-16
**Designer:** Uma (UX Design Expert)
**Baseado em:** UX Research Report + PRD v2.0

---

## 🎯 Objetivo do Portal

Interface web onde clientes:
1. **Visualizam** carrosséis criados pela IA
2. **Editam** no Editor Visual (opcional)
3. **Aprovam** para renderização final
4. **Baixam** imagens prontas
5. **Acompanham** histórico de conteúdos

---

## 🖼️ Wireframe 1: Dashboard Principal

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CROKO LABS — Portal do Cliente                                                   │
│                                                                                      │
│  🏠 Dashboard   📄 Meus Conteúdos   📊 Métricas   ⚙️ Configurações        [👤 Carlos▼]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Olá, Carlos! 👋                                                                     │
│  Bem-vindo de volta. Você tem 3 carrosséis aguardando aprovação.                    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           RESUMO                                               │ │
│  ├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┐ │ │
│  │ 🟡 Rascunhos │ ✏️ Em Edição │ 🎨 Renderando│ 🟢 Aprovados │ ✅ Publicados   │ │ │
│  │              │              │              │              │                 │ │ │
│  │      3       │      1       │      0       │      5       │       48        │ │ │
│  │              │              │              │              │                 │ │ │
│  │  [Ver Todos] │  [Continuar] │      —       │  [Baixar]    │  [Ver Histórico]│ │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                                      │
│  🟡 RASCUNHOS (3)                                             [Ordenar: Recentes▼]  │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 "7 erros que te impedem de vender"                                       │   │
│  │                                                                              │   │
│  │ ┌─────────┐  Tipo: Educacional                                              │   │
│  │ │ [THUMB] │  Criado: Hoje, 10:30                                            │   │
│  │ │  Capa   │  Squad Criação: Finalizado                                      │   │
│  │ │ Slide   │  Status: 🟡 Aguardando sua aprovação                            │   │
│  │ └─────────┘                                                                  │   │
│  │              Descrição: Carrossel educacional sobre erros comuns em vendas.│   │
│  │              10 slides no formato tweet-style.                              │   │
│  │                                                                              │   │
│  │              [👁️ Visualizar] [🎨 Editar no Canvas] [🔴 Solicitar Ajustes IA] │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 "Como dobrar suas vendas em 30 dias"                                     │   │
│  │                                                                              │   │
│  │ ┌─────────┐  Tipo: Vendas                                                   │   │
│  │ │ [THUMB] │  Criado: Ontem, 15:20                                           │   │
│  │ │  Capa   │  Squad Criação: Finalizado                                      │   │
│  │ │ Slide   │  Status: 🟡 Aguardando sua aprovação                            │   │
│  │ └─────────┘                                                                  │   │
│  │              Descrição: Carrossel de vendas com método passo a passo.      │   │
│  │              8 slides no formato minimalista.                               │   │
│  │                                                                              │   │
│  │              [👁️ Visualizar] [🎨 Editar no Canvas] [🔴 Solicitar Ajustes IA] │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 "Framework de vendas consultivas"                                        │   │
│  │                                                                              │   │
│  │ ┌─────────┐  Tipo: Autoridade                                               │   │
│  │ │ [THUMB] │  Criado: 2 dias atrás, 09:15                                    │   │
│  │ │  Capa   │  Squad Criação: Finalizado                                      │   │
│  │ │ Slide   │  Status: 🟡 Aguardando sua aprovação                            │   │
│  │ └─────────┘                                                                  │   │
│  │              Descrição: Carrossel de autoridade apresentando framework     │   │
│  │              proprietário. 7 slides no formato tweet-style.                │   │
│  │                                                                              │   │
│  │              [👁️ Visualizar] [🎨 Editar no Canvas] [🔴 Solicitar Ajustes IA] │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                                      │
│  ✏️ EM EDIÇÃO (1)                                                                    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ 📄 "Segredos da negociação B2B"                                             │   │
│  │                                                                              │   │
│  │ ┌─────────┐  Tipo: Educacional                                              │   │
│  │ │ [THUMB] │  Criado: Hoje, 08:45                                            │   │
│  │ │  Capa   │  Você está editando há: 15 minutos                              │   │
│  │ │ Slide   │  Status: ✏️ Em edição                                            │   │
│  │ └─────────┘  Auto-save: ✓ Salvo às 11:03                                    │   │
│  │                                                                              │   │
│  │              Última edição: Mudança de cor do fundo (branco → bege)         │   │
│  │              Progresso: 60% dos slides revisados                            │   │
│  │                                                                              │   │
│  │              [🎨 Continuar Editando]                    [✅ Aprovar Agora]   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                                      │
│  🟢 APROVADOS — PRONTOS PARA PUBLICAR (5)                  [Ver Todos →]             │
│                                                                                      │
│  ┌───────┬───────┬───────┬───────┬───────┐                                         │
│  │[THUMB]│[THUMB]│[THUMB]│[THUMB]│[THUMB]│  ← Grid de thumbnails                   │
│  │ Post1 │ Post2 │ Post3 │ Post4 │ Post5 │                                          │
│  └───────┴───────┴───────┴───────┴───────┘                                         │
│                                                                                      │
│                                                                                      │
│  📊 PRÓXIMAS ENTREGAS                                                                │
│                                                                                      │
│  • 4 carrosséis em produção (Squad Criação trabalhando)                             │
│  • Previsão: Prontos em 2 dias                                                      │
│  • Tema: Lançamento do Produto X                                                    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Wireframe 2: Página "Meus Conteúdos"

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CROKO LABS — Meus Conteúdos                                                      │
│                                                                                      │
│  🏠 Dashboard   📄 Meus Conteúdos   📊 Métricas   ⚙️ Configurações        [👤 Carlos▼]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Meus Conteúdos                                                                      │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  FILTROS:                                                                      │ │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐ │ │
│  │  │ Status: [▼]  │ Tipo: [▼]    │ Período: [▼] │ Buscar: [  ] │ [🔍]         │ │ │
│  │  │ Todos        │ Todos        │ Últimos 30d  │              │              │ │ │
│  │  └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  VISUALIZAÇÃO:  [☷ Lista]  [⊞ Grid]               Ordenar: [Recentes ▼]       │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  57 conteúdos encontrados                                                            │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────┐                                                                    │   │
│  │ │[THUMB]│  📄 "7 erros que te impedem de vender"                            │   │
│  │ │ Capa  │                                                                    │   │
│  │ │Slide  │  🟡 Rascunho  |  Educacional  |  Criado: Hoje, 10:30              │   │
│  │ └───────┘                                                                    │   │
│  │           10 slides • Tweet-style • Squad finalizado                         │   │
│  │                                                                              │   │
│  │           [👁️ Ver] [🎨 Editar] [🔴 Ajustes] [⋮ Mais]                         │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────┐                                                                    │   │
│  │ │[THUMB]│  📄 "Como dobrar suas vendas em 30 dias"                          │   │
│  │ │ Capa  │                                                                    │   │
│  │ │Slide  │  🟡 Rascunho  |  Vendas  |  Criado: Ontem, 15:20                  │   │
│  │ └───────┘                                                                    │   │
│  │           8 slides • Minimalista • Squad finalizado                          │   │
│  │                                                                              │   │
│  │           [👁️ Ver] [🎨 Editar] [🔴 Ajustes] [⋮ Mais]                         │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────┐                                                                    │   │
│  │ │[THUMB]│  📄 "Framework de vendas consultivas"                             │   │
│  │ │ Capa  │                                                                    │   │
│  │ │Slide  │  🟢 Aprovado  |  Autoridade  |  Renderizado: Ontem, 18:00         │   │
│  │ └───────┘                                                                    │   │
│  │           7 slides • Tweet-style • Pronto para publicar                      │   │
│  │                                                                              │   │
│  │           [👁️ Ver] [⬇️ Baixar ZIP] [✅ Marcar Publicado] [⋮ Mais]            │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ ┌───────┐                                                                    │   │
│  │ │[THUMB]│  📄 "Segredos da negociação B2B"                                  │   │
│  │ │ Capa  │                                                                    │   │
│  │ │Slide  │  ✏️ Em Edição  |  Educacional  |  Iniciado: Hoje, 08:45           │   │
│  │ └───────┘                                                                    │   │
│  │           9 slides • Bold Colors • Auto-save: ✓ 11:03                        │   │
│  │                                                                              │   │
│  │           [🎨 Continuar] [✅ Aprovar] [⋮ Mais]                                │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ...                                                                                 │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Página 1 de 6               [◄ Anterior]  [1] [2] [3] ... [6]  [Próxima ►]   │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Wireframe 3: Página de Visualização (Preview de Carrossel)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ← Voltar aos Conteúdos                                                              │
│                                                                                      │
│  📄 "7 erros que te impedem de vender"                                               │
│  Status: 🟡 Rascunho                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────────────────────┬───────────────────────────────────────────────┐ │
│  │                                │  INFORMAÇÕES                                  │ │
│  │                                │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                │                                               │ │
│  │      PREVIEW DO CARROSSEL      │  Tipo: Educacional                            │ │
│  │                                │  Slides: 10                                   │ │
│  │  ┌──────────────────────────┐  │  Template: Tweet-style                        │ │
│  │  │                          │  │  Criado: Hoje, 10:30                          │ │
│  │  │                          │  │  Squad: Finalizado                            │ │
│  │  │   (Slide 1/10)           │  │                                               │ │
│  │  │                          │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  │   ┌────────┐             │  │                                               │ │
│  │  │   │(○) Nome│ ✓           │  │  LEGENDA SUGERIDA                             │ │
│  │  │   │@usuario│             │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  │   └────────┘             │  │                                               │ │
│  │  │                          │  │  ┌─────────────────────────────────────────┐ │ │
│  │  │   "7 erros que te        │  │  │ 🚨 7 ERROS que estão MATANDO suas      │ │ │
│  │  │    impedem de vender"    │  │  │ vendas (e você nem percebeu) 🚨        │ │ │
│  │  │                          │  │  │                                         │ │ │
│  │  │                          │  │  │ Swipe para descobrir os 7 erros mais   │ │ │
│  │  │                          │  │  │ comuns que impedem vendedores de       │ │ │
│  │  │                          │  │  │ atingirem suas metas.                  │ │ │
│  │  │                          │  │  │                                         │ │ │
│  │  │                          │  │  │ 👉 Salve este post para consultar      │ │ │
│  │  │                          │  │  │ sempre que precisar.                   │ │ │
│  │  │                          │  │  │                                         │ │ │
│  │  │                          │  │  │ #vendas #marketing #empreendedorismo   │ │ │
│  │  │                          │  │  │ #negócios #consultoria                 │ │ │
│  │  └──────────────────────────┘  │  └─────────────────────────────────────────┘ │ │
│  │                                │                                               │ │
│  │  ○○○○○○●○○○  (Slide 7/10)      │  [✏️ Editar Legenda]                          │ │
│  │                                │                                               │ │
│  │  [◄ Anterior] [Próximo ►]      │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                │                                               │ │
│  │  ┌──────────────────────────┐  │  THUMBNAILS DOS SLIDES                        │ │
│  │  │ [Ver em Fullscreen]      │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  └──────────────────────────┘  │                                               │ │
│  │                                │  ┌───┬───┬───┬───┬───┐                       │ │
│  │                                │  │ 1 │ 2 │ 3 │ 4 │ 5 │                       │ │
│  │                                │  └───┴───┴───┴───┴───┘                       │ │
│  │                                │  ┌───┬───┬───┬───┬───┐                       │ │
│  │                                │  │ 6 │ 7*│ 8 │ 9 │10 │ (* = atual)           │ │
│  │                                │  └───┴───┴───┴───┴───┘                       │ │
│  │                                │                                               │ │
│  └────────────────────────────────┴───────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  AÇÕES:                                                                        │ │
│  │  ┌──────────────────────┬──────────────────────┬──────────────────────────┐   │ │
│  │  │ 🎨 Editar no Canvas  │ 🔴 Solicitar Ajustes │ ✅ Aprovar Carrossel     │   │ │
│  │  │                      │                      │                          │   │ │
│  │  │ Abrir Editor Visual  │ Pedir IA refazer     │ Enviar para renderização │   │ │
│  │  │ para ajustar cores,  │ algumas partes.      │ final. Após aprovado,    │   │ │
│  │  │ textos e layout.     │                      │ não pode editar.         │   │ │
│  │  └──────────────────────┴──────────────────────┴──────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Wireframe 4: Modal "Solicitar Ajustes IA"

```
┌───────────────────────────────────────────────────────────┐
│  Solicitar Ajustes à IA                              [❌] │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Descreva o que você gostaria de mudar:                  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Ex: "Mudar cor do fundo para laranja" ou         │   │
│  │ "Usar tom mais direto nos títulos"               │   │
│  │                                                   │   │
│  │                                                   │   │
│  │                                                   │   │
│  │                                                   │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  Ou selecione um ajuste comum:                            │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │ ☐ Mudança de cor (especifique qual)              │   │
│  │ ☐ Ajuste de tom (mais formal/informal)           │   │
│  │ ☐ Reescrever títulos (mais direto/sutil)         │   │
│  │ ☐ Trocar template (qual?)                        │   │
│  │ ☐ Ajustar comprimento dos textos                 │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ⏱️ Tempo estimado para refazer: 10-15 minutos            │
│  💰 Sem custo adicional                                   │
│                                                           │
│                       [Cancelar]  [Enviar Solicitação]    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🖼️ Wireframe 5: Página de Download (Carrossel Aprovado)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ← Voltar aos Conteúdos                                                              │
│                                                                                      │
│  📄 "Framework de vendas consultivas"                                                │
│  Status: 🟢 Aprovado e Renderizado                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ✅ Carrossel renderizado com sucesso!                                               │
│  Renderizado em: 16 fev 2026, 18:42                                                 │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  PREVIEW DAS IMAGENS FINAIS                                                    │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  ┌────┬────┬────┬────┬────┬────┬────┐                                         │ │
│  │  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │  ← Click para ver em tamanho real      │ │
│  │  │[IMG]│[IMG]│[IMG]│[IMG]│[IMG]│[IMG]│[IMG]│                                    │ │
│  │  └────┴────┴────┴────┴────┴────┴────┘                                         │ │
│  │                                                                                │ │
│  │  Formato: PNG 1080x1350px (Instagram 4:5)                                     │ │
│  │  Tamanho total: 8.4 MB (7 imagens)                                            │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  DOWNLOADS                                                                     │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  ┌────────────────────────────────┐   ┌────────────────────────────────────┐ │ │
│  │  │ 📦 Baixar Todas (ZIP)          │   │ 📄 Baixar Legenda (TXT)            │ │ │
│  │  │                                │   │                                    │ │ │
│  │  │ Inclui: 7 imagens PNG +        │   │ Caption pronta para copiar e       │ │ │
│  │  │ legenda em TXT                 │   │ colar no Instagram/LinkedIn        │ │ │
│  │  │                                │   │                                    │ │ │
│  │  │ [⬇️ Baixar ZIP (8.4 MB)]        │   │ [⬇️ Baixar TXT]                    │ │ │
│  │  └────────────────────────────────┘   └────────────────────────────────────┘ │ │
│  │                                                                                │ │
│  │  ┌────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ 🖼️ Baixar Imagens Individualmente                                      │   │ │
│  │  │                                                                        │   │ │
│  │  │ • Slide 1 — Capa.png             [⬇️ Download]                         │   │ │
│  │  │ • Slide 2 — Intro.png            [⬇️ Download]                         │   │ │
│  │  │ • Slide 3 — Passo 1.png          [⬇️ Download]                         │   │ │
│  │  │ • Slide 4 — Passo 2.png          [⬇️ Download]                         │   │ │
│  │  │ • Slide 5 — Passo 3.png          [⬇️ Download]                         │   │ │
│  │  │ • Slide 6 — Conclusão.png        [⬇️ Download]                         │   │ │
│  │  │ • Slide 7 — CTA.png              [⬇️ Download]                         │   │ │
│  │  └────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  PUBLICAÇÃO                                                                    │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  📱 Publicar em:                                                               │ │
│  │  ┌────────────────────┬────────────────────┐                                  │ │
│  │  │ Instagram          │ LinkedIn           │                                  │ │
│  │  │ ✅ Pronto          │ ✅ Pronto          │                                  │ │
│  │  └────────────────────┴────────────────────┘                                  │ │
│  │                                                                                │ │
│  │  Já publicou este carrossel?                                                   │ │
│  │  ┌────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ [✅ Marcar como Publicado]                                              │   │ │
│  │  └────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                                │ │
│  │  Ao marcar como publicado:                                                     │ │
│  │  • Você pode adicionar data e hora da publicação (opcional)                   │ │
│  │  • Podemos rastrear performance (likes, comentários) no futuro                │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Wireframe 6: Página de Métricas (Futuro)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CROKO LABS — Métricas                                                             │
│                                                                                      │
│  🏠 Dashboard   📄 Meus Conteúdos   📊 Métricas   ⚙️ Configurações        [👤 Carlos▼]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  📊 Performance dos Seus Conteúdos                                                   │
│                                                                                      │
│  Período: [Últimos 30 dias ▼]                                                       │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  RESUMO GERAL                                                                  │ │
│  ├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┐ │ │
│  │ 📤 Publicados│ 👁️ Alcance   │ ❤️ Engajamento│ 💬 Comentários│ 🔖 Salvos       │ │ │
│  │              │              │              │              │                 │ │ │
│  │      48      │   124.5K     │     8.2%     │     342      │      1.2K       │ │ │
│  │              │              │              │              │                 │ │ │
│  │  vs mês ant. │  +23% ↑      │  +1.4% ↑     │  +15% ↑      │  +42% ↑         │ │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  GRÁFICO DE ALCANCE (Últimos 30 dias)                                         │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │   10K │                                                        ╱╲              │ │
│  │       │                                      ╱╲               ╱  ╲             │ │
│  │    5K │                    ╱╲              ╱  ╲             ╱    ╲            │ │
│  │       │          ╱╲       ╱  ╲            ╱    ╲    ╱╲    ╱      ╲           │ │
│  │    0K │─────────────────────────────────────────────────────────────          │ │
│  │       │  1   5   10  15  20  25  30  (dias)                                   │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  TOP 5 CARROSSÉIS (Por Engajamento)                                           │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  1. "7 erros que te impedem de vender"           12.4% eng.  |  3.2K likes    │ │
│  │  2. "Framework de vendas consultivas"            10.8% eng.  |  2.8K likes    │ │
│  │  3. "Como dobrar suas vendas em 30 dias"          9.7% eng.  |  2.5K likes    │ │
│  │  4. "Segredos da negociação B2B"                  8.9% eng.  |  2.1K likes    │ │
│  │  5. "Gatilhos mentais em vendas"                  7.3% eng.  |  1.9K likes    │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ⚠️ Esta funcionalidade está em desenvolvimento.                                     │
│  Em breve você poderá integrar suas métricas do Instagram/LinkedIn automaticamente. │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Wireframe 7: Página de Configurações

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CROKO LABS — Configurações                                                        │
│                                                                                      │
│  🏠 Dashboard   📄 Meus Conteúdos   📊 Métricas   ⚙️ Configurações        [👤 Carlos▼]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ⚙️ Configurações da Conta                                                           │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  PERFIL                                                                        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  ┌───────┐                                                                     │ │
│  │  │ (○)   │  Carlos Silva                                                       │ │
│  │  │  Avatar│  @carlossilva                                                      │ │
│  │  └───────┘  carlos@exemplo.com                                                 │ │
│  │             ✓ Conta verificada                                                 │ │
│  │                                                                                │ │
│  │  [Trocar Foto]  [Editar Perfil]                                               │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  BRAND COLORS (Cores da Marca)                                                 │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  Defina até 5 cores que serão sugeridas no Editor Visual:                     │ │
│  │                                                                                │ │
│  │  ┌───────────────┬───────────────┬───────────────┬───────────────┬─────────┐  │ │
│  │  │ Primária      │ Secundária    │ Destaque      │ Fundo         │ Texto   │  │ │
│  │  │               │               │               │               │         │  │ │
│  │  │ [█ #FF6B35]🎨 │ [█ #004E89]🎨 │ [█ #F7931E]🎨 │ [█ #FFFFFF]🎨 │[█ #000]🎨│  │ │
│  │  │               │               │               │               │         │  │ │
│  │  └───────────────┴───────────────┴───────────────┴───────────────┴─────────┘  │ │
│  │                                                                                │ │
│  │  Essas cores aparecerão como sugestões ao editar carrosséis.                  │ │
│  │                                                                                │ │
│  │  [Salvar Cores]  [Redefinir para Padrão]                                      │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  NOTIFICAÇÕES                                                                  │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  ☑ Novo carrossel disponível (email)                                          │ │
│  │  ☑ Carrossel renderizado (email + in-app)                                     │ │
│  │  ☐ Lembrete de aprovação pendente (email semanal)                             │ │
│  │  ☑ Atualizações do sistema (email mensal)                                     │ │
│  │                                                                                │ │
│  │  [Salvar Preferências]                                                         │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  PREFERÊNCIAS DO EDITOR                                                        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  ☑ Auto-save a cada 2 segundos                                                │ │
│  │  ☑ Mostrar guias de alinhamento                                               │ │
│  │  ☑ Snap to grid (8px)                                                         │ │
│  │  ☐ Sempre abrir em modo fullscreen                                            │ │
│  │                                                                                │ │
│  │  Template padrão: [Tweet-style ▼]                                             │ │
│  │                                                                                │ │
│  │  [Salvar Preferências]                                                         │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │  SEGURANÇA                                                                     │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                                                │ │
│  │  [Mudar Senha]  [Ativar 2FA]  [Sessões Ativas]                                │ │
│  │                                                                                │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Wireframe 8: Mobile — Dashboard

```
┌───────────────────────┐
│ PostExpress      [☰] │
├───────────────────────┤
│                       │
│ 👋 Olá, Carlos!       │
│                       │
│ Você tem 3 carrosséis │
│ aguardando aprovação. │
│                       │
│ ┌───────────────────┐ │
│ │ RESUMO            │ │
│ ├─────┬─────┬───────┤ │
│ │🟡 3 │✏️ 1 │✅ 48  │ │
│ │Rasc.│Edit │Publ.  │ │
│ └─────┴─────┴───────┘ │
│                       │
│ 🟡 RASCUNHOS          │
│                       │
│ ┌───────────────────┐ │
│ │ [THUMB]           │ │
│ │ 7 erros que te    │ │
│ │ impedem de...     │ │
│ │                   │ │
│ │ Educacional       │ │
│ │ Hoje, 10:30       │ │
│ │                   │ │
│ │ [Ver] [Editar]    │ │
│ └───────────────────┘ │
│                       │
│ ┌───────────────────┐ │
│ │ [THUMB]           │ │
│ │ Como dobrar       │ │
│ │ suas vendas...    │ │
│ │                   │ │
│ │ Vendas            │ │
│ │ Ontem, 15:20      │ │
│ │                   │ │
│ │ [Ver] [Editar]    │ │
│ └───────────────────┘ │
│                       │
│       ...             │
│                       │
│ [Ver Todos (57)]      │
│                       │
└───────────────────────┘
```

---

## 🎨 Especificações de Design

### Paleta de Cores (Status)
```
🟡 Rascunho:       #FFD93D (Amarelo)
✏️ Em Edição:      #6BCF7F (Verde Claro)
⏳ Aguardando:     #A8DADC (Azul Claro)
🎨 Renderizando:   #457B9D (Azul)
🟢 Aprovado:       #00BA7C (Verde)
✅ Publicado:      #2A9D8F (Verde Escuro)
🔴 Ajustes:        #E63946 (Vermelho)
```

### Tipografia
```
Heading 1:  Inter Bold 32px
Heading 2:  Inter Semibold 24px
Heading 3:  Inter Semibold 18px
Body:       Inter Regular 14px
Small:      Inter Regular 12px
Caption:    Inter Regular 11px (cinza)
```

### Espaçamento
```
Padding card:      24px
Margin between:    16px
Section spacing:   48px
```

---

## 🎯 Priorização de Funcionalidades

### MVP (Mínimo Viável)
- ✅ Dashboard com resumo
- ✅ Lista de conteúdos
- ✅ Visualização de carrossel
- ✅ Editar no Canvas (link para Editor Visual)
- ✅ Aprovar para renderização
- ✅ Download ZIP

### Fase 2
- ✅ Solicitar ajustes IA
- ✅ Comentários/feedback
- ✅ Configurações (brand colors)
- ✅ Notificações

### Fase 3 (Futuro)
- Métricas de performance
- Integração Instagram/LinkedIn
- Agendamento de posts
- Biblioteca de assets compartilhada

---

**Próximo:** Design System e Tokens

---

**Assinado:** Uma, desenhando portais intuitivos 💝
