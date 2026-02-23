'use client';

import { useState } from 'react';
import { Card } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Switch } from '@/components/atoms/switch';
import { EditThemesModal } from './edit-themes-modal';

interface ExpertCardProps {
  expert: {
    id: string;
    twitter_username: string;
    display_name: string | null;
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

  async function handleToggleActive() {
    setLoading(true);

    try {
      const newIsActive = !isActive;

      // Atualizar via API (usa service_role - bypass RLS)
      const updateResponse = await fetch(`/api/twitter/experts/${expert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: newIsActive
        })
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        throw new Error(data.error || data.details || 'Falha ao atualizar expert');
      }

      // Sincronizar com Twitter API
      if (newIsActive) {
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

      setIsActive(newIsActive);
      onUpdate();

    } catch (error) {
      console.error('Error toggling expert:', error);
      alert('Erro ao atualizar expert. Verifique o console.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="p-4 flex flex-col gap-3 hover:shadow-hover transition-shadow duration-400">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-neutral-900">
              @{expert.twitter_username}
            </h3>
            {expert.display_name && (
              <p className="text-sm text-neutral-600">{expert.display_name}</p>
            )}
          </div>
          <Switch
            checked={isActive}
            onChange={handleToggleActive}
            disabled={loading}
          />
        </div>

        {/* Temas */}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {expert.themes.length > 0 ? (
            expert.themes.map(theme => (
              <Badge key={theme} variant="neutral">
                {theme}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-neutral-500 italic">Sem temas configurados</span>
          )}
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-4 text-sm text-neutral-600 border-t pt-3">
          <span className="flex items-center gap-1">
            <strong>{expert.tweet_count || 0}</strong> tweets
          </span>
          <Badge variant={isActive ? 'success' : 'neutral'}>
            {isActive ? 'Ativo' : 'Pausado'}
          </Badge>
        </div>

        {/* Ações */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowEditModal(true)}
          className="w-full"
        >
          Editar Temas
        </Button>
      </Card>

      {/* Modal de edição */}
      <EditThemesModal
        expert={expert}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          onUpdate();
        }}
      />
    </>
  );
}
