# 🚀 Quick Start - Sistema de Aprovação de Carrosséis

## TL;DR

Agora o expert pode **aprovar ou rejeitar carrosséis** antes de gerar os slides visuais. Só os aprovados viram imagens no Cloudinary.

## 🎯 Como Usar

### 1. Gerar Sugestões

1. Acesse: `/dashboard/audits/[id]/create-content`
2. Clique em **"Gerar Sugestões"**
3. Aguarde o Content Squad criar 3 carrosséis

### 2. Revisar e Aprovar

Para cada carrossel:
- ✅ **Clicar em "Aprovar"** se o conteúdo for bom
- ❌ **Clicar em "Rejeitar"** se não servir

**Visual:**
- Aprovado = Card verde + badge "✓ Aprovado"
- Rejeitado = Card vermelho opaco + badge "✗ Não Aprovado"

### 3. Gerar Slides Visuais

1. Botão mostra: **"Gerar Slides Visuais (X/Y aprovados)"**
2. Só fica habilitado se tiver pelo menos 1 aprovado
3. Clicar para gerar → **Só processa os aprovados**

## 📊 Exemplos

### Exemplo 1: Aprovar 2 de 3
```
Carrossel 1: Aprovado  ✓
Carrossel 2: Aprovado  ✓
Carrossel 3: Rejeitado ✗

Gerar Slides → 2 carrosséis × ~8 slides = ~16 imagens
```

### Exemplo 2: Aprovar Todos
```
Carrossel 1: Aprovado ✓
Carrossel 2: Aprovado ✓
Carrossel 3: Aprovado ✓

Gerar Slides → 3 carrosséis × ~8 slides = ~24 imagens
```

### Exemplo 3: Rejeitar Todos
```
Carrossel 1: Rejeitado ✗
Carrossel 2: Rejeitado ✗
Carrossel 3: Rejeitado ✗

Gerar Slides → Botão desabilitado + mensagem de erro
```

## 🎨 Interface

### Botões
- **Aprovar** (verde quando aprovado)
- **Rejeitar** (vermelho quando rejeitado)
- **Gerar Slides Visuais (X/Y aprovados)** (desabilitado se X = 0)

### Badges
- 🟢 **"✓ Aprovado"** (verde)
- 🔴 **"✗ Não Aprovado"** (vermelho)

### Cards
- Aprovado: border verde, background verde claro
- Rejeitado: border vermelho, opacidade 60%
- Pendente: border padrão

## 💡 Dicas

1. **Revisar Todos**: Sempre revise os 3 carrosséis antes de aprovar
2. **Ser Seletivo**: Não precisa aprovar todos - só os melhores
3. **Economizar**: Rejeitar economiza processamento e armazenamento
4. **Mudar de Ideia**: Pode aprovar e depois rejeitar (ou vice-versa)

## 🔧 APIs (para desenvolvedores)

### Aprovar Individual
```bash
curl -X PUT /api/content/[id]/approve \
  -d '{"carouselIndex": 0, "approved": true}'
```

### Aprovar Múltiplos
```bash
curl -X POST /api/content/[id]/approve \
  -d '{"approvals": [
    {"carouselIndex": 0, "approved": true},
    {"carouselIndex": 1, "approved": false},
    {"carouselIndex": 2, "approved": true}
  ]}'
```

### Gerar Slides (só aprovados)
```bash
curl -X POST /api/content/[id]/generate-slides \
  -d '{"carousels": [...], "profile": {...}}'
```

## 📚 Documentação Completa

- **Detalhes Técnicos**: `docs/SISTEMA-APROVACAO-CARROSSEIS.md`
- **Resumo Executivo**: `docs/RESUMO-APROVACAO-CARROSSEIS.md`

## ❓ FAQ

**P: O que acontece se eu não aprovar nenhum?**
R: O botão "Gerar Slides" fica desabilitado e mostra erro se tentar.

**P: Posso mudar de ideia depois de aprovar?**
R: Sim! Clique em "Rejeitar" para reverter (ou vice-versa).

**P: Quantos devo aprovar?**
R: Depende da qualidade. Pode ser 0, 1, 2 ou 3.

**P: E se eu gerar novas sugestões?**
R: Os carrosséis novos virão sem aprovação (estado pendente).

**P: As aprovações são salvas?**
R: Sim, no banco de dados (content_suggestions.content_json).

---

**Versão:** 1.0.0
**Data:** 2026-02-17
