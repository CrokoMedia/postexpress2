'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Badge } from '@/components/atoms/badge';

interface AddExpertModalProps {
  profileId?: string; // Opcional - se não fornecido, expert é global
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExpertModal({ profileId, isOpen, onClose, onSuccess }: AddExpertModalProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [themeInput, setThemeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleAddTheme() {
    const trimmed = themeInput.trim().toLowerCase();

    if (!trimmed) {
      return;
    }

    if (themes.includes(trimmed)) {
      setError('Tema já adicionado');
      return;
    }

    if (themes.length >= 30) {
      setError('Máximo de 30 temas por expert (limite do Twitter API)');
      return;
    }

    setThemes([...themes, trimmed]);
    setThemeInput('');
    setError('');
  }

  function handleRemoveTheme(theme: string) {
    setThemes(themes.filter(t => t !== theme));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validações
    const cleanUsername = username.trim().replace('@', '');

    if (!cleanUsername) {
      setError('Username é obrigatório');
      return;
    }

    if (!/^[A-Za-z0-9_]{1,15}$/.test(cleanUsername)) {
      setError('Username inválido (apenas letras, números e _ até 15 caracteres)');
      return;
    }

    if (themes.length === 0) {
      setError('Adicione pelo menos 1 tema');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar expert via API (usa service_role - bypass RLS)
      const createResponse = await fetch('/api/twitter/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twitter_username: cleanUsername,
          display_name: displayName.trim() || null,
          themes,
          profile_id: profileId || null
        })
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.error || 'Falha ao criar expert');
      }

      const { expert } = await createResponse.json();

      // 2. Criar regra no Twitter API
      const rulesResponse = await fetch('/api/twitter/rules/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: expert.id,
          themes
        })
      });

      if (!rulesResponse.ok) {
        const data = await rulesResponse.json();
        throw new Error(data.error || 'Falha ao criar regra no Twitter');
      }

      onSuccess();

    } catch (error: any) {
      console.error('Error adding expert:', error);
      setError(error.message || 'Erro ao adicionar expert');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Expert</DialogTitle>
          <DialogDescription>
            Configure um expert do Twitter para monitorar seus tweets sobre temas específicos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter Username *
            </label>
            <Input
              type="text"
              placeholder="garyvee (sem @)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite sem o @. Ex: garyvee
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Exibição (opcional)
            </label>
            <Input
              type="text"
              placeholder="Gary Vaynerchuk"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Temas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temas de Interesse * ({themes.length}/30)
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
                disabled={loading}
              />
              <Button type="button" onClick={handleAddTheme} disabled={loading}>
                + Add
              </Button>
            </div>

            {/* Lista de temas */}
            {themes.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[60px]">
                {themes.map(theme => (
                  <Badge key={theme} variant="neutral">
                    {theme}
                    <button
                      type="button"
                      onClick={() => handleRemoveTheme(theme)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                Adicione pelo menos 1 tema (Ex: marketing, sales, frameworks)
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar Expert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
