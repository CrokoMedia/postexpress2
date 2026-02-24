'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface WhatsAppUser {
  id: string;
  phone: string;
  name: string;
  authorized: boolean;
  active_profile_id: string | null;
  created_at: string;
  active_profile?: {
    username: string;
  };
}

export default function WhatsAppUsersPage() {
  const [users, setUsers] = useState<WhatsAppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ phone: '', name: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('whatsapp_users')
        .select(`
          *,
          active_profile:profiles!whatsapp_users_active_profile_id_fkey(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('whatsapp_users')
        .insert({
          phone: newUser.phone,
          name: newUser.name,
          authorized: true
        });

      if (error) throw error;

      setNewUser({ phone: '', name: '' });
      setShowAddForm(false);
      loadUsers();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      alert('Erro ao adicionar usuário');
    }
  }

  async function toggleAuthorization(userId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('whatsapp_users')
        .update({ authorized: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar autorização:', error);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários WhatsApp</h1>
          <p className="text-gray-600 mt-1">
            Gerencie quem tem acesso ao bot via WhatsApp
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          + Adicionar Usuário
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Adicionar Novo Usuário</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (sem +)
                </label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="66632607531"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Nenhum usuário cadastrado ainda</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Adicionar primeiro usuário
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    {user.authorized ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Autorizado
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        Bloqueado
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📞 {user.phone}</p>
                    {user.active_profile && (
                      <p>📊 Perfil ativo: @{user.active_profile.username}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAuthorization(user.id, user.authorized)}
                    className={`px-3 py-1 text-sm rounded transition ${
                      user.authorized
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {user.authorized ? 'Bloquear' : 'Autorizar'}
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Como funciona</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Apenas números autorizados podem usar o bot via WhatsApp</li>
          <li>• Cada usuário pode ter múltiplos perfis do Instagram vinculados</li>
          <li>• O perfil ativo é usado para gerar conteúdo personalizado</li>
          <li>• Use /vincular @perfil no WhatsApp para vincular um perfil</li>
        </ul>
      </div>
    </div>
  );
}
