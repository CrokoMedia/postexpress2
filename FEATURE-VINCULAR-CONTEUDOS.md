# 🔗 Feature: Vincular Conteúdos Entre Perfis

## 📋 Visão Geral

Sistema que permite **reutilizar conteúdos gerados** em múltiplos perfis. Você cria um carrossel para um perfil e pode vinculá-lo a outros perfis sem precisar gerá-lo novamente.

## ✨ Funcionalidades

### ✅ O que foi implementado:

1. **Tabela de Relacionamento Many-to-Many**
   - Um conteúdo pode ser vinculado a múltiplos perfis
   - Um perfil pode ter conteúdos próprios + compartilhados

2. **API Completa**
   - POST `/api/content/{id}/link` - Vincular conteúdo a perfil
   - DELETE `/api/content/{id}/link` - Desvincular
   - GET `/api/content/{id}/link` - Listar vínculos

3. **Interface Visual**
   - Modal de vinculação com busca de perfis
   - Badges indicando conteúdo "Original" vs "Compartilhado"
   - Botão "Vincular" em cada conteúdo

4. **Soft Delete**
   - Vínculos podem ser removidos e restaurados
   - Histórico mantido no banco

## 🗂️ Estrutura de Dados

### Tabela: `content_profile_links`

```sql
CREATE TABLE content_profile_links (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content_suggestions(id),
  profile_id UUID REFERENCES profiles(id),
  link_type VARCHAR(50), -- 'original', 'shared', 'adapted'
  linked_at TIMESTAMP,
  notes TEXT,
  deleted_at TIMESTAMP
);
```

### Tipos de Vínculo:

- **`original`** - Perfil para qual o conteúdo foi criado
- **`shared`** - Conteúdo compartilhado de outro perfil
- **`adapted`** - Conteúdo adaptado/modificado (futuro)

## 🚀 Como Usar

### 1. Aplicar Migrations no Supabase

**IMPORTANTE:** Aplique as migrations na ordem:

```sql
-- 1. Primeiro, aplique soft delete (se ainda não aplicou)
-- database/migrations/006_add_soft_delete_all_tables.sql

-- 2. Depois, aplique vinculação de conteúdos
-- database/migrations/007_content_profile_links.sql
```

**Como aplicar:**
1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo da migration
4. Clique em **Run**

### 2. Vincular Conteúdo na Interface

1. Acesse: `/dashboard/profiles/{id}/content`
2. Veja a lista de conteúdos gerados
3. Clique no botão **"Vincular"** no conteúdo desejado
4. Modal abre com lista de perfis
5. Busque o perfil desejado
6. Clique em **"Vincular"**
7. Pronto! Conteúdo agora aparece em ambos os perfis

### 3. Desvincular Conteúdo

1. Na mesma tela, clique em **"Vincular"** novamente
2. Perfis já vinculados terão badge **"Vinculado"**
3. Clique em **"Desvincular"** ao lado do perfil
4. Confirme a ação

### 4. Visualizar Conteúdos Compartilhados

Na página de conteúdos (`/dashboard/profiles/{id}/content`):

- **Badge "Original"** = Conteúdo criado para este perfil
- **Badge "De @username"** = Conteúdo compartilhado de outro perfil

## 📊 Estatísticas

A API retorna breakdown dos conteúdos:

```json
{
  "contents": [...],
  "total": 15,
  "breakdown": {
    "original": 10,
    "shared": 5
  }
}
```

## 🔧 APIs Disponíveis

### Vincular Conteúdo

```bash
POST /api/content/{content_id}/link
Content-Type: application/json

{
  "profile_id": "uuid",
  "link_type": "shared",
  "notes": "Adaptado para público B2B"
}
```

### Desvincular Conteúdo

```bash
DELETE /api/content/{content_id}/link?profile_id={profile_id}
```

### Listar Vínculos

```bash
GET /api/content/{content_id}/link

Response:
{
  "content_id": "uuid",
  "linked_profiles": [
    {
      "id": "link-uuid",
      "link_type": "shared",
      "linked_at": "2026-02-17T...",
      "profile": {
        "id": "profile-uuid",
        "username": "exemplo",
        "full_name": "Exemplo da Silva"
      }
    }
  ],
  "total": 3
}
```

## 🎯 Casos de Uso

### 1. Reutilizar Carrosséis Entre Marcas

```
Cenário: Você gerencia 3 marcas diferentes
- Cria carrossel educacional para Marca A
- Vincula o mesmo carrossel para Marcas B e C
- Economiza tempo e mantém consistência
```

### 2. Testes A/B de Conteúdo

```
Cenário: Testar performance do mesmo conteúdo em perfis diferentes
- Cria conteúdo otimizado para Perfil A
- Vincula para Perfil B (público similar)
- Compara métricas de engajamento
```

### 3. Templates Corporativos

```
Cenário: Empresa com múltiplos perfis regionais
- Matriz cria conteúdo padrão
- Vincula para todas as filiais
- Cada filial pode adaptar localmente (futuro)
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
1. `database/migrations/007_content_profile_links.sql` - Migration
2. `app/api/content/[id]/link/route.ts` - API de vinculação
3. `components/molecules/link-content-modal.tsx` - Modal UI

### Modificados:
1. `app/api/profiles/[id]/contents/route.ts` - Incluir conteúdos vinculados
2. `app/dashboard/profiles/[id]/content/page.tsx` - Interface com badges

## 🔮 Melhorias Futuras

### Fase 2 (Opcional):
- [ ] Editar conteúdo vinculado (criar versão adaptada)
- [ ] Estatísticas de compartilhamento por conteúdo
- [ ] Notificações quando alguém vincula seu conteúdo
- [ ] Permissões de compartilhamento (público/privado)
- [ ] Histórico de modificações em conteúdos adaptados

### Fase 3 (Avançado):
- [ ] Biblioteca de conteúdos compartilhados (marketplace)
- [ ] Tags e categorias para facilitar busca
- [ ] Análise de performance cross-perfil
- [ ] Templates de conteúdo reutilizáveis

## 🐛 Troubleshooting

### Erro: "Content already linked to this profile"
**Causa:** Tentando vincular novamente um conteúdo já vinculado
**Solução:** Verifique a lista de vínculos antes de tentar vincular

### Erro: "Profile not found"
**Causa:** Profile ID inválido ou perfil foi deletado
**Solução:** Verifique se o perfil existe na tabela `profiles`

### Conteúdos não aparecem após vincular
**Causa:** Cache do frontend ou erro na migration
**Solução:**
1. Recarregue a página (Ctrl+R)
2. Verifique se a migration 007 foi aplicada no Supabase
3. Confira logs do console do navegador

## ✅ Checklist de Implementação

- [x] Migration 007 criada
- [x] API de vinculação implementada
- [x] Modal de vinculação criado
- [x] Interface atualizada com badges
- [x] Soft delete implementado
- [x] Documentação completa
- [ ] **APLICAR MIGRATION NO SUPABASE** ⚠️
- [ ] Testar vinculação entre perfis
- [ ] Testar desvinculação
- [ ] Verificar badges "Original" e "Compartilhado"

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este documento
2. Confira logs do servidor (`npm run dev`)
3. Inspecione console do navegador (F12)
4. Verifique se migrations foram aplicadas no Supabase

---

**Implementado por:** Dex (Dev Agent)
**Data:** 2026-02-17
**Versão:** 1.0
**Status:** Pronto para uso (após aplicar migrations)
