# Task: Write Screenplay

**ID**: write-screenplay
**Agent**: screenwriter
**Elicit**: true
**Duration**: 5-10 min

---

## Descrição

Transforma um carrossel aprovado em um roteiro cinematográfico para vídeo curto (Reel/Story/Short).

---

## Elicitação

```yaml
elicit:
  - question: "Qual carrossel será transformado em vídeo?"
    placeholder: "Selecione o carrossel aprovado"
    source: content_suggestions.content_json  # Carrosséis com approved=true

  - question: "Qual a plataforma principal?"
    options:
      - Instagram Reels (padrão)
      - TikTok
      - YouTube Shorts
    default: "Instagram Reels"

  - question: "Duração alvo?"
    options:
      - Curto (15-30s) — hook + 3-4 cenas + CTA
      - Médio (30-45s) — hook + 5-7 cenas + CTA (recomendado)
      - Longo (45-60s) — hook + 8-10 cenas + CTA
    default: "Médio (30-45s)"

  - question: "Tom preferido?"
    options:
      - Manter o tom do carrossel (padrão)
      - Mais provocativo/agressivo
      - Mais calmo/autoritário
      - Mais storytelling/pessoal
    default: "Manter o tom do carrossel"
```

---

## Workflow de Execução

### Step 1: Análise do Carrossel
**Agent**: screenwriter

1. Ler o carrossel completo (título, tipo, slides, CTA, objetivo)
2. Identificar o ARCO NARRATIVO implícito
3. Identificar a EMOÇÃO DOMINANTE
4. Mapear o que funciona como texto vs o que precisa ser reescrito para áudio

### Step 2: Definição da Estrutura
**Agent**: screenwriter

1. Decidir quantas cenas (pode diferir do número de slides)
2. Escolher a estrutura viral:
   - Hook → Tensão → Payoff (educacional)
   - Problema → Agitação → Solução (vendas)
   - Contraintuitivo → Prova → Inversão (autoridade)
   - Lista Rápida → Twist Final (viral)
   - Storytelling → Lição (universal)
3. Definir o ritmo emocional (onde acelerar, onde pausar)

### Step 3: Escrita do Hook
**Agent**: screenwriter

1. Criar o hook (2-3 segundos MÁXIMO)
2. Regra: se não prende em 3s, o vídeo morreu
3. Estilos disponíveis:
   - Pergunta provocativa
   - Afirmação chocante
   - Dado contraintuitivo
   - Promessa irresistível
   - Provocação direta
4. NUNCA começar com "Olá" ou "Nesse vídeo..."

### Step 4: Escrita das Cenas
**Agent**: screenwriter

Para cada cena:
1. Escrever NARRAÇÃO em linguagem oral (como se falasse, não lesse)
2. Definir emoção dominante
3. Definir ritmo (rápido/normal/lento/pausa)
4. Sugerir duração
5. Escrever notas de direção (para o Creative Director)
6. Sugerir transição emocional para a próxima cena

### Step 5: Escrita do CTA
**Agent**: screenwriter

1. Reescrever o CTA do carrossel para linguagem oral
2. Definir emoção do CTA (urgência, curiosidade, pertencimento, exclusividade)
3. Texto de tela (curto, impactante)

### Step 6: Diretrizes Gerais
**Agent**: screenwriter

1. Definir mood geral do vídeo
2. Sugerir referência visual (se aplicável)
3. Sugerir mood de música
4. Definir intensidade de efeitos (minimal/moderado/intenso)

---

## Output

```
Gerar JSON completo no formato `Screenplay` (definido em screenwriter.md)
```

---

## Validação

- [ ] Hook tem no máximo 3 segundos
- [ ] Narração está em linguagem ORAL (não escrita)
- [ ] Cada cena tem emoção, ritmo e duração definidos
- [ ] Duração total está dentro do alvo
- [ ] CTA é claro e acionável
- [ ] Notas de direção são específicas (não genéricas)

---

## Modo Revision

Quando `mode: 'revision'`:
1. Receber feedback (do Editor ou do usuário)
2. Ajustar cenas específicas
3. Manter estrutura geral (não reescrever do zero)
4. Marcar o que mudou
