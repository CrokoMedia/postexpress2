# 📱 Setup WhatsApp - UAZapi

Guia completo para configurar a integração WhatsApp do Croko Lab.

---

## 🎯 Pré-requisitos

1. ✅ Credenciais UAZapi (já temos)
   - Server URL: `https://crokolabs.uazapi.com`
   - Admin Token: `7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7`

2. ✅ Node.js instalado (v18+)

3. ⚠️ URL pública para webhook (escolher uma):
   - **Produção:** Domínio próprio (recomendado)
   - **Desenvolvimento:** ngrok ou localtunnel
   - **Deploy:** Vercel/Railway/Render

---

## 🚀 Como usar o script de setup

### 1. Execute o script

```bash
cd /Users/macbook-karla/postexpress2
node scripts/setup-uazapi.js
```

### 2. O script vai:

1. **Listar instâncias existentes** (se houver)
2. **Perguntar se quer usar existente ou criar nova**
3. **Criar instância** (se escolher nova)
4. **Gerar QR Code** para escanear com WhatsApp
5. **Configurar webhook** (URL pública do seu servidor)
6. **Gerar variáveis de ambiente** para o `.env`

### 3. Exemplo de execução

```
🚀 Setup UAZapi - Croko Lab

📋 Listando instâncias existentes...
⚠️  Nenhuma instância encontrada.

Digite o nome da nova instância (ex: croko-lab-whatsapp): croko-main

🔧 Criando instância "croko-main"...
✅ Instância criada com sucesso!
   ID: croko-main

📱 QR Code gerado! Escaneie com WhatsApp:
⏳ Aguarde escanear o QR Code antes de continuar...

Digite a URL pública do webhook: https://croko-lab.vercel.app/api/whatsapp/webhook

🔗 Configurando webhook para "croko-main"...
✅ Webhook configurado com sucesso!

✅ Configuração concluída!

─────────────────────────────────────────────────────────
# UAZapi WhatsApp Integration
UAZAPI_SERVER_URL=https://crokolabs.uazapi.com
UAZAPI_ADMIN_TOKEN=7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7
UAZAPI_INSTANCE_ID=croko-main
UAZAPI_INSTANCE_NAME=croko-main
UAZAPI_WEBHOOK_URL=https://croko-lab.vercel.app/api/whatsapp/webhook
─────────────────────────────────────────────────────────

📋 Próximos passos:
1. Copie as variáveis acima para seu arquivo .env
2. Reinicie sua aplicação Next.js
3. Teste enviando uma mensagem para o número do WhatsApp

🎉 Setup finalizado com sucesso!
```

---

## 🔧 Opções de URL pública (webhook)

### Opção 1: ngrok (desenvolvimento local) 🚀

```bash
# Instalar ngrok
brew install ngrok  # Mac
# ou baixe de https://ngrok.com

# Executar
ngrok http 3000

# Copiar a URL https (ex: https://abc123.ngrok.io)
# Usar: https://abc123.ngrok.io/api/whatsapp/webhook
```

**Prós:** Rápido para testar
**Contras:** URL muda toda vez que reinicia

### Opção 2: Vercel (produção) ✅ Recomendado

```bash
# Deploy no Vercel
vercel --prod

# URL será: https://croko-lab.vercel.app
# Webhook: https://croko-lab.vercel.app/api/whatsapp/webhook
```

**Prós:** Grátis, estável, HTTPS automático
**Contras:** Precisa fazer deploy

### Opção 3: Domínio próprio (produção) 🏆

Se já tiver domínio configurado:
```
https://crokolab.com.br/api/whatsapp/webhook
```

---

## 📝 Adicionar variáveis ao .env

Após executar o script, copie as variáveis geradas para o arquivo `.env`:

```bash
# Abrir .env
code .env

# Adicionar as 5 variáveis:
UAZAPI_SERVER_URL=https://crokolabs.uazapi.com
UAZAPI_ADMIN_TOKEN=7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7
UAZAPI_INSTANCE_ID=croko-main
UAZAPI_INSTANCE_NAME=croko-main
UAZAPI_WEBHOOK_URL=https://seu-dominio.com/api/whatsapp/webhook
```

---

## ✅ Testar a integração

### 1. Reiniciar o servidor

```bash
npm run dev
```

### 2. Enviar mensagem de teste

Envie uma mensagem para o número do WhatsApp conectado:

```
criar conteúdo sobre marketing digital
```

### 3. Verificar logs

No terminal do Next.js, você deve ver:

```
📱 Mensagem recebida de: 5511999999999
📝 Conteúdo: criar conteúdo sobre marketing digital
🤖 Acionando Content Creation Squad...
```

---

## 🐛 Troubleshooting

### Erro: "Instance not found"
- Verifique se o `UAZAPI_INSTANCE_ID` está correto
- Execute `node scripts/setup-uazapi.js` novamente

### Erro: "Webhook not delivered"
- Verifique se a URL pública está acessível
- Teste com: `curl https://seu-dominio.com/api/whatsapp/webhook`
- Certifique-se que o servidor está rodando

### Erro: "QR Code expired"
- Execute o script novamente
- Seção 3 do fluxo gera novo QR Code

### Erro: "Authentication failed"
- Verifique o `UAZAPI_ADMIN_TOKEN`
- Confirme que o token está correto

---

## 📚 Documentação UAZapi

- **Docs oficiais:** https://docs.uazapi.com/
- **API Reference:** https://docs.uazapi.com/api-reference
- **Webhooks:** https://docs.uazapi.com/webhooks

---

## 🎯 Próximos passos após setup

1. ✅ Implementar endpoints da API:
   - `/api/whatsapp/webhook` (POST) - Receber mensagens
   - `/api/whatsapp/send` (POST) - Enviar mensagens

2. ✅ Testar comandos:
   - `/aprovar`
   - `/rejeitar`
   - `/status`
   - `/historico`

3. ✅ Integrar com Content Creation Squad

4. ✅ Monitorar logs e métricas

---

*Criado em: 2026-02-24*
*Versão: 1.0*
