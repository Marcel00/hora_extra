'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  createCardapio,
  updateCardapio,
  deleteCardapio,
  createItemCardapio,
  updateItemCardapio,
  deleteItemCardapio,
} from './actions'

interface ItemCardapio {
  id: string
  nome: string
  categoria: string
  disponivel: boolean
}

interface Cardapio {
  id: string
  data: Date
  ativo: boolean
  preco: number
  itens: ItemCardapio[]
}

interface CardapioClientProps {
  cardapios: Cardapio[]
}

export function CardapioClient({ cardapios }: CardapioClientProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  // const [cardapios] = useState(cardapiosIniciais) // Removido para permitir atualização em tempo real via props
  const [showNovoCardapio, setShowNovoCardapio] = useState(false)
  const [showNovoItem, setShowNovoItem] = useState<string | null>(null)
  
  // Form states
  const [novoCardapioData, setNovoCardapioData] = useState('')
  const [novoCardapioPreco, setNovoCardapioPreco] = useState('20.00')
  const [novoItemNome, setNovoItemNome] = useState('')
  const [novoItemCategoria, setNovoItemCategoria] = useState('acompanhamento')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/cozinha/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleCreateCardapio = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createCardapio({
      data: new Date(novoCardapioData),
      preco: parseFloat(novoCardapioPreco),
    })
    
    if (result.success) {
      setShowNovoCardapio(false)
      setNovoCardapioData('')
      setNovoCardapioPreco('20.00')
      router.refresh()
    }
  }

  const handleToggleCardapioAtivo = async (id: string, ativo: boolean) => {
    await updateCardapio(id, { ativo: !ativo })
    router.refresh()
  }

  const handleDeleteCardapio = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este cardápio?')) {
      await deleteCardapio(id)
      router.refresh()
    }
  }

  // Edit state
  interface EditingItem extends ItemCardapio {
    cardapioId: string
  }
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)

  const handleCreateItem = async (e: React.FormEvent, cardapioId: string) => {
    e.preventDefault()
    const result = await createItemCardapio({
      cardapioId,
      nome: novoItemNome,
      categoria: novoItemCategoria,
    })
    
    if (result.success) {
      resetForm()
      router.refresh()
    }
  }

  const handleUpdateItem = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    const result = await updateItemCardapio(id, { nome: novoItemNome })
    if (result.success) {
      resetForm()
      router.refresh()
    }
  }

  const handleSaveItem = (e: React.FormEvent, cardapioId: string) => {
      if (editingItem) {
          handleUpdateItem(e, editingItem.id)
      } else {
          handleCreateItem(e, cardapioId)
      }
  }

  const startEditing = (item: ItemCardapio, cardapioId: string) => {
      setEditingItem({ ...item, cardapioId })
      setNovoItemNome(item.nome)
      setNovoItemCategoria(item.categoria)
      setShowNovoItem(null) // Fecha novo item se aberto
  }

  const handleCancelEdit = () => {
      resetForm()
  }

  const resetForm = () => {
      setShowNovoItem(null)
      setEditingItem(null)
      setNovoItemNome('')
      setNovoItemCategoria('acompanhamento')
  }

  const handleToggleItemDisponivel = async (id: string, disponivel: boolean) => {
    await updateItemCardapio(id, { disponivel: !disponivel })
    router.refresh()
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      await deleteItemCardapio(id)
      router.refresh()
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const categorias = {
    acompanhamento: '🍚 Acompanhamento',
    proteina: '🍖 Proteína',
    extra: '➕ Extra',
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-500 mb-2">
              📋 Gerenciar Cardápio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crie e gerencie os cardápios diários
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

        {/* Novo Cardápio */}
        <Card className="mb-8">
          {!showNovoCardapio ? (
            <Button onClick={() => setShowNovoCardapio(true)} variant="primary" className="w-full">
              ➕ Novo Cardápio
            </Button>
          ) : (
            <form onSubmit={handleCreateCardapio} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Criar Novo Cardápio
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Data
                  </label>
                  <Input
                    type="date"
                    value={novoCardapioData}
                    onChange={(e) => setNovoCardapioData(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Preço (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoCardapioPreco}
                    onChange={(e) => setNovoCardapioPreco(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  Criar Cardápio
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowNovoCardapio(false)}
                  variant="secondary"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Lista de Cardápios */}
        <div className="space-y-6">
          {cardapios.map((cardapio) => (
            <Card key={cardapio.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {format(new Date(cardapio.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h3>
                    <Badge variant={cardapio.ativo ? 'entregue' : 'default'}>
                      {cardapio.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-500">
                    R$ {cardapio.preco.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleCardapioAtivo(cardapio.id, cardapio.ativo)}
                    variant="secondary"
                    className="text-sm"
                  >
                    {cardapio.ativo ? '❌ Desativar' : '✅ Ativar'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteCardapio(cardapio.id)}
                    variant="danger"
                    className="text-sm"
                  >
                    🗑️ Deletar
                  </Button>
                </div>
              </div>

              {/* Itens por Categoria */}
              <div className="space-y-4">
                {Object.entries(categorias).map(([categoria, label]) => {
                  const itens = cardapio.itens.filter((item) => item.categoria === categoria)
                  
                  return (
                    <div key={categoria}>
                      <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {label}
                      </h4>
                      <div className="space-y-2">
                        {itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-800 dark:text-gray-200">{item.nome}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleToggleItemDisponivel(item.id, item.disponivel)}
                                size="sm"
                                variant={item.disponivel ? "secondary" : "danger"}
                                className="text-xs"
                                title="Define se o item aparece para o cliente"
                              >
                                {item.disponivel ? '✅ Disponível' : '❌ Esgotado'}
                              </Button>
                              <Button
                                onClick={() => startEditing(item, cardapio.id)}
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                title="Editar nome"
                              >
                                ✏️
                              </Button>
                              <Button
                                onClick={() => handleDeleteItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-600 hover:bg-red-50"
                                title="Excluir item"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Adicionar ou Editar Item */}
                        {showNovoItem === `${cardapio.id}-${categoria}` || (editingItem && editingItem.cardapioId === cardapio.id && editingItem.categoria === categoria) ? (
                          <form
                            onSubmit={(e) => handleSaveItem(e, cardapio.id)}
                            className="p-3 bg-gray-100 dark:bg-gray-600 rounded-lg space-y-2 border-2 border-orange-200 dark:border-orange-800"
                          >
                            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {editingItem ? '✏️ Editar Item' : '➕ Novo Item'}
                            </h5>
                            <Input
                              placeholder="Nome do item"
                              value={novoItemNome}
                              onChange={(e) => setNovoItemNome(e.target.value)}
                              autoFocus
                              required
                            />
                            <div className="flex gap-2">
                              <Button type="submit" variant="primary" className="text-sm">
                                {editingItem ? 'Salvar' : 'Adicionar'}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCancelEdit}
                                variant="secondary"
                                className="text-sm"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button
                            onClick={() => {
                              resetForm()
                              setShowNovoItem(`${cardapio.id}-${categoria}`)
                              setNovoItemCategoria(categoria)
                            }}
                            variant="ghost"
                            className="w-full text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          >
                            ➕ Adicionar {label.split(' ')[1]}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}


          {cardapios.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Nenhum cardápio cadastrado. Crie o primeiro cardápio acima!
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
