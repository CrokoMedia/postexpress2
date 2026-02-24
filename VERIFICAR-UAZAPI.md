# 🔍 Checklist - Verificar Configuração UAZapi

Nenhum endpoint foi encontrado na URL `https://crokolabs.uazapi.com`

---

## ✅ Checklist de verificação

### 1. Acessar a URL no navegador

**Teste:** Abra no navegador:
```
https://crokolabs.uazapi.com
```

**O que você vê?**
- [ ] Página de login/dashboard do UAZapi
- [ ] Página de documentação da API
- [ ] Erro 404
- [ ] Erro de conexão
- [ ] Outra coisa: _______________

---

### 2. Verificar credenciais no painel UAZapi

**Você recebeu:**
```
Server URL: https://crokolabs.uazapi.com
Admin Token: 7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7
```

**Perguntas para o suporte/painel:**
- [ ] Essa URL está correta para API requests?
- [ ] A URL base tem algum prefixo? (ex: `/api`, `/v1`, `/manager`)
- [ ] O token precisa de algum prefixo? (ex: `Bearer`, `Bot`)
- [ ] Qual header usar: `apikey`, `Authorization`, `x-api-key`?

---

### 3. Verificar se há painel web de gerenciamento

**UAZapi geralmente tem um painel web onde você pode:**
- Ver instâncias do WhatsApp
- Criar novas instâncias
- Ver QR Code
- Configurar webhooks
- Testar API

**Possíveis URLs do painel:**
- https://crokolabs.uazapi.com
- https://crokolabs.uazapi.com/admin
- https://crokolabs.uazapi.com/manager
- https://crokolabs.uazapi.com/dashboard

**Você consegue acessar algum painel?**
- [ ] Sim (qual URL? _______________)
- [ ] Não

---

### 4. Verificar documentação da API

**Documentação oficial UAZapi:**
- https://docs.uazapi.com/

**Documentação da sua instalação (pode ser diferente):**
- Existe uma página `/api-docs` ou `/swagger`?
- O provedor enviou documentação personalizada?

---

### 5. Exemplos de estrutura de URL comuns

UAZapi pode usar diferentes padrões:

| Padrão | Exemplo |
|--------|---------|
| Direto | `https://crokolabs.uazapi.com/instance/fetchInstances` |
| Com /api | `https://crokolabs.uazapi.com/api/instance/fetchInstances` |
| Com versão | `https://crokolabs.uazapi.com/v1/instance/fetchInstances` |
| Com manager | `https://crokolabs.uazapi.com/manager/instance/fetchInstances` |
| Com porta | `https://crokolabs.uazapi.com:8080/instance/fetchInstances` |

---

## 📞 O que perguntar ao suporte UAZapi

Envie essa mensagem para o suporte:

```
Olá! Recebi as credenciais abaixo para integração via API:

Server URL: https://crokolabs.uazapi.com
Admin Token: 7ovyqy3Yw1...

Mas não estou conseguindo acessar os endpoints da API.

Podem me confirmar:

1. Qual é a URL base completa para requests de API?
   Exemplo: https://crokolabs.uazapi.com/api

2. Qual endpoint devo usar para listar instâncias?
   Exemplo: GET /instance/fetchInstances

3. Qual header de autenticação usar?
   - apikey: {token}
   - Authorization: Bearer {token}
   - Outro?

4. Existe um exemplo de curl funcionando que vocês possam compartilhar?

5. Existe um painel web onde posso testar manualmente?

Obrigado!
```

---

## 🧪 Teste manual com curl

**Quando o suporte confirmar as informações, teste com curl:**

```bash
# Exemplo 1: Header apikey
curl -X GET "https://crokolabs.uazapi.com/instance/fetchInstances" \
  -H "apikey: 7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7" \
  -H "Content-Type: application/json"

# Exemplo 2: Header Authorization Bearer
curl -X GET "https://crokolabs.uazapi.com/instance/fetchInstances" \
  -H "Authorization: Bearer 7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7" \
  -H "Content-Type: application/json"

# Exemplo 3: Com /api na URL
curl -X GET "https://crokolabs.uazapi.com/api/instance/fetchInstances" \
  -H "apikey: 7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7" \
  -H "Content-Type: application/json"
```

---

## ✅ Próximos passos

1. [ ] Verificar URL no navegador
2. [ ] Procurar painel de gerenciamento
3. [ ] Entrar em contato com suporte UAZapi
4. [ ] Obter URL base correta + endpoint correto
5. [ ] Testar com curl
6. [ ] Atualizar script de setup com informações corretas

---

## 📝 Informações para preencher (quando descobrir)

```bash
# URL base correta da API
URL_BASE=_______________

# Endpoint para listar instâncias
ENDPOINT_LIST=_______________

# Header de autenticação (apikey, Authorization, etc)
AUTH_HEADER=_______________

# Exemplo de curl funcionando
CURL_EXEMPLO=_______________
```

---

**Depois de preencher as informações acima, avise que eu atualizo os scripts! 🚀**
