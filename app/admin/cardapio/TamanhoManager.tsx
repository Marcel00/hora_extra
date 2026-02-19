'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  createTamanho,
  updateTamanho,
  deleteTamanho,
  toggleTamanhoAtivo,
} from './actions'

interface Tamanho {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

interface TamanhoManagerProps {
  cardapioId: string
  tamanhos: Tamanho[]
}

export function TamanhoManager({ cardapioId, tamanhos: initialTamanhos }: TamanhoManagerProps) {
  const [tamanhos, setTamanhos] = useState(initialTamanhos)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Tamanho | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    preco: 0,
    ativo: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      const result = await updateTamanho(editingItem.id, formData)
      if (result.success) {
        setTamanhos(
          tamanhos.map((t) =>
            t.id === editingItem.id ? { ...t, ...formData } : t
          )
        )
        resetForm()
      }
    } else {
      const result = await createTamanho(cardapioId, formData)
      if (result.success) {
        resetForm()
        window.location.reload()
      }
    }
  }

  const handleEdit = (tamanho: Tamanho) => {
    setEditingItem(tamanho)
    setFormData({
      nome: tamanho.nome,
      preco: tamanho.preco,
      ativo: tamanho.ativo,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tamanho?')) return

    const result = await deleteTamanho(id)
    if (result.success) {
      setTamanhos(tamanhos.filter((t) => t.id !== id))
    }
  }

  const handleToggle = async (id: string) => {
    const result = await toggleTamanhoAtivo(id)
    if (result.success) {
      setTamanhos(
        tamanhos.map((t) =>
          t.id === id ? { ...t, ativo: !t.ativo } : t
        )
      )
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      nome: '',
      preco: 0,
      ativo: true,
    })
    setShowForm(false)
  }

  return (
    <Card className="mb-8 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            📏 Tamanhos de Marmita
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Defina os tamanhos e preços disponíveis para este cardápio
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="secondary" size="sm">
          {showForm ? 'Cancelar' : '➕ Novo Tamanho'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
           <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                 Nome (ex: Pequena)
               </label>
               <Input
                 value={formData.nome}
                 onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                 placeholder="Nome do tamanho"
                 required
               />
             </div>
             <div className="w-32">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                 Preço (R$)
               </label>
               <Input
                 type="number"
                 step="0.01"
                 value={formData.preco}
                 onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })}
                 required
               />
             </div>
             <Button type="submit" variant="primary">
               {editingItem ? 'Salvar' : 'Adicionar'}
             </Button>
           </form>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tamanhos.map((tamanho) => (
          <div
            key={tamanho.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              tamanho.ativo
                ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'
            }`}
          >
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100">{tamanho.nome}</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                R$ {tamanho.preco.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(tamanho.id)}
                  title={tamanho.ativo ? "Desativar" : "Ativar"}
                >
                  {tamanho.ativo ? '✅' : '🚫'}
                </Button>
              <Button size="sm" variant="ghost" onClick={() => handleEdit(tamanho)} title="Editar">
                ✏️
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(tamanho.id)} title="Excluir">
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
