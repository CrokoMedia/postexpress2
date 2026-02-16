# Correção: Fotos de Perfil

## Problema Identificado

Durante auditoria do sistema, identificamos que alguns perfis não tinham fotos de perfil salvas no banco de dados, mesmo que os dados estivessem sendo capturados corretamente pelo scraper.

### Sintomas
- ✅ Dados capturados corretamente pelo Apify (`profilePicUrlHD` presente nos JSONs)
- ✅ Campo `profile_pic_url_hd` existe no schema do banco
- ❌ Alguns perfis no banco tinham o campo `NULL`
- ❌ ProfileCard exibia inicial do username ao invés da foto

### Perfis Afetados
- @eufelipericardo
- @karlapazos

### Causa Raiz
Perfis foram salvos no banco ANTES da funcionalidade completa de foto de perfil estar implementada, ou houve erro no processo de salvamento inicial.

## Solução Implementada

### 1. Script de Correção Imediata
Criado `scripts/fix-missing-profile-pics.js` que:
- Busca perfis sem foto no banco (`profile_pic_url_hd IS NULL`)
- Procura arquivo de análise correspondente (`{username}-complete-analysis.json`)
- Extrai dados da foto do arquivo JSON
- Atualiza o perfil no banco com a foto + outros dados

**Uso:**
```bash
npm run fix-profile-pics
```

### 2. Melhoria no Código de Salvamento
Atualizado `lib/supabase-saver.ts` com:

#### Validações
- ✅ Valida se username está presente (obrigatório)
- ⚠️ Log de warning se foto estiver faltando
- ✅ Valores null explícitos ao invés de undefined

#### Preservação de Dados
- 🔒 Não sobrescreve foto antiga se nova estiver vazia
- 📊 Atualiza outros campos do perfil junto com a foto
- 📝 Logs detalhados de sucesso/erro

#### Código Adicionado
```typescript
// Log warning se foto de perfil estiver faltando
if (!profilePicUrl && !profilePicUrlHD) {
  console.warn(`⚠️  Profile picture missing for @${username}`)
}

// Preservar foto antiga se nova estiver vazia
if (currentData) {
  if (!profilePayload.profile_pic_url && currentData.profile_pic_url) {
    profilePayload.profile_pic_url = currentData.profile_pic_url
  }
  if (!profilePayload.profile_pic_url_hd && currentData.profile_pic_url_hd) {
    profilePayload.profile_pic_url_hd = currentData.profile_pic_url_hd
  }
}
```

### 3. Script de Teste
Criado `scripts/test-profile-pic.js` para verificação:
- Lista todos os perfis e status das fotos
- Mostra estatísticas (quantos têm foto, quantos não têm)
- Identifica problemas rapidamente

**Uso:**
```bash
npm run test-profile-pics
```

### 4. Comandos npm
Adicionados ao `package.json`:
```json
{
  "scripts": {
    "fix-profile-pics": "node scripts/fix-missing-profile-pics.js",
    "test-profile-pics": "node scripts/test-profile-pic.js"
  }
}
```

## Resultados

### Antes da Correção
```
profile_pic_url: 2/4 (50%)
profile_pic_url_hd: 2/4 (50%)
```

### Após a Correção
```
profile_pic_url: 4/4 (100%)
profile_pic_url_hd: 4/4 (100%)
✅ TUDO OK: Todas as fotos estão sendo salvas corretamente!
```

## Prevenção Futura

### Monitoramento
Execute periodicamente o teste:
```bash
npm run test-profile-pics
```

### Correção Automática
Se encontrar perfis sem foto:
```bash
npm run fix-profile-pics
```

### Boas Práticas
1. **Sempre validar dados antes de salvar** - supabase-saver agora faz isso
2. **Preservar dados existentes** - não sobrescrever com null/undefined
3. **Logs detalhados** - facilita debug de problemas
4. **Scripts de manutenção** - fix-profile-pics pode ser executado sempre que necessário

## Componentes Afetados

### Frontend
- `components/molecules/profile-card.tsx` - Renderiza foto ou inicial
- `app/dashboard/page.tsx` - Lista perfis com fotos
- `app/dashboard/profiles/[id]/page.tsx` - Página de detalhes do perfil

### Backend
- `lib/supabase-saver.ts` - Salvamento melhorado
- `worker/analysis-worker.ts` - Usa supabase-saver
- `scripts/complete-post-analyzer.js` - Captura profilePicUrlHD

### Banco de Dados
- Tabela: `profiles`
- Campos: `profile_pic_url`, `profile_pic_url_hd`, `profile_pic_cloudinary_url`

## URLs do Instagram

As fotos vêm diretamente do CDN do Instagram:
```
https://scontent-xxx.cdninstagram.com/v/t51.2885-19/...
```

**Características:**
- ✅ URLs públicas (não requer autenticação)
- ✅ Alta disponibilidade
- ⚠️ Podem expirar (parâmetros de token)
- 💡 Considerar upload para Cloudinary no futuro (campo já existe: `profile_pic_cloudinary_url`)

## Próximos Passos (Opcional)

1. **Upload para Cloudinary** - Cache permanente das fotos
2. **Webhook de atualização** - Atualizar fotos automaticamente quando perfil for re-scrapeado
3. **Fallback automático** - Se URL do Instagram falhar, usar Cloudinary

## Arquivos Criados/Modificados

### Criados
- ✅ `scripts/fix-missing-profile-pics.js` - Script de correção
- ✅ `scripts/test-profile-pic.js` - Script de teste
- ✅ `docs/fixes/profile-picture-fix.md` - Esta documentação

### Modificados
- ✅ `lib/supabase-saver.ts` - Validações e preservação de dados
- ✅ `package.json` - Novos comandos npm

---

**Data da correção:** 2026-02-16
**Desenvolvedor:** Dex (Dev Agent)
**Status:** ✅ Resolvido
