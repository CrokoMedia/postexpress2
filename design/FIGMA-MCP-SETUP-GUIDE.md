# 🔧 Croko Labs - Guia de Setup Figma MCP

> Configuração completa do Figma MCP + Code Connect para sincronização automática de templates

---

## 📋 Pré-requisitos

- [x] Claude Code instalado
- [x] Conta Figma (Free ou Pro)
- [x] Node.js 18+ instalado
- [x] Projeto Croko Labs configurado

---

## 🎯 Passo 1: Criar Token Figma (5 min)

### 1.1 Acessar Figma Settings

```
1. Abrir Figma (app ou web)
2. Clicar no avatar (canto superior direito)
3. Settings → Account → Personal access tokens
4. Create new token
```

### 1.2 Configurar Token

```
Token name: "Croko Labs - Claude Code MCP"
Scopes:
  ☑ File content
  ☑ Variables
  ☑ Comments (opcional)

Expiration: 90 days (recomendado) ou Never

→ Generate token
→ COPIAR O TOKEN (aparece só uma vez!)
```

### 1.3 Salvar Token Seguro

```bash
# No arquivo .env.local do Croko Labs
echo "FIGMA_ACCESS_TOKEN=figd_seu_token_aqui" >> .env.local

# Verificar que .env.local está no .gitignore
grep ".env.local" .gitignore
```

---

## 🔌 Passo 2: Configurar Figma MCP no Claude Code (10 min)

### 2.1 Editar `~/.claude/settings.json`

```bash
# Abrir arquivo de configuração
code ~/.claude/settings.json

# Ou
nano ~/.claude/settings.json
```

### 2.2 Adicionar Servidor MCP

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp",
      "auth": {
        "type": "bearer",
        "token": "figd_SEU_TOKEN_AQUI"
      }
    }
  }
}
```

**Importante:** Substituir `figd_SEU_TOKEN_AQUI` pelo token real copiado no passo 1.2.

### 2.3 Verificar Configuração

```bash
# Reiniciar Claude Code
claude restart

# Testar conexão
claude
> "Liste os servidores MCP disponíveis"

# Deve aparecer:
# - figma (https://mcp.figma.com/mcp) ✓
```

---

## 🎨 Passo 3: Criar Arquivo Figma (30 min)

### 3.1 Criar Novo Arquivo

```
1. Figma → New design file
2. Rename: "Croko Labs - Carousel Templates"
3. Copiar File ID da URL:
   https://figma.com/file/ABC123DEF456/Post-Express...
                         ^^^^^^^^^^^^
                         Este é o File ID
```

### 3.2 Estruturar Páginas

```
📄 Croko Labs - Carousel Templates
├─ 📑 Design Tokens (cores, tipografia, spacing)
├─ 📑 Components (SlideBase e variantes)
├─ 📑 Examples (carrosséis completos)
└─ 📑 Archive (versões antigas)
```

### 3.3 Criar Design Tokens

**Página: Design Tokens**

```
1. Color Styles (criar todos):
   - Primary/500 (#8B5CF6)
   - Primary/600 (#7C3AED)
   - Primary/100 (#EDE9FE)
   - Neutral/900 (#18181B)
   - Neutral/700 (#3F3F46)
   - Neutral/600 (#52525B)
   - Neutral/500 (#71717A)
   - Neutral/100 (#F4F4F5)
   - Neutral/50 (#FAFAFA)
   - Success (#10B981)
   - Warning (#F59E0B)
   - Error (#EF4444)

2. Text Styles (criar todos):
   - Heading/Hero (48px, bold, -0.02em)
   - Heading/1 (36px, bold)
   - Heading/2 (30px, bold)
   - Heading/3 (24px, semibold)
   - Body/Large (18px, regular, 1.6)
   - Body/Base (16px, regular, 1.5)
   - Body/Small (14px, regular, 1.5)
   - Caption (12px, regular, 1.3)

3. Variables (criar coleção "Spacing"):
   - spacing-1: 8
   - spacing-2: 16
   - spacing-3: 24
   - spacing-4: 32
   - spacing-5: 40
   - spacing-6: 48
   - spacing-8: 64
   - spacing-10: 80
```

### 3.4 Criar Componente Base

**Página: Components**

```
1. Criar frame 1080x1080px
2. Rename: "SlideBase"
3. Aplicar Auto Layout:
   - Direction: Vertical
   - Gap: 40px
   - Padding: 80px (all sides)
   - Fill: Neutral/50

4. Adicionar layers:
   ├─ Header (Auto Layout Horizontal, gap 12px)
   │  ├─ Logo Badge (40x40 circle, Primary/500)
   │  └─ Brand Text "Croko Labs" (Body/Small, semibold)
   │
   ├─ Content Area (Flex: 1)
   │  └─ [Placeholder frame]
   │
   └─ Footer (Auto Layout Horizontal, space-between)
      ├─ Username "@postexpress" (Caption, Neutral/500)
      └─ Slide Number "1/10" (Caption, Neutral/500)

5. Converter em Component (Cmd+Option+K)
```

### 3.5 Criar Variantes

```
1. Selecionar SlideBase component
2. Right panel → Add variant property
3. Criar property "Type":
   - Cover
   - Content
   - Stats
   - CTA

4. Customizar Content Area de cada variante:
   - Type=Cover → Hero title + gradient orb
   - Type=Content → List items ou comparison
   - Type=Stats → KPI cards
   - Type=CTA → Button + social proof
```

**Consultar:** `FIGMA-CAROUSEL-TEMPLATE-SPEC.md` para specs detalhados de cada variante.

---

## 🔗 Passo 4: Configurar Code Connect (15 min)

### 4.1 Instalar Figma Plugin

```
1. Figma → Plugins → Browse plugins
2. Buscar: "Code Connect"
3. Install
```

### 4.2 Configurar Componente React Base

Criar arquivo: `components/molecules/carousel-slide.tsx`

```tsx
import React from 'react';

export interface CarouselSlideProps {
  type: 'cover' | 'content' | 'stats' | 'cta';
  children: React.ReactNode;
  slideNumber?: string;
  username?: string;
}

export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  type,
  children,
  slideNumber = '1/10',
  username = '@postexpress',
}) => {
  const baseClasses = 'w-[1080px] h-[1080px] bg-neutral-50 p-20 flex flex-col';

  return (
    <div className={baseClasses} data-slide-type={type}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-full bg-primary-500" />
        <span className="text-sm font-semibold">Croko Labs</span>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-neutral-500">
        <span>{username}</span>
        <span>{slideNumber}</span>
      </div>
    </div>
  );
};
```

### 4.3 Vincular no Figma (Dev Mode)

```
1. No Figma, selecionar SlideBase component
2. Ativar Dev Mode (shift + D)
3. Right panel → Code Connect → Setup
4. Preencher:

Component path: components/molecules/carousel-slide.tsx
Component name: CarouselSlide

Props mapping:
- variant → type (Type property)
- children → Content Area layer
- slideNumber → Footer/Slide Number text
- username → Footer/Username text

5. Save
```

### 4.4 Criar figma.config.json

No root do projeto:

```json
{
  "codeConnect": {
    "include": [
      "components/molecules/carousel-slide.tsx",
      "components/atoms/*.tsx"
    ],
    "parser": "react",
    "importPaths": {
      "CarouselSlide": "@/components/molecules/carousel-slide"
    }
  }
}
```

---

## ✅ Passo 5: Testar Integração (10 min)

### 5.1 Obter File ID e Node ID

```
1. Abrir arquivo Figma no browser
2. URL: https://figma.com/file/ABC123/Post-Express...
   File ID: ABC123

3. Selecionar SlideBase component
4. Right click → Copy link to selection
5. URL: https://figma.com/file/ABC123?node-id=1-234
   Node ID: 1:234 (substitua - por :)
```

### 5.2 Testar no Claude Code

```bash
# Iniciar Claude Code
claude

# Prompt de teste:
"Usando Figma MCP, analise meu template de carrossel:
File ID: ABC123
Node ID: 1:234

Extraia o design context e gere o código React + Tailwind correspondente."
```

**Resultado esperado:**
- Claude usa ferramenta `get_design_context`
- Retorna JSX do componente
- Classes Tailwind aplicadas
- Props mapeadas corretamente

### 5.3 Verificar Design Tokens

```bash
# No Claude Code:
"Extraia todas as variáveis de design do arquivo Figma ABC123 usando get_variable_defs"
```

**Resultado esperado:**
```json
{
  "spacing-1": 8,
  "spacing-2": 16,
  "color-primary-500": "#8B5CF6",
  "text-heading-1": "36px/bold/Inter"
}
```

---

## 🔄 Passo 6: Workflow Diário (uso)

### Atualizar Template

```
Designer:
1. Abre arquivo Figma
2. Modifica SlideBase component (ex: muda cor do badge)
3. Salva (Cmd+S)
4. Notifica no Slack: "Atualizei template, versão 1.2"

Dev (você):
1. Abre Claude Code
2. Prompt: "Sincroniza template de carrossel do Figma (ABC123)"
3. Claude:
   - get_design_context (pega mudanças)
   - get_variable_defs (pega tokens atualizados)
   - Gera componente React atualizado
4. Você revisa diff
5. Aprova → commit
6. Pipeline: próxima auditoria usa template 1.2
```

### Criar Nova Variante

```
Designer:
1. Duplica SlideBase
2. Cria nova variante "Type=Testimonial"
3. Customiza layout (avatar grande + quote)
4. Salva

Dev:
1. Claude Code: "Gera componente para nova variante Testimonial"
2. Claude extrai via MCP
3. Adiciona em carousel-slide.tsx:
   type: 'cover' | 'content' | 'stats' | 'cta' | 'testimonial'
4. Implementa layout específico
5. Commit
```

---

## 🛠️ Troubleshooting

### Erro: "Figma MCP connection failed"

**Causas possíveis:**
1. Token inválido ou expirado
2. Configuração incorreta em settings.json
3. Servidor MCP offline

**Solução:**
```bash
# 1. Verificar token
curl -H "Authorization: Bearer figd_SEU_TOKEN" \
  https://api.figma.com/v1/me

# Se retornar 401: gerar novo token

# 2. Verificar settings.json
cat ~/.claude/settings.json | jq '.mcpServers.figma'

# 3. Reiniciar Claude
claude restart
```

---

### Erro: "Node ID not found"

**Causas:**
- Node ID incorreto (- vs :)
- Componente foi deletado
- Falta permissão no arquivo

**Solução:**
```bash
# Copiar link correto do Figma:
# Right click component → Copy link to selection
# Converter formato:
# https://figma.com/file/ABC?node-id=1-234
# Para: 1:234 (trocar - por :)
```

---

### Erro: "Code Connect mapping failed"

**Causas:**
- Componente React não existe no path especificado
- Props não batem (typo)

**Solução:**
```bash
# 1. Verificar path
ls components/molecules/carousel-slide.tsx

# 2. Verificar exports
grep "export.*CarouselSlide" components/molecules/carousel-slide.tsx

# 3. Revalidar mapping no Figma Dev Mode
```

---

## 📚 Recursos Avançados

### 1. Usar Modo Local (Desktop)

**Vantagens:** Mais rápido, funciona offline

```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "figma-local": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Como ativar:**
1. Abrir Figma desktop app
2. Dev Mode (Shift + D)
3. Inspect panel → Enable local MCP server
4. Porta 3845 fica ativa enquanto Figma estiver aberto

---

### 2. Automatizar Sync com GitHub Actions

```yaml
# .github/workflows/sync-figma-templates.yml
name: Sync Figma Templates

on:
  schedule:
    - cron: '0 10 * * 1' # Toda segunda 10h
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sync Figma to Code
        env:
          FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
        run: |
          npx @figma/code-connect sync

      - name: Create PR if changes
        uses: peter-evans/create-pull-request@v5
        with:
          title: "chore: sync Figma templates"
          branch: figma-sync
```

---

### 3. Exportar Assets Programaticamente

**Não via MCP, mas via REST API:**

```typescript
// scripts/export-figma-assets.ts
import fetch from 'node-fetch';

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_ID = 'ABC123';
const NODE_ID = '1:234';

async function exportAsset() {
  const url = `https://api.figma.com/v1/images/${FILE_ID}?ids=${NODE_ID}&format=png&scale=2`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  const data = await response.json();
  const imageUrl = data.images[NODE_ID];

  console.log('Download:', imageUrl);
  // Upload para Cloudinary, etc.
}
```

---

## ✅ Checklist Final

Antes de considerar setup completo:

- [ ] Token Figma criado e salvo em `.env.local`
- [ ] `~/.claude/settings.json` configurado com servidor MCP
- [ ] Arquivo Figma criado com estrutura correta (3 páginas)
- [ ] Design Tokens definidos (cores, tipografia, spacing)
- [ ] Componente SlideBase criado com 4 variantes
- [ ] Code Connect configurado e vinculado
- [ ] Componente React base criado (`carousel-slide.tsx`)
- [ ] Teste de `get_design_context` funcionando
- [ ] Teste de `get_variable_defs` funcionando
- [ ] Documentação de File ID e Node IDs registrada
- [ ] Workflow diário definido e comunicado ao time

---

## 📞 Suporte

**Documentação Oficial:**
- [Figma MCP Server Guide](https://github.com/figma/mcp-server-guide)
- [Figma Code Connect Docs](https://help.figma.com/hc/en-us/articles/32132100833559)
- [Model Context Protocol](https://modelcontextprotocol.io/)

**Comunidade:**
- Discord do Claude Code: discord.gg/claude
- Figma Community: forum.figma.com

---

**Versão:** 1.0
**Última atualização:** 2026-02-20
**Autor:** Pazos Media
**Tempo estimado de setup:** 60-90 minutos
