'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ExpertCard } from '@/components/twitter/expert-card';
import { AddExpertModal } from '@/components/twitter/add-expert-modal';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { PageHeader } from '@/components/molecules/page-header';

interface TwitterExpert {
  id: string;
  twitter_username: string;
  display_name: string | null;
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
      // Buscar experts
      const { data: expertsData, error: expertsError } = await supabase
        .from('twitter_experts')
        .select('*')
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
      setFilteredExperts(expertsWithCounts);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader
        title="🐦 Twitter Monitoring"
        description="Gerencie experts monitorados e configure temas de interesse em tempo real"
      />

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-6">
        <Input
          type="search"
          placeholder="Buscar expert..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => setShowAddModal(true)} className="sm:w-auto w-full">
          + Adicionar Expert
        </Button>
      </div>

      {/* Stats rápidas */}
      {!loading && experts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-700 font-medium">Total de Experts</div>
            <div className="text-3xl font-bold text-purple-900">{experts.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-700 font-medium">Experts Ativos</div>
            <div className="text-3xl font-bold text-green-900">
              {experts.filter(e => e.is_active).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-700 font-medium">Tweets Capturados</div>
            <div className="text-3xl font-bold text-blue-900">
              {experts.reduce((sum, e) => sum + (e.tweet_count || 0), 0)}
            </div>
          </div>
        </div>
      )}

      {/* Lista de experts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredExperts.length === 0 ? (
        <div className="text-center py-16">
          {searchQuery ? (
            <div>
              <p className="text-gray-500 text-lg mb-2">Nenhum expert encontrado</p>
              <p className="text-gray-400 text-sm">
                Tente buscar por outro nome ou username
              </p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">🐦</div>
              <p className="text-gray-500 text-lg mb-4">
                Nenhum expert cadastrado ainda
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                + Adicionar Primeiro Expert
              </Button>
            </div>
          )}
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
      <AddExpertModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleExpertAdded}
      />
    </div>
  );
}
