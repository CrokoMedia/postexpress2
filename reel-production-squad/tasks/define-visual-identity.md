# Task: Define Visual Identity

**ID**: define-visual-identity
**Agent**: art-director
**Elicit**: true
**Duration**: 3-5 min

---

## Descrição

Define a identidade visual completa para o vídeo: template, paleta de cores, estilo de imagem, tipografia, caption style e mood board.

---

## Elicitação

```yaml
elicit:
  - question: "Qual o formato preferido para o vídeo?"
    options:
      - Feed (4:5) — Melhor para texto longo, imagens detalhadas (recomendado)
      - Story (9:16) — Melhor para impacto visual, imersão
      - Square (1:1) — Melhor para repurpose (LinkedIn, Twitter)
    default: "Feed (4:5)"

  - question: "O criador tem cores de marca definidas?"
    options:
      - Sim, vou informar as cores
      - Não, definir automaticamente com base no nicho
    default: "Não, definir automaticamente"

  - question: "Estilo visual preferido?"
    options:
      - Automático (baseado no nicho e tipo de conteúdo) (recomendado)
      - Clean/Minimalista
      - Bold/Impactante
      - Cinematic/Premium
      - Neon/Vibrante
    default: "Automático"
```

---

## Workflow de Execução

### Step 1: Análise do Perfil
**Agent**: art-director

1. Avaliar o nicho do criador
2. Avaliar o tipo de conteúdo (educacional/vendas/autoridade/viral)
3. Verificar se há cores de marca
4. Verificar se há estilo visual preferido
5. Analisar o framework base (Hormozi → dark/bold, Kahneman → clean/data)

### Step 2: Seleção do Template
**Agent**: art-director

Usar a matriz de decisão (template × nicho × tipo):

| Tipo \ Nicho | Marketing | Finanças | Saúde | Tech | Lifestyle |
|-------------|-----------|----------|-------|------|-----------|
| Educacional | minimalist | data-driven | minimalist | data-driven | editorial-magazine |
| Vendas | hormozi-dark | hormozi-dark | minimalist | neon-social | editorial-magazine |
| Autoridade | editorial-magazine | data-driven | editorial-magazine | minimalist | editorial-magazine |
| Viral | neon-social | hormozi-dark | neon-social | neon-social | neon-social |

Justificar a escolha.

### Step 3: Definição da Paleta
**Agent**: art-director

1. Se tem cores de marca → usar como base
2. Se não → definir pela emoção dominante
3. Gerar paleta de 6 cores (primary, secondary, accent, background, text, textSecondary)
4. Verificar contraste WCAG AA

### Step 4: Estilo de Imagem
**Agent**: art-director

1. Definir tipo (fotorrealista, flat, abstrato, ilustração, cinematico, 3d)
2. Definir mood
3. Criar prefixo e sufixo de prompt (para o Diretor usar em todas as imagens)
4. Definir negative prompt (o que evitar)

### Step 5: Recomendações Complementares
**Agent**: art-director

1. Background animado (baseado no template)
2. Caption style (baseado no público)
3. Tipografia (peso e tamanho)
4. Mood board descritivo (referências, adjetivos, anti-padrões)

---

## Output

```
JSON completo no formato `VisualIdentity` (definido em art-director.md)
```

---

## Validação

- [ ] Template é coerente com nicho e tipo de conteúdo
- [ ] Paleta tem contraste suficiente (texto sobre fundo)
- [ ] Prefixo/sufixo de prompt são específicos
- [ ] Caption style é adequado para o público
- [ ] Mood board tem referências concretas (não genéricas)
