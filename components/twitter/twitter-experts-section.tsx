'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ExpertCard } from './expert-card';
import { AddExpertModal } from './add-expert-modal';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';

interface TwitterExpert {
  id: string;
  twitter_username: string;
  display_name: string | null;
  themes: string[];
  is_active: boolean;
  tweet_count?: number;
  profile_id: string;
  created_at: string;
}

interface TwitterExpertsSectionProps {
  profileId: string;
  profileUsername: string;
}

export function TwitterExpertsSection({ profileId, profileUsername }: TwitterExpertsSectionProps) {
  const [experts, setExperts] = useState<TwitterExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchExperts();
  }, [profileId]);

  async function fetchExperts() {
    setLoading(true);

    try {
      // Buscar experts do perfil específico
      const { data: expertsData, error: expertsError } = await supabase
        .from('twitter_experts')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (expertsError) throw expertsError;

      // Buscar contagem de tweets para cada expert
      const expertsWithCounts = await Promise.all(
        (expertsData || []).map(async (expert) => {
          const { count } = await supabase
            .from('twitter_content_updates')
            .select('*', { count: 'exact', head: true })
            .eq('expert_id', expert.id);

          return {
            ...expert,
            tweet_count: count || 0
          };
        })
      );

      setExperts(expertsWithCounts);

    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleExpertAdded() {
    setShowAddModal(false);
    fetchExperts();
  }

  function handleExpertUpdated() {
    fetchExperts();
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">🐦 Twitter Monitoring</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🐦 Twitter Monitoring
            {experts.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({experts.length} expert{experts.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitore experts do Twitter em tempo real para @{profileUsername}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          + Adicionar Expert
        </Button>
      </div>

      {/* Stats rápidas */}
      {experts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-xs text-purple-700 font-medium">Experts</div>
            <div className="text-2xl font-bold text-purple-900">{experts.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-green-700 font-medium">Ativos</div>
            <div className="text-2xl font-bold text-green-900">
              {experts.filter(e => e.is_active).length}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-blue-700 font-medium">Tweets</div>
            <div className="text-2xl font-bold text-blue-900">
              {experts.reduce((sum, e) => sum + (e.tweet_count || 0), 0)}
            </div>
          </div>
        </div>
      )}

      {/* Lista de experts */}
      {experts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-5xl mb-3">🐦</div>
          <p className="text-gray-600 mb-4">
            Nenhum expert monitorado ainda
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Adicione experts do Twitter para monitorar seus tweets em tempo real
          </p>
          <Button onClick={() => setShowAddModal(true)} variant="secondary">
            + Adicionar Primeiro Expert
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onUpdate={handleExpertUpdated}
            />
          ))}
        </div>
      )}

      {/* Modal de adicionar */}
      <AddExpertModal
        profileId={profileId}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleExpertAdded}
      />
    </Card>
  );
}
