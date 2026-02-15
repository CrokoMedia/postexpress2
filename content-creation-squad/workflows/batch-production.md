# Workflow: Batch Production

**Duração**: 1-3 horas (dependendo da quantidade)
**Objetivo**: Produzir 10-30 carrosséis de uma vez
**Método**: Execução repetida do `quick-carousel.md`
**Output**: Pasta com carrosséis prontos para design/agendamento

---

## 🎯 Overview

Batch Production é a forma mais eficiente de criar conteúdo em escala.

**Vantagens**:
- Economia de tempo (50% mais rápido que criar um a um)
- Consistência de qualidade
- Calendário editorial completo
- Menos decisões repetitivas (batch mindset)

**Quando usar**:
- Planejamento mensal/trimestral
- Preparação para lançamento
- Criação de biblioteca de conteúdo
- Férias/viagens (criar tudo antes)

---

## 📋 PRÉ-REQUISITOS

### 1. Calendário Editorial (Recomendado)

Opção A: Já tem calendário (de `plan-content-batch.md`)
- Use os temas já definidos
- Pule para Passo 2

Opção B: Não tem calendário (criação ad-hoc)
- Liste 10-30 temas agora
- Continue para Passo 1

### 2. Recursos Carregados

Tenha abertos/acessíveis:
- `templates/hook-library.md`
- `templates/cta-library.md`
- `data/carousel-formulas.json`
- Template visual (Canva/Figma)

### 3. Estrutura de Pastas

```
content-creation-squad/
└── output/
    └── batch-[YYYY-MM]/
        ├── carrossel-01.md
        ├── carrossel-02.md
        ├── ...
        └── batch-summary.md
```

---

## 🚀 PASSO 1: Setup (15 minutos)

### 1.1 Criar Pasta do Lote

```bash
mkdir -p output/batch-2026-02
```

### 1.2 Definir Lista de Temas

Se não tem calendário, crie lista rápida:

**Template de Lista**:
```markdown
# Batch Production - Fevereiro 2026

## Temas (15 carrosséis)

### Semana 1 (3-9 Fev)
1. 5 erros de copy que matam conversão | Educacional | IG
2. Framework R.A.C.E para carrosséis virais | Educacional | IG+LI
3. Como escrevi 100 hooks em 1 hora | Autoridade | IG

### Semana 2 (10-16 Fev)
4. 7 gatilhos mentais para aumentar CTR | Educacional | IG
5. Opinião polêmica: consistência não cresce conta | Viral | IG+LI
6. Método P.A.S.O para CTAs que convertem | Educacional | LI

[... continuar para 15 temas ...]
```

**Dica**: Use mesmo padrão de tema, varie apenas o tópico
- "X erros de [tema]"
- "Como [resultado] usando [método]"
- "Framework [sigla] para [objetivo]"

### 1.3 Definir Mix Estratégico

Balanceamento recomendado:

| Tipo | % do Total | Objetivo |
|------|-----------|----------|
| **Educacional** | 50-60% | Valor, saves, autoridade |
| **Autoridade** | 20-30% | Thought leadership |
| **Vendas** | 10-20% | Conversão direta |
| **Viral** | 10-20% | Alcance, novos seguidores |

**Exemplo para 20 carrosséis**:
- 11 Educacionais
- 5 Autoridade
- 2 Vendas
- 2 Virais

### 1.4 Escolher 2-3 Templates Visuais

Para variar visualmente:
- Template A: Fundo branco + texto preto + acento azul
- Template B: Fundo azul escuro + texto branco + acento laranja
- Template C: Gradiente suave + texto escuro

Distribuir:
- Carrosséis 1-7: Template A
- Carrosséis 8-14: Template B
- Carrosséis 15-20: Template C

---

## ⚡ PASSO 2: Produção em Lote (LOOP)

### Processo para CADA carrossel:

```
Para cada tema na lista:
  1. Executar quick-carousel.md (5 min)
     - Input: tema da lista
     - Output: carrossel completo

  2. Salvar como: output/batch-YYYY-MM/carrossel-NN.md

  3. Adicionar ao tracking (opcional):
     - Checklist: tema concluído ✓

  4. Next tema
```

### Timing Esperado:

| Quantidade | Tempo Estimado | Com Pausas |
|------------|----------------|------------|
| 10 carrosséis | 50 min | 1h 15min |
| 15 carrosséis | 1h 15min | 1h 45min |
| 20 carrosséis | 1h 40min | 2h 15min |
| 30 carrosséis | 2h 30min | 3h 15min |

**Dica**: Faça sessões de 1h (12 carrosséis) com pausa de 10 min

---

## 🎨 PASSO 3: Produção Visual (Opcional, se tiver tempo)

### Opção A: Deixar para Designer
- Enviar pasta com 20 arquivos .md
- Designer pega templates visuais
- 30-45 min por carrossel = 10-15h total

### Opção B: Você Mesmo (com Templates Canva)
- Abrir template visual
- Copy/paste texto de cada slide
- Exportar
- 10-15 min por carrossel = 3-5h para 20

### Opção C: Híbrido (recomendado)
- Fazer você mesmo 5 mais importantes
- Resto deixar para designer/ferramentas

---

## ✅ PASSO 4: Review Geral (30 minutos)

### 4.1 Checklist de Variação

Garantir diversidade:

- [ ] **Hooks variados** (não repetir mesmo tipo 3x seguidas)
- [ ] **CTAs diversificados** (comentar, salvar, compartilhar, link)
- [ ] **Fórmulas diferentes** (não usar mesma estrutura 5x)
- [ ] **Tonalidade variada** (educativo, provocativo, inspirador)
- [ ] **Awareness stages** misturados

**Como corrigir**: Se 10 carrosséis usam hook "X erros...", variar 5 para outros formatos

### 4.2 Checklist de Sequência Lógica

Se tem calendário:

- [ ] Carrosséis complementam-se ao longo do mês
- [ ] Não há temas contraditórios consecutivos
- [ ] Vendas aparecem DEPOIS de educar (não vender no 1º post)
- [ ] Sequência conta uma "história" maior

**Exemplo de sequência lógica**:
```
Semana 1: Educar sobre hooks
Semana 2: Educar sobre estrutura
Semana 3: Autoridade (caso de sucesso usando ambos)
Semana 4: Venda (mentoria de copywriting)
```

### 4.3 Checklist de Qualidade

Para cada carrossel, verificar:

- [ ] Hook forte (scroll stop test)
- [ ] Zero typos
- [ ] CTA claro
- [ ] Caption alinhada com slides

**Processo**: Review rápido (2 min/carrossel) = 40 min para 20

---

## 📊 PASSO 5: Organização para Publicação (15 minutos)

### 5.1 Criar Planilha de Agendamento

**Colunas**:
- Data/Hora
- Carrossel (arquivo)
- Plataforma (IG/LI/Ambas)
- Objetivo (Educar/Vender/Viral)
- Status (Pendente/Agendado/Publicado)
- Métricas (Reach/Engagement/Saves)

**Exemplo**:
```
| Data       | Hora  | Carrossel       | Plataforma | Status   |
|------------|-------|-----------------|------------|----------|
| 2026-02-03 | 09:00 | carrossel-01.md | IG         | Agendado |
| 2026-02-05 | 12:00 | carrossel-02.md | IG+LI      | Agendado |
| 2026-02-07 | 18:00 | carrossel-03.md | IG         | Pendente |
```

### 5.2 Agendar Publicações

**Ferramentas**:
- Later (Instagram)
- Buffer (LinkedIn + IG)
- Metricool (multi-plataforma)

**Processo**:
1. Exportar carrosséis para imagens (se já tiver visual)
2. Upload em ferramenta
3. Copiar caption
4. Agendar data/hora
5. Marcar como "Agendado" na planilha

---

## 📈 PASSO 6: Tracking de Performance (Opcional)

### Durante o Mês:

Atualizar planilha com métricas de cada post:

```
| Carrossel       | Reach  | Eng% | Saves | Shares | Top Performer? |
|-----------------|--------|------|-------|--------|----------------|
| carrossel-01.md | 12.5k  | 7.2% | 487   | 89     | ✓             |
| carrossel-02.md | 8.3k   | 4.1% | 201   | 34     |                |
| carrossel-03.md | 23.7k  | 11.3%| 1204  | 312    | ✓✓ (VIRAL)    |
```

### No Final do Mês:

Análise para próximo batch:

**Perguntas**:
1. Quais hooks performaram melhor?
2. Quais CTAs geraram mais ação?
3. Quais tipos (educacional/viral) tiveram melhor alcance?
4. Que temas/ângulos ressoaram mais?

**Ação**:
- Criar mais carrosséis do que funcionou
- Eliminar/reduzir o que não performou
- Testar variações dos top performers

---

## 📝 OUTPUT FINAL

### Estrutura da Pasta:

```
output/batch-2026-02/
├── carrossel-01.md
├── carrossel-02.md
├── ...
├── carrossel-20.md
├── batch-summary.md (resumo do lote)
├── agendamento.csv (planilha)
└── visuals/ (se fizer design)
    ├── carrossel-01/
    │   ├── slide-01.png
    │   ├── slide-02.png
    │   └── ...
    └── carrossel-02/
        └── ...
```

### batch-summary.md:

```markdown
# Batch Production - Fevereiro 2026

**Criado em**: 2026-02-01
**Quantidade**: 20 carrosséis
**Período de publicação**: 2026-02-03 a 2026-02-28
**Frequência**: 3-4x por semana

## Mix Estratégico

- Educacional: 11 (55%)
- Autoridade: 5 (25%)
- Vendas: 2 (10%)
- Viral: 2 (10%)

## Plataformas

- Instagram: 14
- LinkedIn: 6
- Ambas: 8 (contabilizado em ambos acima)

## Hooks Utilizados

- Number (X erros/táticas): 8
- Question: 5
- Command: 3
- Controversial: 2
- Promise: 2

## CTAs Utilizados

- Salvar: 8
- Comentar: 6
- Compartilhar: 3
- Link/DM: 3

## Status

- [x] Copy completo (20/20)
- [ ] Design visual (0/20)
- [ ] Agendamento (0/20)
- [ ] Publicação (0/20)

## Performance (atualizar mensalmente)

- Reach médio: _______
- Engagement médio: _______
- Saves médio: _______
- Top performer: carrossel-XX (tema: ______)
```

---

## 💡 Dicas Avançadas

### 1. Batch por Tema (Super Eficiente)

Ao invés de temas aleatórios, faça batch de 5-10 carrosséis sobre MESMO tema macro:

**Exemplo: "Copywriting"**
1. 5 erros de copy que matam conversão
2. Framework P.A.S. para copy persuasivo
3. Como escrevi 100 headlines em 1 hora
4. 7 gatilhos mentais para CTAs
5. Caso: como copy aumentou vendas em 300%

**Vantagem**:
- Research uma vez, usa 5x
- Profundidade no tema (série)
- Audiência espera próximo (antecipação)

### 2. Reutilizar Research

Ao criar carrossel educacional:
- Pegue dados/estatísticas usados
- Crie carrossel de "caso de estudo" com mesmos dados
- Crie carrossel "opinião" sobre tendência

**1 research → 3 carrosséis**

### 3. A/B Testing em Batch

Criar 2 versões do mesmo carrossel:
- Versão A: Hook tipo "Question"
- Versão B: Hook tipo "Number"

Publicar com 1 semana de diferença, comparar performance

### 4. Upgrade Seletivo

Após batch de 20 quick carousels:
- Analisar performance nos primeiros 10 dias
- Top 3 performers: refazer com `carousel-full-flow.md`
- Republicar versão 2.0 ou usar em outro canal

---

## ⚠️ Erros Comuns (e Como Evitar)

### Erro 1: Repetição de Hooks
**Problema**: 10 carrosséis começam com "X erros de..."
**Solução**: Revisar todos os hooks juntos, forçar variação

### Erro 2: Calendário Ilógico
**Problema**: Vender no primeiro post, educar depois
**Solução**: Seguir sequência: educar → autoridade → vender

### Erro 3: Burnout de Criação
**Problema**: Tentar criar 30 carrosséis em 1 sessão
**Solução**: Dividir em sessões de 1h (10-12 carrosséis)

### Erro 4: Esquecer de Revisar
**Problema**: Publicar com typos
**Solução**: Review no dia seguinte (olhos frescos)

### Erro 5: Não Rastrear Performance
**Problema**: Não saber o que funciona
**Solução**: Planilha simples, preencher 1x por semana

---

## 📅 Calendário Ideal de Batch Production

### Mensal (Recomendado):

**Última semana do mês**:
- Dia 1: Setup + listar temas (1h)
- Dia 2: Criar 15 carrosséis (copy) (1.5h)
- Dia 3: Review + ajustes (30min)
- Dia 4: Design de 5 principais (2h)
- Dia 5: Agendar todos (30min)

**Mês seguinte**: apenas publicar automaticamente

### Trimestral (Avançado):

Criar 3 meses de uma vez (60-90 carrosséis):
- Semana 1: Planejamento estratégico
- Semana 2: Copy de todos
- Semana 3: Design
- Semana 4: Agendamento + buffer

**Vantagem**: Liberdade total por 3 meses

---

## 🎯 Benchmark de Velocidade

**Iniciante** (primeira vez):
- 10 carrosséis = 2h
- Com pausa/dúvidas

**Intermediário** (já fez 2-3 batches):
- 10 carrosséis = 1h 15min
- Processo fluido

**Avançado** (master do processo):
- 10 carrosséis = 50min
- Templates mentais prontos

**Como melhorar**: Fazer batch monthly por 3 meses

---

## ✅ Checklist Final

### Pré-Produção
- [ ] Pasta criada: `output/batch-YYYY-MM/`
- [ ] Lista de temas definida (10-30)
- [ ] Mix estratégico balanceado
- [ ] Recursos abertos (hook/cta libraries)
- [ ] Templates visuais escolhidos (2-3)

### Produção
- [ ] Todos carrosséis criados (copy completa)
- [ ] Salvos como .md numerados
- [ ] Hooks variados (não repetir tipo)
- [ ] CTAs diversificados

### Pós-Produção
- [ ] Review geral feito
- [ ] Typos corrigidos
- [ ] Sequência lógica verificada
- [ ] batch-summary.md criado
- [ ] Planilha de agendamento pronta

### Publicação
- [ ] Design visual (se aplicável)
- [ ] Posts agendados
- [ ] Planilha de tracking preparada

---

**Workflows relacionados**:
- `quick-carousel.md` - Usado em loop para criar cada carrossel
- `carousel-full-flow.md` - Para upgrade dos top performers
- Tasks: `plan-content-batch.md` - Para criar calendário antes do batch
