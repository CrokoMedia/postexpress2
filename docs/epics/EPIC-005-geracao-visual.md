# EPIC 005: Geração Visual (Cloudinary)

**Status**: ⏳ Pendente
**Prioridade**: 🟡 Média
**Duração Estimada**: 1 semana (Semana 5)
**Agente Responsável**: @ux-design-expert + @dev

---

## 🎯 OBJETIVO
Criar templates visuais tweet-style e integração Cloudinary para geração automática de imagens.

---

## 📊 CONTEXTO
**Dependências**: EPIC-004 (copy dos carrosséis gerado)
**Bloqueia**: EPIC-007 (integração end-to-end)

---

## 📋 TAREFAS

### Task 5.1: Template HTML/CSS (@ux-design-expert)
**Duração**: 2 dias

Criar template tweet-style conforme PRD:
- Fundo branco
- Foto circular (canto superior esquerdo)
- Nome + verificado
- Username
- Texto centralizado ou com imagem

**Entregáveis**:
- [ ] `src/templates/tweet-style/base.html`
- [ ] `src/templates/tweet-style/styles.css`
- [ ] Variações: só texto / texto + imagem
- [ ] Preview local (teste manual)

---

### Task 5.2: Integração Cloudinary (@dev)
**Duração**: 2 dias

```javascript
// src/visual/cloudinary-renderer.js
async function renderSlide(slideData) {
  // 1. Preencher template HTML com dados
  // 2. Upload para Cloudinary
  // 3. Render HTML → PNG (1080x1080)
  // 4. Otimizar imagem
  // 5. Retornar URL
}
```

**Entregáveis**:
- [ ] `src/visual/cloudinary-renderer.js`
- [ ] Testes: gerar 10 slides
- [ ] Performance < 5s/slide

---

## 🚦 GATE DE QUALIDADE

- [ ] Imagens geradas corretamente
- [ ] Visual aprovado (@ux-design)
- [ ] Performance < 5s por slide
- [ ] URLs armazenadas no Supabase

---

## 🎯 PRÓXIMO PASSO
→ **EPIC-006: Portal do Cliente**

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
