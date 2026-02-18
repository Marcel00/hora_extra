'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  createPonto,
  updatePonto,
  deletePonto,
  togglePontoAtivo,
} from './actions'

interface Ponto {
  id: string
  nome: string
  horario: string
  ativo: boolean
}

interface PontosClientProps {
  pontos: Ponto[]
}

export function PontosClient({ pontos: initialPontos }: PontosClientProps) {
  const [pontos, setPontos] = useState(initialPontos)
  const [showForm, setShowForm] = useState(false)
  const [editingPonto, setEditingPonto] = useState<Ponto | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    horario: '',
    ativo: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPonto) {
      const result = await updatePonto(editingPonto.id, formData)
      if (result.success) {
        setPontos(
          pontos.map((p) =>
            p.id === editingPonto.id ? { ...p, ...formData } : p
          )
        )
        resetForm()
      }
    } else {
      const result = await createPonto(formData)
      if (result.success) {
        resetForm()
        window.location.reload()
      }
    }
  }

  const handleEdit = (ponto: Ponto) => {
    setEditingPonto(ponto)
    setFormData({
      nome: ponto.nome,
      horario: ponto.horario,
      ativo: ponto.ativo,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ponto de entrega?'))
      return

    const result = await deletePonto(id)
    if (result.success) {
      setPontos(pontos.filter((p) => p.id !== id))
    }
  }

  const handleToggle = async (id: string) => {
    const result = await togglePontoAtivo(id)
    if (result.success) {
      setPontos(pontos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)))
    }
  }

  const resetForm = () => {
    setEditingPonto(null)
    setFormData({
      nome: '',
      horario: '',
      ativo: true,
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Pontos de Entrega
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os locais de entrega disponíveis
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? '✖️ Cancelar' : '➕ Novo Ponto'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {editingPonto ? 'Editar Ponto' : 'Novo Ponto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Ponto
                </label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Quiosque Laranjinha, Cebraspe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horário de Entrega
                </label>
                <Input
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                  placeholder="Ex: 11h30, 12h00"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) =>
                      setFormData({ ...formData, ativo: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ativo
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editingPonto ? '💾 Salvar' : '➕ Adicionar'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Pontos Cadastrados
        </h3>

        {pontos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhum ponto de entrega cadastrado
          </p>
        ) : (
          <div className="space-y-3">
            {pontos.map((ponto) => (
              <div
                key={ponto.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  ponto.ativo
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700'
                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                    📍 {ponto.nome}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🕐 Entrega às {ponto.horario}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggle(ponto.id)}
                  >
                    {ponto.ativo ? '✅ Ativo' : '❌ Inativo'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(ponto)}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(ponto.id)}
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
