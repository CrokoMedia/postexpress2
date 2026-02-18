'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, UserCheck, RefreshCw, Pencil, X, Check } from 'lucide-react'

interface UserRow {
  user_id: string
  email: string
  role: 'admin' | 'client'
  profiles: Array<{ id: string; username: string }>
  created_at: string
}

interface Profile {
  id: string
  username: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingProfileIds, setEditingProfileIds] = useState<string[]>([])

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'client' as 'admin' | 'client',
    profile_ids: [] as string[],
  })
  const [formError, setFormError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }, [])

  const fetchProfiles = useCallback(async () => {
    const res = await fetch('/api/profiles')
    const data = await res.json()
    setProfiles(data.profiles || [])
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchProfiles()
  }, [fetchUsers, fetchProfiles])

  function toggleProfile(pid: string, ids: string[], setIds: (v: string[]) => void) {
    setIds(ids.includes(pid) ? ids.filter(i => i !== pid) : [...ids, pid])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setCreating(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          profile_ids: form.role === 'client' ? form.profile_ids : [],
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Erro ao criar usuário')
        return
      }

      setShowForm(false)
      setForm({ email: '', password: '', role: 'client', profile_ids: [] })
      await fetchUsers()
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveProfiles(userId: string) {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, profile_ids: editingProfileIds }),
    })
    if (res.ok) {
      setEditingUserId(null)
      await fetchUsers()
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Deletar este usuário? Esta ação não pode ser desfeita.')) return
    const res = await fetch(`/api/admin/users?user_id=${userId}`, { method: 'DELETE' })
    if (res.ok) await fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50">Gerenciar Usuários</h1>
          <p className="text-neutral-400 text-sm mt-1">Crie e gerencie acessos ao Post Express</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-50 hover:border-neutral-600 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white transition"
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-lg font-semibold text-neutral-50 mb-4">Criar Novo Usuário</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="usuario@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'client', profile_ids: [] }))}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="client">Cliente</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {form.role === 'client' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Perfis vinculados
                  <span className="text-neutral-500 font-normal ml-1">(pode selecionar vários)</span>
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {profiles.map(p => (
                    <label key={p.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.profile_ids.includes(p.id)}
                        onChange={() => toggleProfile(p.id, form.profile_ids, ids => setForm(f => ({ ...f, profile_ids: ids })))}
                        className="rounded border-neutral-600 accent-primary-500"
                      />
                      <span className="text-sm text-neutral-300">@{p.username}</span>
                    </label>
                  ))}
                  {profiles.length === 0 && (
                    <p className="text-sm text-neutral-500 px-3 py-2">Nenhum perfil disponível</p>
                  )}
                </div>
              </div>
            )}

            {formError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition"
              >
                {creating ? 'Criando...' : 'Criar Usuário'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError('') }}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Perfis Vinculados</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Criado em</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Carregando...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Nenhum usuário cadastrado</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.user_id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="px-4 py-3 text-neutral-50">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}>
                      <UserCheck className="h-3 w-3" />
                      {user.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingUserId === user.user_id ? (
                      <div className="space-y-1">
                        {profiles.map(p => (
                          <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProfileIds.includes(p.id)}
                              onChange={() => toggleProfile(p.id, editingProfileIds, setEditingProfileIds)}
                              className="rounded border-neutral-600 accent-primary-500"
                            />
                            <span className="text-xs text-neutral-300">@{p.username}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.profiles.length === 0 ? (
                          <span className="text-neutral-500">—</span>
                        ) : (
                          user.profiles.map(p => (
                            <span key={p.id} className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
                              @{p.username}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editingUserId === user.user_id ? (
                        <>
                          <button
                            onClick={() => handleSaveProfiles(user.user_id)}
                            className="rounded p-1.5 text-green-400 hover:bg-green-500/10 transition"
                            title="Salvar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="rounded p-1.5 text-neutral-500 hover:text-neutral-300 transition"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {user.role === 'client' && (
                            <button
                              onClick={() => {
                                setEditingUserId(user.user_id)
                                setEditingProfileIds(user.profiles.map(p => p.id))
                              }}
                              className="rounded p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700 transition"
                              title="Editar perfis"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.user_id)}
                            className="rounded p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Deletar usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
