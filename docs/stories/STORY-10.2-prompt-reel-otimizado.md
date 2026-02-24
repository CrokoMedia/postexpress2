# Story 10.2: Prompt Otimizado para Reels

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P0 (Critical)
**Estimate:** 0.5 dia
**Owner:** @dev
**Wave:** 1 - Core Quality
**Depende de:** Nenhuma (prompt only)

---

## Descrição

O prompt atual do Content Squad gera carrosséis otimizados para **leitura** (texto longo, explicativo). Reels de valor precisam de texto otimizado para **ouvir + ver**: frases curtas, hooks fortes, padrões de interrupção, e CTAs orais. Também melhorar os `imagePrompt` para gerar imagens mais contextuais e impactantes.

---

## Acceptance Criteria

- [ ] System prompt do Content Squad atualizado com instruções para formato reel
- [ ] Texto por slide limitado a 10-20 palavras (voz narra, não precisa ler)
- [ ] Hook obrigatório no slide 1 (pergunta provocativa ou dado chocante)
- [ ] Padrão de interrupção a cada 2-3 slides (pergunta, "espera...", dado)
- [ ] CTA oral no último slide ("Salva esse reel", "Comenta aqui")
- [ ] `imagePrompt` mais descritivo e contextual por slide
- [ ] Modo "Reel" vs "Carrossel" na geração de conteúdo
- [ ] Backward compatible (modo carrossel atual preservado)

---

## Tarefas Técnicas

### 1. Criar Prompt Específico para Reels
- [ ] Adicionar bloco de instruções "MODO REEL" ao system prompt
- [ ] Regras:
  ```
  MODO REEL (quando o creator pedir reel/vídeo):

  SLIDE 1 (HOOK - obrigatório):
  - Pergunta provocativa OU dado chocante OU afirmação contraintuitiva
  - Máximo 8-10 palavras no título
  - Sem corpo (o hook é só o título)
  - imagePrompt: close-up dramático, emoção forte

  SLIDES 2-6 (CONTEÚDO):
  - Título: 10-15 palavras máximo (frase curta e impactante)
  - Corpo: 1-2 frases CURTAS (máx 20 palavras total)
  - A cada 2 slides, inserir "padrão de interrupção":
    - Pergunta retórica ("Você sabia que...?")
    - Dado chocante ("87% dos creators cometem esse erro")
    - Chamada direta ("Presta atenção nisso")
  - imagePrompt: cena que ilustra o conceito, estilo cinematográfico

  SLIDE FINAL (CTA):
  - Título: CTA direto ("Salva esse reel pra não esquecer")
  - Corpo: ação específica ("Comenta 'EU QUERO' que te mando o checklist")
  - imagePrompt: visual positivo, energia de conclusão

  REGRAS GERAIS PARA REEL:
  - Texto é OUVIDO, não lido — escreva como se fosse fala natural
  - Use contrações e linguagem coloquial (pt-BR falado)
  - Evite jargão técnico — explique como se fosse para um amigo
  - Cada slide deve ter UM conceito apenas
  - Palavras de poder: "segredo", "erro fatal", "nunca", "sempre", "exatamente"
  ```

### 2. Melhorar imagePrompt
- [ ] Adicionar contexto do nicho ao prompt de imagem
- [ ] Instruir para cenários específicos por tipo de conteúdo:
  - Educacional: escritório, quadro branco, notebook
  - Motivacional: paisagem, sunrise, conquista
  - Vendas: produto, resultado, antes/depois
  - Storytelling: pessoas, emoção, jornada
- [ ] Estilo visual consistente: "cinematic, shallow depth of field, warm tones"

### 3. Adicionar Modo Reel vs Carrossel
- [ ] Modificar `app/api/profiles/[id]/chat/route.ts`
- [ ] Aceitar parâmetro `contentMode: 'carousel' | 'reel'`
- [ ] Se `reel`: aplicar instruções de MODO REEL
- [ ] Se `carousel`: manter prompt atual (backward compatible)
- [ ] Default: `carousel` (comportamento atual preservado)

### 4. UI — Toggle de Modo
- [ ] Adicionar toggle "Modo Reel" no chat do Content Squad
- [ ] Quando ativado, instruir o Claude a gerar conteúdo para formato reel
- [ ] Visual: ícone de vídeo vs ícone de carrossel

---

## Arquivos

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `app/api/profiles/[id]/chat/route.ts` | Prompt MODO REEL + contentMode param |
| `app/dashboard/profiles/[id]/page.tsx` | Toggle modo reel no chat |
| `components/organisms/content-squad-chat-modal.tsx` | Passar contentMode |

---

## Definition of Done

- [ ] Prompt MODO REEL implementado e funcional
- [ ] Texto gerado é curto e otimizado para vídeo
- [ ] Hook no slide 1, padrão de interrupção, CTA no final
- [ ] imagePrompt mais contextual e descritivo
- [ ] Modo Carrossel preservado (zero regressão)
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
