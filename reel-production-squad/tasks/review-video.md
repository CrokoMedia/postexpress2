# Task: Review Video

**ID**: review-video
**Agent**: editor
**Elicit**: false
**Duration**: 5-10 min

---

## Descrição

Revisa o vídeo renderizado (V1) contra o spec técnico, roteiro e identidade visual. Produz aprovação ou lista de ajustes acionáveis.

---

## Input Obrigatório

```typescript
video: {
  url: string                     // URL do vídeo renderizado
  duration: number                // Duração em segundos
  format: 'feed' | 'story' | 'square'
}
reelSpec: ReelSpec                // Do Creative Director
screenplay: Screenplay            // Do Screenwriter
visualIdentity: VisualIdentity    // Do Art Director
```

---

## Workflow de Execução

### Step 1: Revisão do Hook (PRIORIDADE MÁXIMA)
**Agent**: editor

1. Os primeiros 3 segundos prendem a atenção?
2. Há pattern interrupt visual ou auditivo?
3. O texto do hook é legível?
4. A transição hook → cena 1 é suave?
5. Classificar: forte / ok / fraco / morto

**Se hook = morto → status = refazer (sem passar pelas outras etapas)**

### Step 2: Revisão de Timing & Ritmo
**Agent**: editor

Para cada cena:
1. Duração está adequada? (não longa demais >8s, não curta demais <2s)
2. O ritmo varia ao longo do vídeo?
3. As pausas dramáticas estão nos momentos certos?
4. A duração total é adequada para o conteúdo?

### Step 3: Revisão Visual
**Agent**: editor

1. Cores são consistentes ao longo do vídeo?
2. Texto tem contraste suficiente?
3. Imagens são relevantes?
4. Efeitos adicionam valor (não poluem)?
5. Transições combinam com o tom?

### Step 4: Revisão de Áudio
**Agent**: editor

1. Voiceover: claro? volume adequado?
2. Música: faz ducking? mood correto? volume ok?
3. SFX: nos momentos certos? não excessivos?
4. Captions: sincronizados? legíveis? estilo adequado?

### Step 5: Revisão de Narrativa
**Agent**: editor

1. O arco narrativo do roteiro está preservado?
2. A emoção de cada cena está representada?
3. O CTA é claro e no momento certo?
4. A mensagem é entendida SEM áudio (só captions/texto)?

### Step 6: Previsão de Performance
**Agent**: editor

1. Estimar retenção (alta/media/baixa)
2. Estimar completion rate
3. Avaliar replay value
4. Identificar pontos de drop (onde o viewer vai embora)

### Step 7: Veredicto Final
**Agent**: editor

| Score | Status | Ação |
|-------|--------|------|
| 90-100 | aprovado | Publicar |
| 75-89 | ajustes_menores | 1-3 ajustes rápidos |
| 50-74 | ajustes_maiores | Lista detalhada → Creative Director |
| 0-49 | refazer | Pode precisar de novo roteiro |

---

## Output

```
JSON completo no formato `EditReview` (definido em editor.md)
```

---

## Validação

- [ ] Todo feedback é ACIONÁVEL (não genérico)
- [ ] Ajustes têm prioridade (crítico > importante > nice_to_have)
- [ ] Score é justificado com exemplos específicos
- [ ] Pontos de drop identificados com timestamp
- [ ] Se ajustes necessários: destino = creative-director

---

## Loop de Revisão

```
V1 → Editor revisa → ajustes → Creative Director ajusta → V2 → Editor revisa
```

**Regra: máximo 3 loops.** Se após 3 loops o score ainda é < 75:
- Escalar para o usuário com relatório completo
- Sugerir mudança de abordagem (novo roteiro ou novo visual)
