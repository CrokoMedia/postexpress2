# Task: Direct Scenes

**ID**: direct-scenes
**Agent**: creative-director
**Elicit**: false
**Duration**: 5-10 min

---

## Descrição

Combina o roteiro do Screenwriter + identidade visual do Art Director para produzir o spec técnico JSON cena-a-cena, compatível com o pipeline Remotion.

---

## Input Obrigatório

```typescript
// Do Screenwriter
screenplay: Screenplay

// Do Art Director
visualIdentity: VisualIdentity

// Do sistema
profile: { username, fullName, profilePicUrl }
```

---

## Workflow de Execução

### Step 1: Assimilar Inputs
**Agent**: creative-director

1. Ler o roteiro completo (arco narrativo, emoções, ritmo)
2. Ler a identidade visual (template, paleta, estilo de imagem)
3. Verificar compatibilidade (mood do roteiro vs visual)
4. Se conflito → resolver com prioridade para a NARRATIVA

### Step 2: Configurações Globais
**Agent**: creative-director

Definir configurações que se aplicam a TODAS as cenas:

1. **Formato**: feed/story/square (do Art Director)
2. **Template**: do Art Director
3. **Áudio**:
   - Voiceover: sim/não (sempre sim se há narração)
   - Voice: escolher com base no tom do roteiro
   - TTS Provider: openai (padrão) ou elevenlabs
   - Background Music: mood do roteiro
   - Sound Effects: sim/não (baseado em intensidade_efeitos)
4. **Visual global**:
   - Hook: habilitado? texto? estilo?
   - Caption style: do Art Director
   - Background animado: do Art Director
   - Efeitos globais: particles, parallax, animated metrics

### Step 3: Spec Cena-a-Cena
**Agent**: creative-director

Para cada cena do roteiro, consultar `data/remotion-catalog.md` e definir:

1. **Conteúdo**:
   - `titulo`: texto visual principal (do roteiro `texto_tela` ou adaptado)
   - `corpo`: texto de suporte (pode omitir se o visual é suficiente)
   - `narracao`: texto para TTS (do roteiro)

2. **Text Effect**: escolher baseado na emoção da cena
   - Hook → `bounce` ou `split-reveal`
   - Informação → `typewriter`
   - Revelação → `cinematic` ou `gradient`
   - CTA → `marker` ou `gradient`

3. **Imagem**: gerar prompt para fal.ai
   - Usar `prefixoPrompt` + contexto da cena + `sufixoPrompt` do Art Director
   - Ser específico: composição, mood, estilo
   - NUNCA pedir texto na imagem

4. **B-Roll**: se aplicável
   - `brollQuery`: query para Pexels
   - Usar quando o conteúdo é visual/emocional (não para dados/métricas)

5. **Transição**: escolher com base no ritmo
   - Rápido → `glitch`, `pixel`, `zoom-blur`
   - Normal → `slide`, `fade`
   - Lento → `fade`, `liquid`
   - REGRA: nunca repetir 3× seguidas

6. **Efeitos especiais**:
   - `particleBurst`: em CTAs, revelações
   - `zoomPulse`: em métricas/números
   - `glowHighlight`: em elementos-chave

7. **SFX**:
   - `whoosh`: na entrada de cenas com transição forte
   - `pop`: em métricas/destaques
   - `swoosh`: em entradas de texto

8. **Música**:
   - `musicaDucking`: sim quando narração densa
   - `musicaIntensidade`: sobe no clímax, baixa na narração

### Step 4: Validação de Coerência
**Agent**: creative-director

1. Verificar variação de transições (não repetitivas)
2. Verificar variação de text effects (não monótono)
3. Verificar hierarquia de efeitos (hook forte → dev moderado → clímax forte → CTA âncora)
4. Verificar sincronia áudio-visual
5. Verificar duração total estimada vs target

### Step 5: Gerar ReelSpec JSON
**Agent**: creative-director

Produzir o JSON final no formato `ReelSpec` (definido em creative-director.md).

---

## Output

```
JSON completo no formato `ReelSpec`, pronto para alimentar o pipeline Remotion.
Compatível com CarouselReelProps em remotion/types.ts.
```

---

## Validação

- [ ] Todas as cenas têm titulo, narracao e imagemPrompt
- [ ] Transições variam (nenhuma repetida 3× seguidas)
- [ ] Text effects variam
- [ ] Hook tem efeitos fortes
- [ ] CTA tem efeitos de âncora (particles/glow)
- [ ] Prompts de imagem são específicos (não genéricos)
- [ ] Configurações de áudio são coerentes com o roteiro
- [ ] Duração estimada está dentro do target

---

## Modo Adjustment

Quando `mode: 'adjustment'` (feedback do Editor):

1. Receber lista de ajustes do Editor (`EditReview.ajustes_necessarios`)
2. Ajustar APENAS as cenas indicadas
3. Manter configurações globais (a menos que feedback diga o contrário)
4. Re-validar coerência após ajustes
5. Retornar ReelSpec atualizado
