# 🎨 Figma Stories Creator - Guia Completo

Scripts automatizados para criar Stories "Inveja e Prosperidade" no Figma.

---

## 📦 O QUE FOI CRIADO

### 1. `create-figma-stories.js` (Node.js)
Script que usa Figma REST API para automatizar criação.

**Recursos**:
- ✅ Gera estrutura JSON completa dos 7 stories
- ✅ Define cores, tipografia, gradientes
- ✅ Posiciona elementos pixel-perfect
- ✅ Exporta para PNG (2x)

**Limitação**: API do Figma não permite criar arquivos novos com nós diretamente.

---

### 2. `figma-plugin.js` (Figma Plugin)
Plugin Figma que cria os 7 stories diretamente no Figma Desktop.

**Recursos**:
- ✅ Cria 7 frames automaticamente
- ✅ Aplica gradientes e cores
- ✅ Adiciona todos os textos
- ✅ Posiciona perfeitamente
- ✅ Roda diretamente no Figma

**⭐ RECOMENDADO** - Melhor opção!

---

### 3. `package.json`
Configuração do projeto Node.js.

---

### 4. `README-FIGMA.md`
Este guia.

---

## 🚀 COMO USAR

### OPÇÃO 1: Figma Plugin (⭐ Recomendado)

**Passo 1**: Abrir Figma Desktop
- Baixar: https://www.figma.com/downloads/

**Passo 2**: Criar Plugin de Desenvolvimento
1. Abrir Figma Desktop
2. Menu → **Plugins** → **Development** → **New Plugin...**
3. Escolher "Empty" template
4. Nomear: "Stories Creator"

**Passo 3**: Colar código do Plugin
1. Abrir arquivo: `figma-plugin.js`
2. Copiar TODO o conteúdo
3. Colar no editor do plugin
4. Salvar (Ctrl/Cmd + S)

**Passo 4**: Rodar o Plugin
1. Menu → **Plugins** → **Development** → **Stories Creator**
2. Aguardar ~10-30 segundos
3. ✅ 7 Stories criados automaticamente!

**Resultado**:
```
Story 01 - Hook
Story 02 - Normalização
Story 03 - Problema
Story 04 - Reframe ⭐ (momento chave)
Story 05 - Método
Story 06 - Exemplo
Story 07 - CTA
```

---

### OPÇÃO 2: Script Node.js (API)

**Passo 1**: Instalar dependências
```bash
cd content-creation-squad/scripts
npm install
```

**Passo 2**: Obter Token do Figma
1. Acessar: https://www.figma.com/settings
2. Ir em **Personal Access Tokens**
3. Clicar em **Generate new token**
4. Nomear: "Stories Creator"
5. Copiar o token gerado

**Passo 3**: Configurar Token
```bash
# Opção 1: Variável de ambiente
export FIGMA_TOKEN="seu_token_aqui"

# Opção 2: Editar arquivo create-figma-stories.js
# Linha 22: FIGMA_TOKEN: 'seu_token_aqui',
```

**Passo 4**: Rodar Script
```bash
npm run create
```

**Resultado**:
- ✅ Estrutura JSON salva em `../output/figma-stories-structure.json`
- ⚠️  Precisa usar plugin ou criar manualmente no Figma

---

## 📊 COMPARAÇÃO DE OPÇÕES

| Aspecto | Plugin Figma | Script Node.js | Manual |
|---------|--------------|----------------|--------|
| **Complexidade** | Baixa | Média | Alta |
| **Tempo** | ~30s | ~1min | ~30min |
| **Automação** | 100% | 80% | 0% |
| **Precisão** | Perfeita | Perfeita | Depende |
| **Token necessário** | ❌ Não | ✅ Sim | ❌ Não |
| **Internet** | ❌ Não | ✅ Sim | ❌ Não |

**Vencedor**: 🏆 **Plugin Figma**

---

## 🎨 ESPECIFICAÇÕES TÉCNICAS

### Dimensões
- **Formato**: 1080 x 1920px (9:16)
- **Espaçamento**: 100px entre frames
- **Safe Zone**: 250px top/bottom

### Cores
```javascript
Primárias:
  • #2C3E50 - Azul Escuro
  • #34495E - Azul Médio

Prosperidade:
  • #27AE60 - Verde
  • #2ECC71 - Verde Claro

Alertas:
  • #E74C3C - Vermelho Inveja

Acentos:
  • #FFD23F - Dourado
  • #3498DB - Azul Destaque

Base:
  • #1A1A1A - Preto
  • #FFFFFF - Branco
```

### Tipografia
```javascript
Display:
  • Montserrat Black - 96pt, 72pt, 56pt

Títulos:
  • Montserrat Bold - 52pt, 48pt
  • Montserrat Medium - 38pt

Corpo:
  • Montserrat Medium - 36pt
  • Open Sans Regular - 32pt, 28pt, 24pt

Acentos:
  • Bebas Neue - 96pt, 64pt, 40pt
```

### Gradientes
```javascript
Escuro: #1A1A1A → #2C3E50
Transição: #34495E → #27AE60
Prosperidade: #27AE60 → #2ECC71
```

---

## 📱 EXPORTAR PARA INSTAGRAM

### Opção 1: Export Manual
1. Selecionar todos os 7 frames
2. Clicar direito → **Export**
3. Configurar:
   - Format: **PNG**
   - Scale: **2x**
4. Exportar

### Opção 2: Export via Plugin
1. Instalar plugin "**Story for Instagram**"
2. Selecionar frames
3. Export direto otimizado

### Opção 3: Export Programático (via script)
```bash
# Configurar FILE_KEY no script
export FIGMA_FILE_KEY="arquivo-key-aqui"

# Rodar script com export
npm run create
```

**Output**: URLs das imagens exportadas

---

## 🔧 TROUBLESHOOTING

### Plugin não roda
- Verificar se está usando Figma Desktop (não web)
- Verificar se salvou o código corretamente
- Tentar fechar e reabrir Figma

### Fontes não aparecem
```javascript
// Carregar fontes necessárias:
await figma.loadFontAsync({ family: "Montserrat", style: "Black" });
await figma.loadFontAsync({ family: "Montserrat", style: "Bold" });
await figma.loadFontAsync({ family: "Montserrat", style: "Medium" });
await figma.loadFontAsync({ family: "Montserrat", style: "Regular" });
await figma.loadFontAsync({ family: "Open Sans", style: "Regular" });
await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" });
```

Se não tiver as fontes:
1. Baixar do Google Fonts
2. Instalar no sistema
3. Reiniciar Figma

### Script Node.js dá erro
```bash
# Reinstalar dependências
npm install

# Verificar versão Node.js (mínimo 14)
node --version

# Verificar token
echo $FIGMA_TOKEN
```

---

## 📚 RECURSOS ADICIONAIS

### Documentação Figma
- **Plugin API**: https://www.figma.com/plugin-docs/
- **REST API**: https://www.figma.com/developers/api
- **Community**: https://forum.figma.com/

### Tutoriais
- **Creating Figma Plugins**: YouTube
- **Figma API Guide**: Figma Learn

### Ferramentas Complementares
- **Figma Mirror** (app mobile) - Preview em tempo real
- **Figmotion** - Adicionar animações
- **Story for Instagram** - Export otimizado

---

## ✅ CHECKLIST DE USO

**Antes de rodar**:
- [ ] Figma Desktop instalado
- [ ] Fontes instaladas (Montserrat, Open Sans, Bebas Neue)
- [ ] Código do plugin copiado
- [ ] Plugin salvo

**Após rodar**:
- [ ] 7 frames criados
- [ ] Cores aplicadas corretamente
- [ ] Textos posicionados
- [ ] Gradientes funcionando
- [ ] Export realizado

**Antes de postar no Instagram**:
- [ ] Revisar cada story
- [ ] Ajustar se necessário
- [ ] Adicionar stickers interativos
- [ ] Testar em mobile
- [ ] Postar nos horários ideais (7-9am, 12-1pm, 7-9pm BRT)

---

## 🎯 PRÓXIMOS PASSOS

1. **Rodar o Plugin Figma** (opção recomendada)
2. **Revisar os 7 stories criados**
3. **Exportar como PNG 2x**
4. **Transferir para celular**
5. **Postar no Instagram Stories** com stickers:
   - Story 1: Caixa de pergunta
   - Story 2: Emoji slider
   - Story 7: Enquete
6. **Acompanhar métricas**

---

## 🆘 SUPORTE

**Dúvidas sobre Figma Plugin**:
- Documentação: figma.com/plugin-docs
- Forum: forum.figma.com

**Dúvidas sobre o projeto**:
- Ver: `FIGMA-GUIDE-inveja-prosperidade.md` (guia manual completo)
- Ver: `stories-inveja-prosperidade.md` (copy completo)

---

**Criado pelo Content Creation Squad**
*5 Mentes Milionárias: Eugene Schwartz (Copy) + Adriano De Marqui (Design) + Seth Godin (Estratégia) + Alex Hormozi (Urgência) + Thiago Finch (BR)*

🎨 Bom design! 🚀
