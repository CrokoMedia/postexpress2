# Task: Create Design

**ID**: create-design
**Agent**: design-lead
**Elicit**: true
**Duration**: 15-20 min

## Objetivo
Criar design visual completo para carrossel de Instagram ou LinkedIn, com identidade de marca consistente e impacto visual estratégico.

## Inputs Necessários

### 1. Briefing de Design (OBRIGATÓRIO)
```yaml
elicit:
  - question: "Você já tem o COPY do carrossel pronto?"
    options:
      - Sim, copy completo
      - Sim, apenas estrutura
      - Não, preciso criar junto

  - question: "Qual a PLATAFORMA?"
    options:
      - Instagram
      - LinkedIn
      - Ambas
      - Twitter

  - question: "Você já tem IDENTIDADE VISUAL definida?"
    options:
      - Sim, tenho branding completo
      - Tenho cores, mas não completo
      - Não, preciso criar do zero

  - question: "Qual o TOM VISUAL desejado?"
    options:
      - Profissional/Corporativo
      - Criativo/Ousado
      - Minimalista/Clean
      - Vibrante/Energético
      - Luxo/Premium
      - Natural/Sustentável

  - question: "PÚBLICO-ALVO?"
    placeholder: "Ex: Empreendedores 25-40 anos, classe A/B"
```

## Workflow Executivo

### Passo 1: Análise do Copy (5 min)
**Input**: Copy do carrossel ou estrutura

Analisar:
- Quantos slides?
- Qual a hierarquia de informação?
- Onde estão os pontos de destaque?
- Qual emoção queremos evocar?

**Output**: Estrutura visual mapeada

---

### Passo 2: Definir Identidade (se não tiver) (5 min)
**Ativa**: adriano_de_marqui

Se o cliente não tem branding:
```
Prompt para Adriano:
"Baseado neste briefing:
- Público: [público-alvo]
- Tom: [tom visual]
- Mensagem: [mensagem do copy]

Defina:
1. Paleta de cores (3-5 cores)
2. Tipografia (primária + secundária)
3. Estilo visual (minimalista/bold/clean/etc)
4. Elementos de marca (ícones/shapes/patterns)"
```

**Output**: Brand Kit completo

---

### Passo 3: Criar Grid System (3 min)
**Ativa**: adriano_de_marqui

Definir estrutura:
- Margem padrão (60-80px)
- Colunas (grid 12x12)
- Alinhamento (centro/esquerda)
- Espaçamento entre elementos

**Output**: Grid template

---

### Passo 4: Design Slide a Slide (10 min)
**Ativa**: adriano_de_marqui

Para cada slide:

#### Slide 1 (Hook)
```
Prioridades:
- MÁXIMA hierarquia visual
- Texto grande (60-80pt)
- Fundo impactante
- Breathing room generoso

Layout sugerido:
┌─────────────────┐
│                 │
│                 │
│   HOOK GRANDE   │
│   subtexto      │
│                 │
│                 │
└─────────────────┘
```

#### Slides 2-8 (Conteúdo)
```
Prioridades:
- Consistência
- Legibilidade
- Hierarquia clara
- Visual support (ícones/shapes)

Layout sugerido:
┌─────────────────┐
│ 📍 TÍTULO       │
│                 │
│ Texto explicativo│
│ em 2-3 linhas   │
│                 │
│ [visual/ícone]  │
└─────────────────┘
```

#### Slide 9-10 (CTA/Resumo)
```
Prioridades:
- CTA visível
- Urgência visual
- Fácil de executar

Layout sugerido:
┌─────────────────┐
│                 │
│  RESUMO RÁPIDO  │
│                 │
│ ▶ CTA CLARO     │
│                 │
└─────────────────┘
```

**Output**: 10 slides desenhados

---

### Passo 5: Specs Técnicas (2 min)

Gerar documento com:

```markdown
# SPECS TÉCNICAS - [Nome do Carrossel]

## Dimensões
- Formato: 1080x1080px (Instagram) ou 1080x1350px (4:5)
- DPI: 72 (web) ou 300 (impressão se necessário)

## Paleta de Cores
- Primária: #XXXXXX (nome)
- Secundária: #XXXXXX (nome)
- Acento: #XXXXXX (nome)
- Fundo: #XXXXXX
- Texto: #XXXXXX

## Tipografia
- Título: [Fonte] Bold, 60-80pt
- Subtítulo: [Fonte] Medium, 36-48pt
- Corpo: [Fonte] Regular, 24-32pt
- Caption: [Fonte] Regular, 18-20pt

## Grid
- Margem: 80px
- Colunas: 12
- Gutter: 20px
- Alinhamento: [Centro/Esquerda]

## Elementos Visuais
- Ícones: [Estilo/pack]
- Shapes: [Formas usadas]
- Imagens: [Se houver]
- Patterns: [Se houver]

## Exportação
- Formato: PNG (melhor qualidade) ou JPG (menor peso)
- Compressão: Média (qualidade vs tamanho)
- Nomenclatura: carrossel-[tema]-slide-[numero].png
```

---

### Passo 6: Review Checklist (3 min)

```yaml
Checklist de Qualidade:
- [ ] Legível em mobile (teste em 320px width)?
- [ ] Contraste adequado (mínimo 4.5:1)?
- [ ] Hierarquia visual clara (1 foco por slide)?
- [ ] Consistência de marca (cores, tipografia)?
- [ ] Breathing room suficiente (min 30% espaço branco)?
- [ ] Alinhamento perfeito (grid respeitado)?
- [ ] Tipografia sem viúvas/órfãs?
- [ ] Cores acessíveis (não só vermelho/verde)?
- [ ] Elementos de marca presentes?
- [ ] CTA visível e claro?
```

---

## Output Esperado

### Arquivo Principal
```markdown
# DESIGN: [Título do Carrossel]

## Brand Kit
**Paleta de Cores**:
- Primária: #FF6B35 (Laranja Energia)
- Secundária: #004E89 (Azul Confiança)
- Acento: #FFD23F (Amarelo Destaque)
- Fundo: #FFFFFF
- Texto: #1A1A1A

**Tipografia**:
- Primária: Montserrat (títulos)
- Secundária: Open Sans (corpo)

**Estilo**: Moderno, clean, profissional

---

## SLIDE 1 - HOOK
**Layout**: Centralizado, impacto máximo

**Elementos**:
- Fundo: Gradiente Primária → Secundária
- Título: "4 ERROS DE COPY" (Montserrat Bold, 72pt, branco)
- Subtexto: "que matam conversão" (Open Sans Regular, 36pt, branco 80%)
- Shape: Círculo acento bottom-right (decorativo)

**ASCII Layout**:
```
┌─────────────────────┐
│  [gradiente fundo]  │
│                     │
│   4 ERROS DE COPY   │
│                     │
│ que matam conversão │
│                     │
│              ●      │
└─────────────────────┘
```

## SLIDE 2 - CONTEXTO
[... continuar para todos os slides ...]

---

## SPECS TÉCNICAS
[conforme seção anterior]

---

## ARQUIVOS PARA DESIGNER
- carrossel-erros-copy-slide-01.png
- carrossel-erros-copy-slide-02.png
- [... até slide 10]
- brand-kit.pdf (cores, tipografia, logos)

---

## INSTRUÇÕES CANVA/FIGMA
1. Criar artboard 1080x1080px
2. Importar brand kit
3. Criar grid 12 colunas, margem 80px
4. Seguir layouts especificados
5. Exportar PNG alta qualidade

---

## TIMELINE
- Design: 15-20 min (este documento)
- Execução visual: 30-60 min (designer)
- Review: 10 min
- Total: 1-2 horas
```

## Recursos

- **Brand Kit Templates**: `templates/brand-kit-template.md`
- **Grid Systems**: `templates/grid-systems.md`
- **Color Psychology**: `data/color-psychology.json`
- **Typography Pairings**: `data/typography-pairings.json`

## Tips Pro

1. **Teste Mobile SEMPRE** - 70% vê em celular
2. **Menos é mais** - Corte 50% dos elementos visuais
3. **Consistência > Criatividade** - Marca reconhecível
4. **Contraste decide legibilidade** - Mínimo 4.5:1
5. **Grid disciplina** - Alinhamento perfeito
6. **Tipografia clara** - Sans-serif para digital
7. **Breathing room** - Espaço em branco amplifica
8. **Um foco por slide** - Múltiplos focos = caos visual

## Erros Comuns

❌ **Muito texto** - Máximo 3 linhas por slide
❌ **Cores sem estratégia** - Usar paleta definida
❌ **Tipografia ilegível** - Mínimo 40pt para mobile
❌ **Falta de hierarquia** - Tudo do mesmo tamanho
❌ **Inconsistência** - Cada slide com estilo diferente
❌ **Sem breathing room** - Elementos grudados
❌ **Ignorar mobile** - Design só para desktop

## Exemplos de Sucesso

### Exemplo 1: Carrossel Educacional
- Tom: Profissional, clean
- Cores: Azul + Branco + Laranja
- Tipografia: Montserrat + Inter
- Grid: Centralizado, margem 80px
- Resultado: 15k saves, 8% engagement

### Exemplo 2: Carrossel de Vendas
- Tom: Energético, urgente
- Cores: Vermelho + Preto + Amarelo
- Tipografia: Bebas Neue + Roboto
- Grid: Esquerda, margem 60px
- Resultado: 1200 conversões, 12% CTR

### Exemplo 3: Carrossel Viral
- Tom: Criativo, ousado
- Cores: Roxo + Rosa + Branco
- Tipografia: Poppins + Nunito
- Grid: Assimétrico, margem 100px
- Resultado: 500k impressões, 50k shares

## Integração com Outros Agentes

**Recebe copy de**:
- @content-lead (*create)
- @copy-optimizer (*optimize)

**Passa design para**:
- @visual-planner (*checklist) - Review técnico
- Designer externo - Execução visual

**Consulta**:
- @emulator adriano_de_marqui - Para decisões de design
