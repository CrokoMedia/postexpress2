# 🎨 Integração Figma - Post Express

## ✅ Status da Integração

**INTEGRADO E FUNCIONANDO** ✨

- ✅ Token do Figma configurado
- ✅ API REST autenticada
- ✅ Scripts automatizados prontos
- ✅ Plugin Figma gerado automaticamente
- ✅ Preview HTML dos Stories
- ✅ Estrutura JSON completa

---

## 🚀 Como Usar

### Método 1: Geração Automática (Recomendado)

```bash
cd content-creation-squad/scripts
npm run auto
```

**O que faz:**
1. ✅ Valida token do Figma
2. ✅ Gera código do plugin pronto para usar
3. ✅ Cria estrutura JSON dos 7 Stories
4. ✅ Gera preview HTML navegável
5. ✅ Abre automaticamente no navegador

**Arquivos gerados:**
- `output/figma-plugin-ready.js` - Plugin pronto para colar no Figma
- `output/stories-structure.json` - Estrutura completa dos Stories
- `output/preview-stories.html` - Preview visual no navegador

---

### Método 2: Criar no Figma Desktop

**Passo 1:** Gerar plugin
```bash
cd content-creation-squad/scripts
npm run auto
```

**Passo 2:** Abrir Figma Desktop
- Download: https://www.figma.com/downloads/

**Passo 3:** Criar plugin de desenvolvimento
1. Figma Desktop → Menu → **Plugins**
2. **Development** → **New Plugin...**
3. Escolher template **"Empty"**
4. Nomear: "Stories Creator"

**Passo 4:** Colar código do plugin
1. Abrir arquivo: `content-creation-squad/output/figma-plugin-ready.js`
2. **Copiar TODO o conteúdo** (Cmd+A, Cmd+C)
3. **Colar** no editor do plugin
4. **Salvar** (Cmd+S)

**Passo 5:** Executar
1. Menu → **Plugins** → **Development** → **Stories Creator**
2. Aguardar ~30 segundos
3. ✅ **7 Stories criados automaticamente!**

---

## 📊 O que é Criado

### 7 Stories Completos:

| # | Título | Tema | Background |
|---|--------|------|------------|
| 01 | INVEJA E PROSPERIDADE | Hook | Gradiente Escuro |
| 02 | ELES NORMALIZAM | Problema | Gradiente Escuro |
| 03 | O PROBLEMA | Dor | Gradiente Escuro |
| 04 | REFRAME ⭐ | Solução | Gradiente Transição |
| 05 | O MÉTODO | Como fazer | Gradiente Prosperidade |
| 06 | EXEMPLO | Prova | Gradiente Prosperidade |
| 07 | COMECE HOJE | CTA | Gradiente Prosperidade |

**Especificações:**
- Dimensões: **1080 x 1920px** (formato Stories Instagram)
- Espaçamento: 100px entre frames
- Fontes: Inter (Bold, Regular, Medium)
- Paleta: 9 cores profissionais
- 3 gradientes customizados

---

## 🎨 Paleta de Cores

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

---

## 📦 Estrutura de Arquivos

```
content-creation-squad/
├── scripts/
│   ├── auto-create-figma-stories.js  ← Script principal (NOVO)
│   ├── test-figma-token.js           ← Validar token
│   ├── create-figma-stories.js       ← API REST (legacy)
│   ├── figma-plugin.js               ← Plugin manual
│   └── package.json                  ← Dependências
│
├── output/
│   ├── figma-plugin-ready.js         ← Plugin gerado (copiar/colar)
│   ├── stories-structure.json        ← Estrutura JSON completa
│   └── preview-stories.html          ← Preview navegável
│
├── README-FIGMA.md                    ← Guia detalhado
└── FIGMA-INTEGRATION.md              ← Este arquivo
```

---

## 🔧 Comandos Disponíveis

```bash
# Validar token do Figma
npm run test-token

# Gerar plugin + preview automaticamente
npm run auto

# Método legacy (API REST - limitado)
npm run create

# Ver ajuda
npm run help
```

---

## ⚙️ Configuração

### Token do Figma

**Já configurado em:** `.env.local`

```bash
FIGMA_TOKEN=figd_oHOGTtXoow0YdB-bXscfweiNNe2ElFGDBj-nw615
```

**Conta:**
- Nome: One Percent
- Email: geracaoumporcento@gmail.com
- Status: ✅ Válido

**Para gerar novo token:**
1. Acesse: https://www.figma.com/settings
2. Seção: **Personal Access Tokens**
3. Clique: **Generate new token**
4. Copie e cole em `.env.local`

---

## 🎯 Próximos Passos

### 1. Ver Preview (Browser)
```bash
open content-creation-squad/output/preview-stories.html
```

### 2. Criar no Figma Desktop
- Seguir instruções da seção "Método 2" acima

### 3. Exportar Stories
**No Figma Desktop:**
1. Selecionar todos os 7 frames
2. Botão direito → **Export...**
3. Format: **PNG**
4. Scale: **2x** (recomendado para Instagram)
5. **Export**

### 4. Postar no Instagram
- Transferir PNGs para celular
- Instagram → Criar Story
- Upload das 7 imagens
- Adicionar stickers interativos:
  - Story 1: Caixa de pergunta
  - Story 2: Emoji slider
  - Story 7: Enquete

---

## 🐛 Troubleshooting

### Plugin não aparece no Figma
- ✅ Verificar se está usando Figma Desktop (não web)
- ✅ Menu → Plugins → Development → Refresh plugins
- ✅ Fechar e reabrir Figma

### Fontes não aparecem
```bash
# O plugin usa "Inter" (fonte padrão do Figma)
# Se não tiver, baixe em: https://fonts.google.com/specimen/Inter

# Ou edite o plugin para usar fontes que você tem:
# - Montserrat
# - Open Sans
# - Roboto
```

### Token inválido
```bash
# Testar token
npm run test-token

# Se expirou, gere novo em:
https://www.figma.com/settings
```

### Erro de permissão
```bash
# Instalar dependências novamente
npm install

# Verificar Node.js
node --version  # Mínimo: v14
```

---

## 📈 Melhorias Futuras

### Em Desenvolvimento:
- [ ] Exportação automática para PNG via API
- [ ] Upload direto para Instagram via API do Meta
- [ ] Geração de variações A/B
- [ ] Integração com banco de dados de posts
- [ ] Analytics de performance

### Sugestões:
- [ ] Templates adicionais (outros temas)
- [ ] Customização de cores via CLI
- [ ] Geração de Stories animados
- [ ] Integração com Canva

---

## 📚 Documentação Adicional

- **Figma Plugin API**: https://www.figma.com/plugin-docs/
- **Figma REST API**: https://www.figma.com/developers/api
- **README-FIGMA.md**: Guia completo com especificações técnicas
- **Content Creation Squad**: README principal do squad

---

## ✅ Checklist de Uso

**Antes de começar:**
- [x] Token do Figma configurado
- [x] Dependências instaladas (`npm install`)
- [x] Figma Desktop instalado
- [ ] Preview HTML visualizado

**Durante criação:**
- [ ] Plugin gerado (`npm run auto`)
- [ ] Código copiado para Figma Desktop
- [ ] Plugin executado com sucesso
- [ ] 7 Stories criados

**Antes de postar:**
- [ ] Stories exportados como PNG 2x
- [ ] Transferido para celular
- [ ] Horário ideal (7-9am, 12-1pm, 7-9pm BRT)
- [ ] Stickers interativos adicionados

---

## 🆘 Suporte

**Problemas com integração:**
```bash
# Ver logs
cat content-creation-squad/scripts/auto-create-figma-stories.js

# Abrir issue
https://github.com/your-repo/issues
```

**Dúvidas sobre Figma:**
- Forum: https://forum.figma.com/
- Docs: https://help.figma.com/

---

**Criado pelo Content Creation Squad**
*Adriano De Marqui (Design) + Eugene Schwartz (Copy)*

🎨 **Post Express** - Crie conteúdo viral em segundos
