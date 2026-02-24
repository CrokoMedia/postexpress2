# Story 3.1: Dashboard de Gerenciamento de Experts

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** 📋 To Do
**Priority:** P1 (High)
**Estimate:** 4h
**Owner:** Frontend Dev
**Sprint:** Sprint 2 - Semana 1
**Depends On:** Story 1.2 (Schema), Story 1.3 (Rules Library)

---

## 📋 Descrição

Criar interface administrativa para gerenciar experts monitorados: listar, adicionar, editar temas, ativar/desativar monitoramento e visualizar status das regras ativas.

---

## 🎯 Acceptance Criteria

- [ ] Página `/dashboard/twitter/experts` criada
- [ ] Lista de experts com cards visuais
- [ ] Botão "Adicionar Expert" com modal/form
- [ ] Edição inline de temas (tags input)
- [ ] Toggle ativar/desativar monitoramento
- [ ] Indicador visual de status (ativo/inativo)
- [ ] Contador de tweets capturados por expert
- [ ] Filtro/busca por username
- [ ] Responsivo (mobile-friendly)
- [ ] Loading states e error handling

---

## 🎨 Design

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Twitter Monitoring                                  │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ 🔍 [Buscar expert...]  [+ Adicionar Expert]        │
│                                                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ @garyvee ✓   │ │ @alexhormozi │ │ @naval       │ │
│ │ Gary Vee     │ │ Alex Hormozi │ │ Naval        │ │
│ │              │ │              │ │              │ │
│ │ 🏷️ marketing │ │ 🏷️ sales     │ │ 🏷️ startups  │ │
│ │    sales     │ │    offers    │ │    investing │ │
│ │              │ │              │ │              │ │
│ │ 📊 47 tweets │ │ 📊 23 tweets │ │ 📊 12 tweets │ │
│ │ 🟢 Ativo     │ │ 🟢 Ativo     │ │ 🔴 Pausado   │ │
│ │              │ │              │ │              │ │
│ │ [Editar]     │ │ [Editar]     │ │ [Editar]     │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Implementação

### 1. Página Principal

```typescript
// app/dashboard/twitter/experts/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ExpertCard } from '@/components/twitter/ExpertCard';
import { AddExpertModal } from '@/components/twitter/AddExpertModal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { PageHeader } from '@/components/molecules/PageHeader';

interface TwitterExpert {
  id: string;
  twitter_username: string;
  display_name: string;
  themes: string[];
  is_active: boolean;
  tweet_count?: number;
  created_at: string;
}

export default function TwitterExpertsPage() {
  const [experts, setExperts] = useState<TwitterExpert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<TwitterExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const supabase = createClient();

  // Carregar experts
  useEffect(() => {
    fetchExperts();
  }, []);

  // Filtrar por busca
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExperts(experts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredExperts(
        experts.filter(
          e =>
            e.twitter_username.toLowerCase().includes(query) ||
            e.display_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, experts]);

  async function fetchExperts() {
    setLoading(true);

    try {
      // Buscar experts com contagem de tweets
      const { data, error } = await supabase
        .from('twitter_experts')
        .select(`
          *,
          tweet_count:twitter_content_updates(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar contagem
      const expertsWithCount = data.map(expert => ({
        ...expert,
        tweet_count: expert.tweet_count?.[0]?.count || 0
      }));

      setExperts(expertsWithCount);
      setFilteredExperts(expertsWithCount);

    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleExpertAdded() {
    setShowAddModal(false);
    fetchExperts(); // Recarregar lista
  }

  function handleExpertUpdated() {
    fetchExperts(); // Recarregar lista
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Twitter Monitoring"
        description="Gerencie experts monitorados e configure temas de interesse"
      />

      {/* Barra de ações */}
      <div className="flex gap-4 mb-6">
        <Input
          type="search"
          placeholder="🔍 Buscar expert..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => setShowAddModal(true)}>
          + Adicionar Expert
        </Button>
      </div>

      {/* Lista de experts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredExperts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'Nenhum expert encontrado' : 'Nenhum expert cadastrado ainda'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperts.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onUpdate={handleExpertUpdated}
            />
          ))}
        </div>
      )}

      {/* Modal de adicionar */}
      {showAddModal && (
        <AddExpertModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleExpertAdded}
        />
      )}
    </div>
  );
}
```

---

### 2. Componente ExpertCard

```typescript
// components/twitter/ExpertCard.tsx

'use client';

import { useState } from 'react';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Switch } from '@/components/atoms/Switch';
import { EditThemesModal } from './EditThemesModal';
import { createClient } from '@/lib/supabase';

interface ExpertCardProps {
  expert: {
    id: string;
    twitter_username: string;
    display_name: string;
    themes: string[];
    is_active: boolean;
    tweet_count?: number;
  };
  onUpdate: () => void;
}

export function ExpertCard({ expert, onUpdate }: ExpertCardProps) {
  const [isActive, setIsActive] = useState(expert.is_active);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleToggleActive() {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('twitter_experts')
        .update({ is_active: !isActive })
        .eq('id', expert.id);

      if (error) throw error;

      setIsActive(!isActive);

      // Sincronizar regras do Twitter API
      if (!isActive) {
        // Ativando - criar regra
        await fetch('/api/twitter/rules/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expertId: expert.id,
            themes: expert.themes
          })
        });
      } else {
        // Desativando - remover regra
        await fetch('/api/twitter/rules/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expertId: expert.id })
        });
      }

      onUpdate();

    } catch (error) {
      console.error('Error toggling expert:', error);
      alert('Erro ao atualizar expert');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              @{expert.twitter_username}
            </h3>
            {expert.display_name && (
              <p className="text-sm text-gray-600">{expert.display_name}</p>
            )}
          </div>
          <Switch
            checked={isActive}
            onChange={handleToggleActive}
            disabled={loading}
          />
        </div>

        {/* Temas */}
        <div className="flex flex-wrap gap-2">
          {expert.themes.length > 0 ? (
            expert.themes.map(theme => (
              <Badge key={theme} variant="secondary">
                🏷️ {theme}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">Sem temas configurados</span>
          )}
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📊 {expert.tweet_count || 0} tweets</span>
          <Badge variant={isActive ? 'success' : 'neutral'}>
            {isActive ? '🟢 Ativo' : '🔴 Pausado'}
          </Badge>
        </div>

        {/* Ações */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditModal(true)}
          className="w-full"
        >
          Editar Temas
        </Button>
      </Card>

      {/* Modal de edição */}
      {showEditModal && (
        <EditThemesModal
          expert={expert}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}
```

---

### 3. Modal de Adicionar Expert

```typescript
// components/twitter/AddExpertModal.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/molecules/Modal';
import { createClient } from '@/lib/supabase';

interface AddExpertModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExpertModal({ onClose, onSuccess }: AddExpertModalProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [themeInput, setThemeInput] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function handleAddTheme() {
    const trimmed = themeInput.trim().toLowerCase();
    if (trimmed && !themes.includes(trimmed)) {
      setThemes([...themes, trimmed]);
      setThemeInput('');
    }
  }

  function handleRemoveTheme(theme: string) {
    setThemes(themes.filter(t => t !== theme));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      alert('Username é obrigatório');
      return;
    }

    if (themes.length === 0) {
      alert('Adicione pelo menos 1 tema');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar expert no Supabase
      const { data: expert, error: insertError } = await supabase
        .from('twitter_experts')
        .insert({
          twitter_username: username.trim().replace('@', ''),
          display_name: displayName.trim() || null,
          themes,
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Criar regra no Twitter API
      const response = await fetch('/api/twitter/rules/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: expert.id,
          themes
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao criar regra no Twitter');
      }

      onSuccess();

    } catch (error) {
      console.error('Error adding expert:', error);
      alert('Erro ao adicionar expert');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Adicionar Expert" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Twitter Username *
          </label>
          <Input
            type="text"
            placeholder="@garyvee"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nome de Exibição (opcional)
          </label>
          <Input
            type="text"
            placeholder="Gary Vaynerchuk"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Temas */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Temas de Interesse *
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Ex: marketing"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTheme();
                }
              }}
            />
            <Button type="button" onClick={handleAddTheme}>
              + Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map(theme => (
              <Badge
                key={theme}
                variant="secondary"
                onRemove={() => handleRemoveTheme(theme)}
              >
                {theme}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Adicionar Expert'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

---

### 4. API Routes

```typescript
// app/api/twitter/rules/add/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { addRule } from '@/lib/twitter-rules';

export async function POST(request: NextRequest) {
  try {
    const { expertId, themes } = await request.json();

    if (!expertId || !themes || themes.length === 0) {
      return NextResponse.json(
        { error: 'expertId and themes are required' },
        { status: 400 }
      );
    }

    const ruleId = await addRule(expertId, themes);

    return NextResponse.json({ success: true, ruleId });

  } catch (error) {
    console.error('Error adding rule:', error);
    return NextResponse.json(
      { error: 'Failed to add rule' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/twitter/rules/remove/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { removeRule } from '@/lib/twitter-rules';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { expertId } = await request.json();

    if (!expertId) {
      return NextResponse.json(
        { error: 'expertId is required' },
        { status: 400 }
      );
    }

    // Buscar regra ativa do expert
    const supabase = createClient();
    const { data: rule } = await supabase
      .from('twitter_stream_rules')
      .select('id')
      .eq('expert_id', expertId)
      .eq('is_active', true)
      .single();

    if (!rule) {
      return NextResponse.json(
        { error: 'No active rule found for this expert' },
        { status: 404 }
      );
    }

    await removeRule(rule.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error removing rule:', error);
    return NextResponse.json(
      { error: 'Failed to remove rule' },
      { status: 500 }
    );
  }
}
```

---

## 📁 Arquivos Criados/Modificados

```
📁 postexpress2/
├── app/
│   ├── dashboard/
│   │   └── twitter/
│   │       └── experts/
│   │           └── page.tsx                    # CRIADO
│   └── api/
│       └── twitter/
│           └── rules/
│               ├── add/route.ts                # CRIADO
│               └── remove/route.ts             # CRIADO
└── components/
    └── twitter/
        ├── ExpertCard.tsx                      # CRIADO
        ├── AddExpertModal.tsx                  # CRIADO
        └── EditThemesModal.tsx                 # CRIADO (Story 3.2)
```

---

## 🧪 Como Testar

### Teste 1: Listar Experts
1. Acessar `/dashboard/twitter/experts`
2. Verificar lista de experts carregando
3. Verificar dados corretos (username, temas, contador)

### Teste 2: Adicionar Expert
1. Clicar em "+ Adicionar Expert"
2. Preencher form (@test_user, temas: test, demo)
3. Salvar
4. Verificar card aparecendo na lista
5. Verificar regra criada no Twitter API

### Teste 3: Ativar/Desativar
1. Clicar no toggle de um expert
2. Verificar status mudando (Ativo ↔ Pausado)
3. Verificar regra sendo removida/adicionada no Twitter

### Teste 4: Busca
1. Digitar username na busca
2. Verificar filtragem em tempo real
3. Limpar busca - verificar lista completa voltando

---

## ✅ Definition of Done

- [ ] Página `/dashboard/twitter/experts` funcionando
- [ ] Listagem de experts com dados corretos
- [ ] Adicionar expert via modal
- [ ] Toggle ativar/desativar sincronizando com Twitter API
- [ ] Busca/filtro funcionando
- [ ] Loading states implementados
- [ ] Error handling robusto
- [ ] Responsivo (mobile + desktop)
- [ ] API routes criadas e testadas
- [ ] Testes manuais passando

---

**Próxima Story:** Story 3.2 - Interface de Configuração de Temas
