# 🎨 Post Express - Design System & Figma Integration

> Templates profissionais de carrosséis sincronizados via Figma MCP

---

## 📁 Arquivos nesta Pasta

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **FIGMA-CAROUSEL-TEMPLATE-SPEC.md** | Especificação técnica completa dos templates (cores, tipografia, componentes, variantes) | Ao criar o arquivo Figma do zero |
| **FIGMA-VISUAL-EXAMPLES.md** | Mockups ASCII de todos os tipos de slides para referência visual | Para entender layouts sem abrir o Figma |
| **FIGMA-MCP-SETUP-GUIDE.md** | Guia passo a passo de configuração do Figma MCP + Code Connect | Setup inicial (1x) e troubleshooting |
| **carousel-slide-example.tsx** | Exemplo de componente React gerado via MCP (referência de código) | Para entender estrutura do código resultante |

---

## 🚀 Quick Start

### Para Implementar pela Primeira Vez

**Tempo total:** ~90 minutos

```bash
# 1. Configurar Figma MCP (15 min)
# Siga: FIGMA-MCP-SETUP-GUIDE.md → Passo 1 e 2

# 2. Criar arquivo Figma (30 min)
# Siga: FIGMA-CAROUSEL-TEMPLATE-SPEC.md
# Consulte: FIGMA-VISUAL-EXAMPLES.md para layouts

# 3. Configurar Code Connect (15 min)
# Siga: FIGMA-MCP-SETUP-GUIDE.md → Passo 4

# 4. Testar integração (10 min)
# Siga: FIGMA-MCP-SETUP-GUIDE.md → Passo 5
```

### Para Usar no Dia a Dia

```bash
# Designer atualiza template no Figma → salva

# Você no Claude Code:
claude
> "Sincroniza template de carrossel do Figma [file-id]"

# Claude extrai via MCP → gera componente React → você revisa → commit
```

---

## 🎯 O Que Este Sistema Resolve

### ❌ Problema Atual

```
Designer cria mockup → envia PNG → dev recria manualmente em CSS
↓
Pequeno ajuste de cor → designer edita PNG → reenvia → dev ajusta CSS
↓
Ciclo lento, sujeito a erros, difícil de manter sincronizado
```

### ✅ Solução com Figma MCP

```
Designer cria componente Figma → vincula com Code Connect
↓
Claude Code lê via MCP → gera React + Tailwind automaticamente
↓
Ajuste de cor → designer edita Figma → Claude regenera código
↓
Sempre sincronizado, rápido, zero erros de tradução visual→código
```

---

## 🧩 Componentes Disponíveis

Depois de implementar os templates, você terá:

### 1. SlideBase (componente genérico)
```tsx
<CarouselSlide type="cover" variant="default" slideNumber="1/10">
  {/* Conteúdo personalizado */}
</CarouselSlide>
```

### 2. SlideCover (abertura)
```tsx
<SlideCover
  kicker="AUDITORIA PROFISSIONAL"
  title="Como Transformar Seu Instagram"
  subtitle="Análise científica baseada em 5 frameworks"
/>
```

### 3. SlideContent (lista/comparação/quote)
```tsx
<SlideContent
  sectionTitle="3 Gatilhos de Atenção"
  items={[
    { title: 'Padrão Interrompido', description: '...' },
    { title: 'Curiosity Gap', description: '...' },
  ]}
/>
```

### 4. SlideStats (métricas)
```tsx
<SlideStats
  stats={[
    { value: '347%', label: 'Aumento em Alcance' },
    { value: '2.8k', label: 'Novos Seguidores' },
  ]}
/>
```

### 5. SlideCTA (chamada para ação)
```tsx
<SlideCTA
  headline="Pronto para Transformar Seu Conteúdo?"
  buttonText="Começar Agora"
  subtext="Teste grátis por 7 dias"
/>
```

**Consulte:** `carousel-slide-example.tsx` para código completo.

---

## 🎨 Design Tokens

### Cores (sincronizadas do Figma)

```css
--color-primary-500: #8B5CF6    /* Purple principal */
--color-neutral-900: #18181B    /* Texto */
--color-success:     #10B981    /* Métricas positivas */
```

### Tipografia

```css
--text-4xl: 36px / bold         /* Hero titles */
--text-2xl: 24px / semibold     /* Section titles */
--text-base: 16px / regular     /* Corpo */
```

### Espaçamento (grid 8px)

```css
--spacing-1:  8px
--spacing-2:  16px
--spacing-4:  32px
--spacing-10: 80px (safe area)
```

**Consulte:** `FIGMA-CAROUSEL-TEMPLATE-SPEC.md` para lista completa.

---

## 🔄 Workflow Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. Designer cria/atualiza template no Figma            │
│    - Ajusta cores, tipografia, layout                   │
│    - Salva (Cmd+S)                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Claude Code detecta mudança via Figma MCP           │
│    - get_design_context (estrutura)                     │
│    - get_variable_defs (tokens)                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Claude gera componente React + Tailwind             │
│    - Props tipadas (TypeScript)                          │
│    - Classes utilitárias                                 │
│    - Code Connect mapping                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Dev revisa e aprova                                  │
│    - Verifica diff                                       │
│    - Testa localmente                                    │
│    - Commit: "feat: update carousel template v1.2"      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Pipeline renderiza slides                            │
│    - Next.js renderiza componente                        │
│    - Puppeteer captura screenshot (1080x1080)           │
│    - Upload para Cloudinary                              │
│    - Cliente baixa carrossel                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)
- [Figma Code Connect](https://help.figma.com/hc/en-us/articles/32132100833559)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### Inspiração de Design
- [Instagram Best Practices](https://business.instagram.com/)
- [Carousel Design (Dribbble)](https://dribbble.com/tags/instagram-carousel)
- [Canva Templates](https://www.canva.com/templates/)

### Ferramentas Úteis
- **Contrast** (plugin Figma) - validar acessibilidade
- **Figma Tokens** (plugin) - gerenciar design tokens
- **Content Reel** (plugin) - popular com dados reais

---

## 🛠️ Troubleshooting

### "Figma MCP connection failed"
→ Verificar token em `~/.claude/settings.json`
→ Consultar: `FIGMA-MCP-SETUP-GUIDE.md` → Troubleshooting

### "Code Connect mapping failed"
→ Verificar path do componente React
→ Verificar props no Dev Mode do Figma

### "Design não sincroniza"
→ Verificar File ID e Node ID corretos
→ Testar `get_design_context` manualmente no Claude Code

**Consulte:** `FIGMA-MCP-SETUP-GUIDE.md` → Seção Troubleshooting completa

---

## ✅ Checklist de Implementação

### Setup Inicial (1x)
- [ ] Token Figma criado e salvo
- [ ] `~/.claude/settings.json` configurado
- [ ] Arquivo Figma criado com estrutura correta
- [ ] Design Tokens definidos (cores, tipografia, spacing)
- [ ] Componente SlideBase criado com 4 variantes
- [ ] Code Connect configurado e vinculado
- [ ] Componente React base criado
- [ ] Testes de integração passando

### Desenvolvimento Contínuo
- [ ] Designer atualiza template → notifica no Slack
- [ ] Dev sincroniza via Claude Code
- [ ] Revisa diff do componente gerado
- [ ] Testa localmente (Storybook ou página de preview)
- [ ] Commit com mensagem descritiva
- [ ] Deploy → próximas auditorias usam template novo

---

## 📊 Métricas de Sucesso

Depois de implementar este sistema, você deve observar:

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Tempo de atualização de template | 2-4 horas | 15-30 min | **80% mais rápido** |
| Erros de tradução design→código | 3-5 por ciclo | 0 (automático) | **100% menos erros** |
| Sincronia entre Figma e código | Manual (sempre desatualizado) | Automática (sempre atualizado) | **Sincronização perfeita** |
| Variações de layout | 1-2 (difícil criar mais) | 4+ (fácil adicionar) | **Mais flexibilidade** |

---

## 🔮 Próximos Passos

### Curto Prazo (1-2 semanas)
1. Implementar setup completo do Figma MCP
2. Criar arquivo Figma com 4 variantes básicas
3. Testar geração de 1 carrossel completo (10 slides)

### Médio Prazo (1 mês)
1. Adicionar mais variantes (Testimonial, Comparison, Timeline)
2. Automatizar sync com GitHub Actions (toda segunda-feira 10h)
3. Criar Storybook para preview de todas as variantes

### Longo Prazo (3 meses)
1. Design System completo (não só carrosséis)
2. Templates para Stories, Reels, posts estáticos
3. Integração com sistema de temas (clientes custom)

---

## 💬 Dúvidas?

**Para questões de setup:**
Consultar: `FIGMA-MCP-SETUP-GUIDE.md`

**Para questões de design:**
Consultar: `FIGMA-CAROUSEL-TEMPLATE-SPEC.md`

**Para questões de código:**
Consultar: `carousel-slide-example.tsx`

**Suporte direto:**
- Claude Code Discord: discord.gg/claude
- Figma Community: forum.figma.com

---

**Versão:** 1.0
**Última atualização:** 2026-02-20
**Autor:** Pazos Media
**Licença:** Uso interno Post Express
