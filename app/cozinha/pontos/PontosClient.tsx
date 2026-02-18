'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  createPontoEntrega,
  updatePontoEntrega,
  deletePontoEntrega,
} from './actions'

interface PontoEntrega {
  id: string
  nome: string
  horario: string
  ativo: boolean
  _count: {
    pedidos: number
  }
}

interface PontosClientProps {
  pontos: PontoEntrega[]
}

export function PontosClient({ pontos: pontosIniciais }: PontosClientProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const [showNovo, setShowNovo] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  
  // Form states
  const [novoNome, setNovoNome] = useState('')
  const [novoHorario, setNovoHorario] = useState('')
  const [editNome, setEditNome] = useState('')
  const [editHorario, setEditHorario] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/cozinha/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createPontoEntrega({
      nome: novoNome,
      horario: novoHorario,
    })
    
    if (result.success) {
      setShowNovo(false)
      setNovoNome('')
      setNovoHorario('')
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleUpdate = async (id: string) => {
    const result = await updatePontoEntrega(id, {
      nome: editNome,
      horario: editHorario,
    })
    
    if (result.success) {
      setEditando(null)
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    await updatePontoEntrega(id, { ativo: !ativo })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este ponto de entrega?')) {
      const result = await deletePontoEntrega(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    }
  }

  const startEdit = (ponto: PontoEntrega) => {
    setEditando(ponto.id)
    setEditNome(ponto.nome)
    setEditHorario(ponto.horario)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-500 mb-2">
              📍 Pontos de Entrega
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie os locais de entrega
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/cozinha')} variant="secondary">
              ← Voltar
            </Button>
            <Button onClick={handleLogout} variant="secondary">
              🚪 Sair
            </Button>
          </div>
        </div>

        {/* Novo Ponto */}
        <Card className="mb-8">
          {!showNovo ? (
            <Button onClick={() => setShowNovo(true)} variant="primary" className="w-full">
              ➕ Novo Ponto de Entrega
            </Button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Criar Novo Ponto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Local
                  </label>
                  <Input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Quiosque Laranjinha"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Horário de Entrega
                  </label>
                  <Input
                    type="text"
                    value={novoHorario}
                    onChange={(e) => setNovoHorario(e.target.value)}
                    placeholder="Ex: 11h30"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  Criar Ponto
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowNovo(false)}
                  variant="secondary"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Lista de Pontos */}
        <div className="space-y-4">
          {pontosIniciais.map((ponto) => (
            <Card key={ponto.id}>
              {editando === ponto.id ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Editar Ponto
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nome do Local
                      </label>
                      <Input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Horário de Entrega
                      </label>
                      <Input
                        type="text"
                        value={editHorario}
                        onChange={(e) => setEditHorario(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(ponto.id)} variant="primary">
                      Salvar
                    </Button>
                    <Button onClick={() => setEditando(null)} variant="secondary">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        📍 {ponto.nome}
                      </h3>
                      <Badge variant={ponto.ativo ? 'entregue' : 'default'}>
                        {ponto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      🕐 Entrega às {ponto.horario}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {ponto._count.pedidos} pedido(s) associado(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEdit(ponto)}
                      variant="secondary"
                      className="text-sm"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      onClick={() => handleToggleAtivo(ponto.id, ponto.ativo)}
                      variant="secondary"
                      className="text-sm"
                    >
                      {ponto.ativo ? '❌ Desativar' : '✅ Ativar'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(ponto.id)}
                      variant="danger"
                      className="text-sm"
                    >
                      🗑️ Deletar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {pontosIniciais.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Nenhum ponto de entrega cadastrado. Crie o primeiro ponto acima!
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
