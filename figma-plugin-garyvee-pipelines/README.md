# GaryVee × Croko Lab - Plugin Figma

Plugin Figma que visualiza os 4 pipelines de integração do Gary Vaynerchuk no Croko Lab.

## 🚀 Como Instalar

### 1. Abrir o Figma Desktop
O plugin precisa ser executado no **Figma Desktop** (não funciona no browser).

### 2. Importar o Plugin
1. No Figma, vá em **Menu → Plugins → Development → Import plugin from manifest**
2. Navegue até a pasta `figma-plugin-garyvee-pipelines`
3. Selecione o arquivo `manifest.json`

### 3. Compilar o TypeScript
```bash
cd figma-plugin-garyvee-pipelines
npm install -g typescript
tsc code.ts --target es6
```

Isso vai gerar o arquivo `code.js` necessário para o plugin funcionar.

### 4. Executar o Plugin
1. No Figma, vá em **Menu → Plugins → Development → GaryVee Integration Pipelines**
2. Escolha qual pipeline visualizar:
   - **Opção 1:** 6º Auditor (Gary como auditor de atenção)
   - **Opção 2:** GaryVee Mode (Coach de execução) ⭐ RECOMENDADO
   - **Opção 3:** Personal Branding Squad (Sub-serviço premium)
   - **Opção 4:** Gerador de Ideias (Feature standalone)
   - **Criar Todas:** Gera os 4 pipelines lado a lado

## 📊 O Que Cada Pipeline Mostra

### Opção 1: 6º Auditor
- **Pipeline:** Usuário → Scraping → 5 Auditores → Gary (atenção) → Score Final
- **Prós:** Complementa auditores existentes, análise única de plataformas
- **Contras:** Aumenta complexidade, mais um score

### Opção 2: GaryVee Mode ⭐
- **Pipeline:** Auditoria → Resultados → Botão Gary → Análise → Plano Execução
- **Prós:** Resolve "o que fazer com insights?", não complica auditoria
- **Contras:** Precisa contexto adicional, mais complexo implementar

### Opção 3: Personal Branding Squad
- **Pipeline:** Auditoria (R$47) → Upsell → Input → Squad → Estratégia (R$497)
- **Prós:** Monetização, Gary é referência em personal branding
- **Contras:** Sai da proposta "3 min", escopo grande

### Opção 4: Gerador de Ideias
- **Pipeline:** Input → Análise Tendências → Document Don't Create → 30 Ideias
- **Prós:** Resolve "não tenho ideias", escalável
- **Contras:** Precisa dados tempo real, APIs caras

## 🎨 Design System

O plugin usa as cores do Croko Lab:
- **Primary:** Purple (#6747C6)
- **Success:** Green (#38BC8F)
- **Warning:** Amber (#F29D1C)
- **Error:** Red (#F05450)
- **Gary:** Orange (#FF6633)

## 🔧 Troubleshooting

### Erro: "Cannot find module 'typescript'"
```bash
npm install -g typescript
```

### Erro: "code.js not found"
Execute `tsc code.ts --target es6` na pasta do plugin.

### Plugin não aparece no menu
Certifique-se de estar usando o **Figma Desktop** (não browser).

## 📝 Estrutura de Arquivos

```
figma-plugin-garyvee-pipelines/
├── manifest.json      # Configuração do plugin
├── code.ts           # Lógica principal (TypeScript)
├── code.js           # Compilado do TypeScript (gerado)
├── ui.html           # Interface do usuário
└── README.md         # Este arquivo
```

## 🚀 Próximos Passos

Depois de visualizar os pipelines:
1. Escolher qual opção implementar no Croko Lab
2. Criar endpoints de API (`/api/audits/[id]/garyvee-*`)
3. Adicionar UI no dashboard
4. Testar com usuários reais

---

**Criado por:** Pazos Media
**Data:** 2026-02-23
**Versão:** 1.0
