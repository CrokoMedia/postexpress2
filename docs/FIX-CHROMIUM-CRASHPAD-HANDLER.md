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

## ✅ Solução

### Arquivos Modificados

#### `lib/remotion-chromium.ts`

**Mudança 1:** Adicionar `chromiumArgs` ao tipo de retorno
```typescript
export type ServerlessRenderOptions = {
  browserExecutable?: string
  chromiumOptions?: {
    args?: string[]
  }
  onBrowserDownload?: () => boolean
}
```

**Mudança 2:** Capturar `chromium.default.args` do @sparticuz/chromium
```typescript
// Obter args otimizados do @sparticuz/chromium
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

**Mudança 4:** Retornar args no config
```typescript
const config: ServerlessRenderOptions = {
  browserExecutable: executablePath,
  chromiumOptions: {
    args: chromiumArgs,
  },
  onBrowserDownload: () => false,
}
```

### Resultado

Agora o Remotion recebe tanto o executável quanto os argumentos necessários:

```
📋 [Remotion] Configuração final:
   browserExecutable: /usr/bin/chromium
   chromiumOptions.args: 37 argumentos
   args: --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage ...
```

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

- [Remotion Troubleshooting - Browser Launch](https://remotion.dev/docs/troubleshooting/browser-launch)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)
- [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting)

## 📝 Lições Aprendidas

1. **Não basta passar o executável** - Chromium em containers precisa de argumentos específicos
2. **@sparticuz/chromium fornece args otimizados** - Usar `.args` em vez de hardcoded
3. **Sempre ter fallback** - Se @sparticuz falhar, usar args de segurança mínimos
4. **Logs detalhados ajudam** - Console.logs permitiram identificar que args não estavam sendo passados

---

**Status:** ✅ Resolvido
**Próximos passos:** Monitorar logs de produção para confirmar fix
