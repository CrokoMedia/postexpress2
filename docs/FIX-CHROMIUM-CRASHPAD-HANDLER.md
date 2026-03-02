# Fix: Chromium crashpad_handler Error em Produção

**Data:** 2026-03-02
**Autor:** Dex (@dev)
**Issue:** `chrome_crashpad_handler: --database is required` ao gerar slides em produção

---

## 🐛 Problema

Ao tentar gerar slides em produção (Render.com), o Remotion falhava ao lançar o Chromium com erro:

```
Failed to launch the browser process!
chrome_crashpad_handler: --database is required
Try 'chrome_crashpad_handler --help' for more information.
[160:160:0302/160214.570366:ERROR:third_party/crashpad/crashpad/util/linux/socket.cc:120]
recvmsg: Connection reset by peer (104)
```

## 🔍 Causa Raiz

O código estava passando apenas o caminho do executável Chromium (`browserExecutable`) para o Remotion, mas **não estava passando os argumentos de segurança necessários** para rodar Chromium em ambiente serverless/containerizado.

Chromium/Puppeteer requer argumentos críticos como:
- `--no-sandbox` - Desabilita sandbox (necessário em containers)
- `--disable-setuid-sandbox` - Desabilita setuid sandbox
- `--disable-dev-shm-usage` - Evita problemas de memória compartilhada
- `--single-process` - Força processo único
- E mais ~30 argumentos fornecidos pelo `@sparticuz/chromium`

## ✅ Solução (Tentativa 1 - Incorreta)

**❌ Problema:** Tentamos passar `chromiumOptions.args` diretamente para `renderStill()`, mas a [documentação do Remotion v4](https://www.remotion.dev/docs/renderer/render-still) deixa claro que:

> **"chromiumOptions is not actually compatible with puppeteer, only with openBrowser(). Chromium flags need to be set at browser launch."**

## ✅ Solução Correta (Tentativa 2)

Usar `openBrowser()` + `puppeteerInstance` pattern conforme [documentação oficial](https://www.remotion.dev/docs/renderer/open-browser).

### Arquivos Modificados

#### `lib/remotion-chromium.ts`

**Mudança 1:** Retornar `chromiumArgs` diretamente (não em objeto aninhado)
```typescript
export type ServerlessRenderOptions = {
  browserExecutable?: string
  chromiumArgs?: string[]
  onBrowserDownload?: () => boolean
}
```

**Mudança 2:** Capturar `chromium.default.args` do @sparticuz/chromium
```typescript
// Obter args otimizados do @sparticuz/chromium (~37 argumentos)
chromiumArgs = chromium.default.args
```

**Mudança 3:** Fallback para args de segurança default
```typescript
// Se @sparticuz/chromium falhar ou PUPPETEER_EXECUTABLE_PATH estiver setado
chromiumArgs = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--disable-gpu',
  '--single-process',
  '--no-zygote',
]
```

**Mudança 4:** Retornar config com chromiumArgs
```typescript
const config: ServerlessRenderOptions = {
  browserExecutable: executablePath,
  chromiumArgs,
  onBrowserDownload: () => false,
}
```

#### `app/api/content/[id]/generate-slides-v3/route.ts`

**Mudança 1:** Importar `openBrowser` do @remotion/renderer
```typescript
const { renderStill, selectComposition, openBrowser } = require('@remotion/renderer')
```

**Mudança 2:** Abrir browser UMA VEZ com argumentos customizados
```typescript
const browserInstance = await openBrowser('chrome', {
  browserExecutable: renderOptions.browserExecutable,
  chromiumOptions: {
    args: renderOptions.chromiumArgs || [],
    headless: true,
  },
  shouldDumpIo: false,
})
```

**Mudança 3:** Passar `puppeteerInstance` para `renderStill()` (não spread de renderOptions)
```typescript
await renderStill({
  serveUrl: bundleLocation,
  composition,
  output: outputPath,
  inputProps: stillInputProps,
  puppeteerInstance: browserInstance, // ✅ CORRETO
})
```

**Mudança 4:** Fechar browser ao final (try-finally para garantir cleanup)
```typescript
try {
  // Gerar todos os slides...
} finally {
  await browserInstance.close()
}
```

### Resultado

Agora o browser é criado com `openBrowser()` usando os argumentos necessários:

```
🚀 [V3/Remotion] Abrindo browser com chromiumArgs...
📋 [Remotion] Configuração final:
   browserExecutable: /usr/bin/chromium
   chromiumArgs: 37 argumentos
   args preview: --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage ...
✅ [V3/Remotion] Browser aberto com sucesso
```

E cada `renderStill()` reutiliza a mesma instância do browser (mais eficiente).

## 📦 Dependências

- `@sparticuz/chromium: ^143.0.4` - Fornece Chromium otimizado + args para Lambda/serverless
- `puppeteer-core: ^24.37.4` - Controla Chromium headless
- `@remotion/renderer: ^4.0.425` - Renderiza slides via Chromium

## 🚀 Deploy

### Render.com

1. Dockerfile instala Chromium via apt-get ✅
2. Define env vars `PUPPETEER_EXECUTABLE_PATH`, `REMOTION_BROWSER_EXECUTABLE` ✅
3. Código detecta ambiente de produção via `process.env.NODE_ENV === 'production'` ✅
4. **[NOVO]** Código agora passa `chromiumOptions.args` para Remotion ✅

### Teste em Produção

```bash
# Fazer deploy no Render
git push origin main

# Testar geração de slides
curl -X POST https://postexpress.onrender.com/api/content/[id]/generate-slides-v3 \
  -H "Content-Type: application/json" \
  -d '{"carousels": [...], "templateId": "minimalist", "format": "feed"}'
```

## 🔗 Referências

- [Remotion renderStill() Documentation](https://www.remotion.dev/docs/renderer/render-still)
- [Remotion openBrowser() Documentation](https://www.remotion.dev/docs/renderer/open-browser)
- [Remotion Chromium Flags](https://www.remotion.dev/docs/chromium-flags)
- [Remotion Troubleshooting - Browser Launch](https://remotion.dev/docs/troubleshooting/browser-launch)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)
- [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting)

## 📝 Lições Aprendidas

1. **Não basta passar o executável** - Chromium em containers precisa de argumentos específicos
2. **@sparticuz/chromium fornece args otimizados** - Usar `.args` em vez de hardcoded
3. **Sempre ter fallback** - Se @sparticuz falhar, usar args de segurança mínimos
4. **Logs detalhados ajudam** - Console.logs permitiram identificar que args não estavam sendo passados
5. **RTFM (Read The Fine Manual)** - A documentação do Remotion deixa claro que `chromiumOptions` em `renderStill()` não aceita puppeteer args
6. **openBrowser() + puppeteerInstance é o pattern correto** - Criar browser uma vez, reutilizar para múltiplos renderStill()
7. **try-finally para cleanup** - Garantir que browser seja fechado mesmo em caso de erro

---

**Status:** ✅ Resolvido
**Próximos passos:** Monitorar logs de produção para confirmar fix
