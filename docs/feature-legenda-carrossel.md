# Feature: Exibição e Download de Legenda dos Carrosséis

## 📋 Resumo
Implementação de funcionalidade para exibir legendas dos carrosséis logo abaixo dos slides gerados e permitir download em formato TXT.

## ✨ Funcionalidades Implementadas

### 1. **API de Exportação de Legenda**
- **Arquivo:** `/app/api/content/[id]/carousels/[carouselIndex]/export-caption/route.ts`
- **Método:** GET
- **Retorna:** Arquivo TXT formatado com:
  - Título do carrossel
  - Caption completa
  - Hashtags
  - Call to Action
  - Data de geração

### 2. **Exibição de Legenda na Fase 3 (Exportar)**
- **Arquivo:** `/app/dashboard/audits/[id]/create-content/components/phase-3-exportar.tsx`
- **Localização:** Logo abaixo da galeria de slides de cada carrossel
- **Componentes adicionados:**
  - Seção de legenda com fundo destacado
  - Botão "Copiar" - copia caption + hashtags + CTA
  - Botão "Baixar TXT" - baixa arquivo formatado
  - Feedback visual (checkmark ao copiar, loading ao baixar)

### 3. **Exibição de Legenda na Galeria de Slides**
- **Arquivo:** `/app/dashboard/audits/[id]/slides/page.tsx`
- **Localização:** Abaixo da grid de slides em cada carrossel
- **Mesmas funcionalidades da Fase 3**

## 🎨 Interface

### Seção de Legenda
```
┌─────────────────────────────────────────────────┐
│ 📄 Legenda do Carrossel     [Copiar] [Baixar TXT]│
├─────────────────────────────────────────────────┤
│                                                 │
│ CAPTION:                                        │
│ [Texto da caption do carrossel]                 │
│                                                 │
│ HASHTAGS:                                       │
│ #tag1 #tag2 #tag3                              │
│                                                 │
│ CALL TO ACTION:                                 │
│ [Texto do CTA]                                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Botões
1. **Copiar**
   - Copia: caption + hashtags + CTA
   - Feedback: ícone muda para ✓ "Copiado!" (2s)

2. **Baixar TXT**
   - Baixa arquivo: `legenda-[titulo-do-carrossel].txt`
   - Formato limpo e profissional
   - Loading state: "Baixando..."

## 📁 Formato do Arquivo TXT

```
═══════════════════════════════════════════════
TÍTULO DO CARROSSEL
═══════════════════════════════════════════════

📝 CAPTION:

[Texto da caption]

🏷️ HASHTAGS:

#tag1 #tag2 #tag3

🎯 CALL TO ACTION:

[Texto do CTA]

═══════════════════════════════════════════════
Gerado por Croko Labs | 24/02/2026
═══════════════════════════════════════════════
```

## 🔧 Arquivos Modificados

1. **Nova API Route:**
   - `/app/api/content/[id]/carousels/[carouselIndex]/export-caption/route.ts`

2. **Componentes Atualizados:**
   - `/app/dashboard/audits/[id]/create-content/components/phase-3-exportar.tsx`
   - `/app/dashboard/audits/[id]/slides/page.tsx`

## 💡 Como Usar

### Para o Usuário:

1. **Fase 3 - Exportar:**
   - Gere os slides dos carrosséis aprovados
   - Vá até a Fase 3 (Exportar)
   - Abaixo de cada galeria de slides, verá a legenda completa
   - Use "Copiar" para colar no Instagram/LinkedIn
   - Use "Baixar TXT" para salvar localmente

2. **Galeria de Slides:**
   - Acesse "Ver Galeria Completa"
   - Cada carrossel mostra sua legenda abaixo dos slides
   - Mesmas opções de copiar e baixar

## ✅ Benefícios

1. **Acesso Fácil:** Legenda sempre visível junto com os slides
2. **Copiar Rápido:** Um clique para copiar caption + hashtags + CTA
3. **Backup:** Arquivo TXT profissional para guardar legendas
4. **UX Melhorada:** Não precisa voltar para a página de criação
5. **Pronto para Publicar:** Formato ideal para colar direto nas redes

## 🐛 Tratamento de Erros

- Se carrossel não existir: retorna 404
- Se falhar ao gerar TXT: mostra erro na UI
- Se falhar ao copiar: clipboard API tem fallback
- Todos os erros são logados no console

## 🚀 Próximos Passos Sugeridos

- [ ] Adicionar preview da legenda ao lado dos slides (modal)
- [ ] Permitir edição inline da legenda antes de baixar
- [ ] Exportar múltiplas legendas de uma vez (ZIP de TXTs)
- [ ] Contador de caracteres da caption (limite Instagram: 2.200)
- [ ] Sugestão de melhores horários para publicar

---

**Status:** ✅ Implementado e pronto para uso
**Data:** 2026-02-24
**Versão:** 1.0
