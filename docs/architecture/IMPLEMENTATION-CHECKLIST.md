# Checklist de Implementação - Refatoração Content Creation

**Baseado em:** `BROWNFIELD-CONTENT-CREATION-REFACTOR.md`
**Projeto:** Croko Labs
**Data Início:** 2026-02-21

---

## 📋 Checklist Geral

### ✅ Preparação
- [ ] Criar branch `refactor/content-creation-separation`
- [ ] Fazer backup de `page.tsx` → `page.tsx.backup`
- [ ] Criar estrutura de pastas:
  ```
  app/dashboard/audits/[id]/create-content/
  ├── carousels/
  │   └── page.tsx (criar)
  ├── slides/
  │   └── page.tsx (já existe, refatorar)
  └── reels/
      └── page.tsx (já existe, refatorar)
  ```
- [ ] Instalar dependências (se necessário)

---

## 🔌 Fase 1: APIs DELETE

### `/api/content/[id]/carousels/[carouselIndex]/route.ts`
- [ ] Criar arquivo
- [ ] Implementar método DELETE
- [ ] Validar `audit_id` e `carouselIndex`
- [ ] Buscar `content_suggestions` no Supabase
- [ ] Remover carrossel do array `content_json.carousels`
- [ ] Atualizar no Supabase
- [ ] Retornar sucesso com contagem
- [ ] Adicionar logs de erro
- [ ] Testar com Thunder Client/Postman
  - [ ] DELETE com índice válido
  - [ ] DELETE com índice inválido (404)
  - [ ] DELETE com audit_id inexistente (404)

### `/api/content/[id]/slides/[carouselIndex]/route.ts`
- [ ] Criar arquivo
- [ ] Implementar método DELETE
- [ ] Validar `audit_id` e `carouselIndex`
- [ ] Buscar `content_suggestions` no Supabase
- [ ] Extrair `cloudinaryPublicId` de todos os slides
- [ ] Deletar imagens do Cloudinary em batch
- [ ] Logar resultados do Cloudinary
- [ ] Remover carrossel de `slides_json`
- [ ] Atualizar `summary` (totalSlides, totalCarousels)
- [ ] Atualizar no Supabase
- [ ] Retornar sucesso com estatísticas
- [ ] Testar com Thunder Client/Postman
  - [ ] DELETE com slides existentes
  - [ ] Verificar imagens deletadas no Cloudinary
  - [ ] DELETE com carrossel sem slides (404)

### `/api/content/[id]/reels/[reelIndex]/route.ts`
- [ ] Criar arquivo
- [ ] Implementar método DELETE
- [ ] Validar `audit_id` e `reelIndex`
- [ ] Buscar `content_suggestions` no Supabase
- [ ] Extrair `cloudinaryPublicId` do reel
- [ ] Deletar vídeo do Cloudinary (resource_type: 'video')
- [ ] Logar resultado do Cloudinary
- [ ] Remover reel de `reel_videos_json.videos`
- [ ] Atualizar no Supabase (setar null se array vazio)
- [ ] Retornar sucesso
- [ ] Testar com Thunder Client/Postman
  - [ ] DELETE com reel existente
  - [ ] Verificar vídeo deletado no Cloudinary
  - [ ] DELETE com índice inválido (404)

---

## 🏠 Fase 2: Hub de Navegação

### `/create-content/page.tsx` (NOVO)
- [ ] Criar arquivo
- [ ] Importar hooks e componentes
- [ ] Estado:
  - [ ] `carouselsCount`
  - [ ] `approvedCarouselsCount`
  - [ ] `slidesCount`
  - [ ] `reelsCount`
  - [ ] `loading`
- [ ] useEffect para carregar dados:
  - [ ] Fetch `GET /api/audits/[id]/content`
  - [ ] Contar carrosséis totais
  - [ ] Contar carrosséis aprovados
  - [ ] Contar slides
  - [ ] Contar reels
- [ ] UI:
  - [ ] PageHeader
  - [ ] Grid 3 colunas
  - [ ] Card Carrosséis
    - [ ] Ícone 📸
    - [ ] Contador
    - [ ] Botão "Gerenciar Carrosséis"
  - [ ] Card Slides
    - [ ] Ícone 🎨
    - [ ] Contador
    - [ ] Botão "Gerenciar Slides" (disabled se nenhum aprovado)
  - [ ] Card Reels
    - [ ] Ícone 🎬
    - [ ] Contador
    - [ ] Botão "Gerenciar Reels" (disabled se nenhum aprovado)
- [ ] Skeleton loading
- [ ] Error state
- [ ] Testar navegação

---

## 📸 Fase 3: Página de Carrosséis

### `/carousels/page.tsx` (CRIAR)
- [ ] Criar arquivo
- [ ] Importar hooks e componentes
- [ ] **Migrar estado de `page.tsx.backup`:**
  - [ ] `generating`
  - [ ] `content` (carrosséis JSON)
  - [ ] `error`
  - [ ] `approvingCarousel`
  - [ ] `customTheme`
  - [ ] `usedTheme`
  - [ ] `editingIndex`
  - [ ] `editedCarousel`
  - [ ] `editInstructions`
  - [ ] `refining`
  - [ ] `saving`
  - [ ] `generatingVariations`
  - [ ] `copiedIndex`
- [ ] **Novos estados:**
  - [ ] `deleteModalOpen`
  - [ ] `carouselToDelete`
  - [ ] `deleting`
- [ ] **Migrar funções:**
  - [ ] `handleGenerateContent`
  - [ ] `handleApproveCarousel`
  - [ ] `handleCopyCarousel`
  - [ ] `handleOpenEdit`
  - [ ] `handleCloseEdit`
  - [ ] `handleSaveDirectEdits`
  - [ ] `handleRegenerateCarousel`
  - [ ] `handleGenerateVariations`
- [ ] **Nova função:**
  - [ ] `handleDeleteCarousel(index)`
    - [ ] Abrir modal de confirmação
    - [ ] Setar `carouselToDelete`
  - [ ] `confirmDelete()`
    - [ ] Fetch `DELETE /api/content/[id]/carousels/[index]`
    - [ ] Atualizar estado local (remover do array)
    - [ ] Fechar modal
    - [ ] Toast de sucesso
- [ ] **UI:**
  - [ ] PageHeader com breadcrumb
  - [ ] Botão "Voltar para Hub"
  - [ ] Campo de tema personalizado
  - [ ] Botão "Gerar Sugestões"
  - [ ] Lista de carrosséis
    - [ ] Card por carrossel
    - [ ] Botões: Aprovar, Rejeitar, Editar, Variações, **Deletar**
    - [ ] Painel de edição inline
    - [ ] Badges de status
  - [ ] Call to Action (se aprovados > 0):
    - [ ] Botão "Ir para Slides"
    - [ ] Botão "Ir para Reels"
- [ ] **Modal de Confirmação DELETE:**
  - [ ] Dialog component
  - [ ] Título: "Deletar Carrossel?"
  - [ ] Warning se tem slides gerados
  - [ ] Botão "Cancelar"
  - [ ] Botão "Deletar Permanentemente"
- [ ] Testar fluxo completo:
  - [ ] Gerar carrosséis
  - [ ] Aprovar carrossel
  - [ ] Deletar carrossel sem slides
  - [ ] Deletar carrossel com slides (warning)
  - [ ] Navegação para Slides/Reels

---

## 🎨 Fase 4: Página de Slides

### `/slides/page.tsx` (REFATORAR)
- [ ] Remover mistura com carrosséis
- [ ] **Estado existente (manter):**
  - [ ] `generatingSlidesV1/V2`
  - [ ] `slides`, `slidesV2`
  - [ ] `slidesError`
  - [ ] `selectedForSlides`
  - [ ] `selectedSlides`
  - [ ] `slideImageOptions`
  - [ ] `uploadingImage`
  - [ ] `downloadingZip`
  - [ ] `sendingToDrive`
- [ ] **Novos estados:**
  - [ ] `deleteModalOpen`
  - [ ] `carouselIndexToDelete`
  - [ ] `deletingSlides`
- [ ] **Nova função:**
  - [ ] `handleDeleteSlides(carouselIndex)`
    - [ ] Abrir modal de confirmação
    - [ ] Setar `carouselIndexToDelete`
  - [ ] `confirmDeleteSlides()`
    - [ ] Fetch `DELETE /api/content/[id]/slides/[carouselIndex]`
    - [ ] Atualizar estado local (remover do `slides_json`)
    - [ ] Fechar modal
    - [ ] Toast com estatísticas (X imagens deletadas)
- [ ] **UI (manter existente):**
  - [ ] Configuração de imagens por slide
  - [ ] Upload de imagens customizadas
  - [ ] Seleção de slides
  - [ ] Botões de gerar V1/V2/V3
- [ ] **UI (adicionar):**
  - [ ] Botão "Deletar Slides" por carrossel
  - [ ] Modal de confirmação DELETE
- [ ] **Modal de Confirmação DELETE:**
  - [ ] Título: "Deletar Slides?"
  - [ ] Contador de slides a deletar
  - [ ] Warning sobre Cloudinary
  - [ ] Botão "Deletar X Slides"
- [ ] Testar fluxo completo:
  - [ ] Gerar slides
  - [ ] Deletar slides de um carrossel
  - [ ] Verificar imagens removidas do Cloudinary
  - [ ] Download ZIP após delete

---

## 🎬 Fase 5: Página de Reels

### `/reels/page.tsx` (REFATORAR)
- [ ] Focar apenas em reels MP4 (remover texto)
- [ ] **Estado existente (manter):**
  - [ ] `generating`
  - [ ] `reelVideos`
  - [ ] `error`
  - [ ] `customTheme`
- [ ] **Novos estados:**
  - [ ] `deleteModalOpen`
  - [ ] `reelIndexToDelete`
  - [ ] `deletingReel`
- [ ] **Nova função:**
  - [ ] `handleDeleteReel(index)`
    - [ ] Abrir modal de confirmação
    - [ ] Setar `reelIndexToDelete`
  - [ ] `confirmDeleteReel()`
    - [ ] Fetch `DELETE /api/content/[id]/reels/[index]`
    - [ ] Atualizar estado local (remover do array)
    - [ ] Fechar modal
    - [ ] Toast de sucesso
- [ ] **UI (manter existente):**
  - [ ] Campo de tema personalizado
  - [ ] Botão "Gerar Reels"
  - [ ] Grid de vídeos
  - [ ] Player de vídeo
  - [ ] Botão "Baixar MP4"
- [ ] **UI (adicionar):**
  - [ ] Botão "Deletar" por reel
  - [ ] Modal de confirmação DELETE
- [ ] **Modal de Confirmação DELETE:**
  - [ ] Título: "Deletar Reel?"
  - [ ] Nome do reel
  - [ ] Warning sobre Cloudinary
  - [ ] Botão "Deletar Reel"
- [ ] Testar fluxo completo:
  - [ ] Gerar reels
  - [ ] Deletar reel
  - [ ] Verificar vídeo removido do Cloudinary
  - [ ] Gerar novo reel após delete

---

## 🧪 Fase 6: Testes Integrados

### Navegação entre Páginas
- [ ] Hub → Carrosséis → voltar para Hub
- [ ] Hub → Slides → voltar para Hub
- [ ] Hub → Reels → voltar para Hub
- [ ] Carrosséis → Slides (via botão)
- [ ] Carrosséis → Reels (via botão)
- [ ] Slides → Carrosséis (via breadcrumb)
- [ ] Reels → Carrosséis (via breadcrumb)

### Fluxo Completo E2E
- [ ] 1. Ir para Hub
- [ ] 2. Clicar "Gerenciar Carrosséis"
- [ ] 3. Gerar 5 carrosséis
- [ ] 4. Aprovar 3 carrosséis
- [ ] 5. Deletar 1 carrossel não aprovado
- [ ] 6. Clicar "Ir para Slides"
- [ ] 7. Configurar imagens
- [ ] 8. Gerar slides V2 para os 3 aprovados
- [ ] 9. Verificar 30 imagens no Cloudinary
- [ ] 10. Deletar slides de 1 carrossel
- [ ] 11. Verificar imagens removidas do Cloudinary
- [ ] 12. Download ZIP dos slides restantes
- [ ] 13. Voltar para Hub
- [ ] 14. Clicar "Gerenciar Reels"
- [ ] 15. Gerar reels MP4
- [ ] 16. Verificar vídeos no Cloudinary
- [ ] 17. Deletar 1 reel
- [ ] 18. Verificar vídeo removido do Cloudinary
- [ ] 19. Download MP4 do reel restante

### Testes de Edge Cases
- [ ] DELETE carrossel inexistente (404)
- [ ] DELETE slides de carrossel sem slides (404)
- [ ] DELETE reel inexistente (404)
- [ ] Gerar carrosséis sem tema (OK)
- [ ] Gerar carrosséis com tema vazio (OK)
- [ ] Aprovar carrossel já aprovado (idempotente)
- [ ] Deletar último carrossel (array vazio)
- [ ] Deletar último slide (JSON null)
- [ ] Deletar último reel (JSON null)

### Testes de Performance
- [ ] Página Hub carrega em < 1s
- [ ] Página Carrosséis carrega em < 1s
- [ ] Página Slides carrega em < 2s (imagens)
- [ ] Página Reels carrega em < 2s (vídeos)
- [ ] DELETE de 10 slides em batch < 5s
- [ ] DELETE de 1 reel < 2s

### Testes de Cloudinary
- [ ] Slides deletados realmente removidos (verificar painel Cloudinary)
- [ ] Reels deletados realmente removidos (verificar painel Cloudinary)
- [ ] Quotas de armazenamento reduzidas após delete

---

## 🚀 Fase 7: Deploy

### Pré-Deploy
- [ ] Code review completo
- [ ] Todos os testes passando
- [ ] Documentação atualizada
- [ ] Changelog criado

### Deploy
- [ ] Merge branch `refactor/content-creation-separation` → `main`
- [ ] Executar build de produção
- [ ] Deploy para ambiente de staging
- [ ] Testes de fumaça no staging
- [ ] Deploy para produção
- [ ] Monitorar logs (Vercel/Railway)
- [ ] Monitorar Sentry (se configurado)

### Pós-Deploy
- [ ] Testar em produção com dados reais
- [ ] Verificar Cloudinary (custos de armazenamento)
- [ ] Comunicar mudanças aos usuários (se houver)
- [ ] Documentar aprendizados

---

## 📊 Critérios de Aceitação

### Funcionalidades
- ✅ Hub de navegação funcional
- ✅ Página de Carrosséis independente
- ✅ Página de Slides independente
- ✅ Página de Reels independente
- ✅ DELETE de carrosséis funcional
- ✅ DELETE de slides funcional (com Cloudinary)
- ✅ DELETE de reels funcional (com Cloudinary)

### Qualidade de Código
- ✅ Nenhum arquivo > 1000 linhas
- ✅ Componentes reutilizáveis extraídos
- ✅ TypeScript sem erros
- ✅ ESLint sem warnings críticos
- ✅ Logs de erro adequados

### UX
- ✅ Navegação clara (usuário sabe onde está)
- ✅ Breadcrumbs funcionais
- ✅ Modais de confirmação para ações destrutivas
- ✅ Toasts de sucesso/erro
- ✅ Loading states adequados

---

## 🐛 Issues Conhecidos

### Para Resolver Antes do Deploy
- [ ] (nenhum no momento)

### Para Resolver Futuramente
- [ ] Adicionar undo para DELETEs (soft delete)
- [ ] Adicionar search/filter de carrosséis
- [ ] Adicionar paginação se > 20 carrosséis

---

**Última Atualização:** 2026-02-21
**Status:** ✅ Pronto para Execução
