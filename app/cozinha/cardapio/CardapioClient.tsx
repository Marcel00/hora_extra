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
  createTamanho,
  updateTamanho,
  deleteTamanho,
} from './actions'

interface ItemCardapio {
  id: string
  nome: string
  categoria: string
  disponivel: boolean
}

interface Tamanho {
  id: string
  nome: string
  preco: number
  ativo: boolean
  cardapioId: string
}

interface Cardapio {
  id: string
  data: Date
  ativo: boolean
  preco: number
  itens: ItemCardapio[]
  tamanhos: Tamanho[]
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

  // Tamanho states
  const [showNovoTamanho, setShowNovoTamanho] = useState<string | null>(null)
  const [novoTamanhoNome, setNovoTamanhoNome] = useState('')
  const [novoTamanhoPreco, setNovoTamanhoPreco] = useState('')

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
      setShowNovoTamanho(null)
      setNovoTamanhoNome('')
      setNovoTamanhoPreco('')
  }
  
  // Handlers para Tamanhos
  const handleCreateTamanho = async (e: React.FormEvent, cardapioId: string) => {
    e.preventDefault()
    if (!novoTamanhoNome || !novoTamanhoPreco) return
    
    const result = await createTamanho({
      cardapioId,
      nome: novoTamanhoNome,
      preco: parseFloat(novoTamanhoPreco),
      ativo: true,
    })
    
    if (result.success) {
      resetForm()
      router.refresh()
    }
  }

  const handleDeleteTamanho = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este tamanho?')) {
      await deleteTamanho(id)
      router.refresh()
    }
  }

  const handleToggleTamanho = async (id: string, ativo: boolean) => {
    await updateTamanho(id, { ativo: !ativo })
    router.refresh()
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
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-500 mb-1 sm:mb-2">
              📋 Gerenciar Cardápio
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Crie e gerencie os cardápios diários
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={() => router.push('/cozinha')} variant="secondary" className="min-h-[44px] flex-1 sm:flex-none">
              ← Voltar
            </Button>
            <Button onClick={handleLogout} variant="secondary" className="min-h-[44px] flex-1 sm:flex-none">
              🚪 Sair
            </Button>
          </div>
        </div>

        {/* Novo Cardápio */}
        <Card className="mb-6 sm:mb-8">
          {!showNovoCardapio ? (
            <Button onClick={() => setShowNovoCardapio(true)} variant="primary" className="w-full min-h-[48px]">
              ➕ Novo Cardápio
            </Button>
          ) : (
            <form onSubmit={handleCreateCardapio} className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                Criar Novo Cardápio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" variant="primary" className="min-h-[44px] flex-1 sm:flex-none">
                  Criar Cardápio
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowNovoCardapio(false)}
                  variant="secondary"
                  className="min-h-[44px] flex-1 sm:flex-none"
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {format(new Date(cardapio.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h3>
                    <Badge variant={cardapio.ativo ? 'entregue' : 'default'}>
                      {cardapio.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-orange-600 dark:text-orange-500">
                    R$ {cardapio.preco.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    onClick={() => handleToggleCardapioAtivo(cardapio.id, cardapio.ativo)}
                    variant="secondary"
                    className="text-sm min-h-[44px] min-w-[44px] sm:min-w-0"
                  >
                    {cardapio.ativo ? '❌ Desativar' : '✅ Ativar'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteCardapio(cardapio.id)}
                    variant="danger"
                    className="text-sm min-h-[44px] min-w-[44px] sm:min-w-0"
                  >
                    🗑️ Deletar
                  </Button>
                </div>
              </div>

              {/* Seção de Tamanhos */}
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                <h4 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                  📏 Tamanhos e Preços
                </h4>
                
                <div className="space-y-2 mb-3">
                  {cardapio.tamanhos && cardapio.tamanhos.map((tamanho) => (
                    <div 
                      key={tamanho.id} 
                      className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg ${
                        tamanho.ativo ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                      } border border-orange-100 dark:border-orange-900/20`}
                    >
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{tamanho.nome}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-bold">R$ {tamanho.preco.toFixed(2)}</span>
                        {!tamanho.ativo && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Inativo</span>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleToggleTamanho(tamanho.id, tamanho.ativo)}
                          title={tamanho.ativo ? 'Desativar' : 'Ativar'}
                          className="min-h-[40px] min-w-[40px]"
                        >
                          {tamanho.ativo ? '✅' : '🚫'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 min-h-[40px] min-w-[40px]"
                          onClick={() => handleDeleteTamanho(tamanho.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {(!cardapio.tamanhos || cardapio.tamanhos.length === 0) && (
                    <p className="text-sm text-orange-600/70 italic">
                      Nenhum tamanho definido. O preço padrão será R$ {cardapio.preco.toFixed(2)}.
                    </p>
                  )}
                </div>

                {showNovoTamanho === cardapio.id ? (
                  <form onSubmit={(e) => handleCreateTamanho(e, cardapio.id)} className="flex flex-col gap-2 sm:flex-row sm:items-end bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-orange-200">
                    <div className="flex-1 w-full sm:min-w-0">
                      <Input
                        placeholder="Nome (ex: P, M, G)"
                        value={novoTamanhoNome}
                        onChange={(e) => setNovoTamanhoNome(e.target.value)}
                        required
                        className="min-h-[44px] text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="w-full sm:w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Preço"
                        value={novoTamanhoPreco}
                        onChange={(e) => setNovoTamanhoPreco(e.target.value)}
                        required
                        className="min-h-[44px] text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" size="sm" className="min-h-[44px] flex-1 sm:flex-none">
                        Salvar
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="min-h-[44px] flex-1 sm:flex-none"
                        onClick={() => {
                          setShowNovoTamanho(null)
                          setNovoTamanhoNome('')
                          setNovoTamanhoPreco('')
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full min-h-[44px] border-dashed border-orange-300 text-orange-700 hover:bg-orange-50"
                    onClick={() => setShowNovoTamanho(cardapio.id)}
                  >
                    ➕ Adicionar Tamanho
                  </Button>
                )}
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
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{item.nome}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <Button
                                onClick={() => handleToggleItemDisponivel(item.id, item.disponivel)}
                                size="sm"
                                variant={item.disponivel ? "secondary" : "danger"}
                                className="text-xs min-h-[40px] min-w-[40px] sm:min-w-0"
                                title="Define se o item aparece para o cliente"
                              >
                                {item.disponivel ? '✅ Disponível' : '❌ Esgotado'}
                              </Button>
                              <Button
                                onClick={() => startEditing(item, cardapio.id)}
                                size="sm"
                                variant="ghost"
                                className="text-xs min-h-[40px] min-w-[40px]"
                                title="Editar nome"
                              >
                                ✏️
                              </Button>
                              <Button
                                onClick={() => handleDeleteItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-600 hover:bg-red-50 min-h-[40px] min-w-[40px]"
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
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button type="submit" variant="primary" className="text-sm min-h-[44px] flex-1 sm:flex-none">
                                {editingItem ? 'Salvar' : 'Adicionar'}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCancelEdit}
                                variant="secondary"
                                className="text-sm min-h-[44px] flex-1 sm:flex-none"
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
