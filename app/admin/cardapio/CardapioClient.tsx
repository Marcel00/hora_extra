'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  createItem,
  updateItem,
  deleteItem,
  toggleItemDisponibilidade,
} from './actions'

interface Item {
  id: string
  nome: string
  categoria: string
  disponivel: boolean
  maxSelecoes: number
}

interface CardapioClientProps {
  cardapioId: string
  itens: Item[]
}

export function CardapioClient({ cardapioId, itens: initialItens }: CardapioClientProps) {
  const [itens, setItens] = useState(initialItens)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'acompanhamento',
    disponivel: true,
    maxSelecoes: 99,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      const result = await updateItem(editingItem.id, formData)
      if (result.success) {
        setItens(
          itens.map((i) =>
            i.id === editingItem.id ? { ...i, ...formData } : i
          )
        )
        resetForm()
      }
    } else {
      const result = await createItem(cardapioId, formData)
      if (result.success) {
        resetForm()
        window.location.reload()
      }
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      nome: item.nome,
      categoria: item.categoria,
      disponivel: item.disponivel,
      maxSelecoes: item.maxSelecoes,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    const result = await deleteItem(id)
    if (result.success) {
      setItens(itens.filter((i) => i.id !== id))
    }
  }

  const handleToggle = async (id: string) => {
    const result = await toggleItemDisponibilidade(id)
    if (result.success) {
      setItens(
        itens.map((i) =>
          i.id === id ? { ...i, disponivel: !i.disponivel } : i
        )
      )
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      nome: '',
      categoria: 'acompanhamento',
      disponivel: true,
      maxSelecoes: 99,
    })
    setShowForm(false)
  }

  const categoriaLabels: Record<string, string> = {
    acompanhamento: '🍚 Acompanhamento',
    proteina: '🍖 Proteína',
    extra: '➕ Extra',
  }

  const itensGrouped = {
    proteina: itens.filter((i) => i.categoria === 'proteina'),
    acompanhamento: itens.filter((i) => i.categoria === 'acompanhamento'),
    extra: itens.filter((i) => i.categoria === 'extra'),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Gerenciar Cardápio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Adicione, edite ou remova itens do cardápio
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? '✖️ Cancelar' : '➕ Novo Item'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {editingItem ? 'Editar Item' : 'Novo Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Item
                </label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Arroz, Frango Grelhado"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <Select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                >
                  <option value="acompanhamento">🍚 Acompanhamento</option>
                  <option value="proteina">🍖 Proteína</option>
                  <option value="extra">➕ Extra</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Limite de Seleção
                </label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.maxSelecoes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSelecoes: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quantidade máxima que pode ser selecionada desta categoria
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disponivel}
                    onChange={(e) =>
                      setFormData({ ...formData, disponivel: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Disponível
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editingItem ? '💾 Salvar' : '➕ Adicionar'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {Object.entries(itensGrouped).map(([categoria, items]) => (
        <Card key={categoria}>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {categoriaLabels[categoria]}
          </h3>

          {items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Nenhum item nesta categoria
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    item.disponivel
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">
                      {item.nome}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Limite: {item.maxSelecoes} seleções
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggle(item.id)}
                    >
                      {item.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️ Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
