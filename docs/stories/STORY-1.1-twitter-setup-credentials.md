# Story 1.1: Setup Twitter Developer Account & Credenciais

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** ✅ Done (credenciais obtidas)
**Priority:** P0 (Blocker)
**Estimate:** 1h
**Owner:** Dev Team
**Sprint:** Sprint 1 - Semana 1

---

## 📋 Descrição

Configurar conta de desenvolvedor do Twitter, criar aplicativo, obter credenciais (Bearer Token) e validar acesso à Filtered Stream API.

---

## 🎯 Acceptance Criteria

- [ ] Conta de desenvolvedor Twitter aprovada
- [ ] App criado no Twitter Developer Portal
- [ ] Bearer Token obtido e salvo no `.env`
- [ ] Teste de autenticação bem-sucedido (cURL ou Postman)
- [ ] Acesso ao endpoint `/2/tweets/search/stream/rules` confirmado
- [ ] Plano Basic ($100/mês) assinado (ou Free para testes)
- [ ] Documentação das credenciais no README

---

## 🔧 Tarefas Técnicas

### 1. Criar Conta de Desenvolvedor
- [x] Acessar https://developer.twitter.com/en/portal/petition/essential/basic-info
- [x] Preencher formulário de caso de uso
- [x] Aguardar aprovação (instantânea para Basic)

### 2. Criar Projeto e App
- [x] Dashboard → Create Project
  - Nome: "Post Express Monitor"
  - Use case: "Exploring the API"
- [x] Criar App dentro do projeto
  - Nome: "postexpress-monitor" (único globalmente)

### 3. Obter Credenciais
- [x] Copiar Bearer Token (mostrado uma vez)
- [ ] Salvar no `.env`:
  ```bash
  TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxxxxxxxxxxxxx
  ```
- [ ] Adicionar ao `.env.example`:
  ```bash
  # Twitter API
  TWITTER_BEARER_TOKEN=your_bearer_token_here
  ```

### 4. Validar Acesso
- [ ] Testar autenticação via cURL:
  ```bash
  curl "https://api.twitter.com/2/tweets/search/stream/rules" \
    -H "Authorization: Bearer $TWITTER_BEARER_TOKEN"
  ```
- [ ] Resposta esperada:
  ```json
  {
    "data": [],
    "meta": { "sent": "2024-02-19T10:00:00.000Z" }
  }
  ```

### 5. Assinar Plano (se necessário)
- [ ] Dashboard → Products → Selecionar "Basic" ($100/mês)
- [ ] Adicionar cartão de crédito
- [ ] Confirmar assinatura

### 6. Documentação
- [ ] Adicionar seção no README sobre setup Twitter API
- [ ] Documentar processo de obtenção de credenciais
- [ ] Adicionar troubleshooting comum

---

## 📁 Arquivos Afetados

```
📁 postexpress2/
├── .env                          # MODIFICADO (adicionar TWITTER_BEARER_TOKEN)
├── .env.example                  # MODIFICADO (adicionar template)
└── README.md                     # MODIFICADO (adicionar seção Twitter API)
```

---

## 🧪 Como Testar

### Teste 1: Autenticação
```bash
# Exportar token
export TWITTER_BEARER_TOKEN="seu_token_aqui"

# Testar endpoint de regras
curl "https://api.twitter.com/2/tweets/search/stream/rules" \
  -H "Authorization: Bearer $TWITTER_BEARER_TOKEN"

# Deve retornar 200 OK com JSON vazio
```

### Teste 2: Capacidade do Plano
```bash
# Verificar rate limits
curl -I "https://api.twitter.com/2/tweets/search/stream/rules" \
  -H "Authorization: Bearer $TWITTER_BEARER_TOKEN"

# Headers devem incluir:
# x-rate-limit-limit: 450
# x-rate-limit-remaining: 450
```

---

## 🔐 Segurança

- ⚠️ **CRÍTICO:** Nunca commitar `.env` no git
- ⚠️ Adicionar `.env` no `.gitignore` (já deve estar)
- ⚠️ Não compartilhar Bearer Token publicamente
- ⚠️ Rotacionar token se comprometido (Dashboard → Regenerate)

---

## 📚 Referências

- Twitter Developer Portal: https://developer.twitter.com/en/portal/dashboard
- Filtered Stream API: https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/introduction
- Authentication Docs: https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens

---

## ✅ Definition of Done

- [x] Credenciais obtidas ✅
- [ ] Token salvo no `.env`
- [ ] `.env.example` atualizado
- [ ] Teste de autenticação passando
- [ ] README documentado
- [ ] Plano assinado (ou decisão de usar Free para testes)

---

**Status:** ✅ **DONE** (credenciais já obtidas pelo usuário)

**Próxima Story:** Story 1.2 - Schema Supabase para Twitter Monitoring
