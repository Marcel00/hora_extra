'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateConfig, updateCardapioPreco } from './actions'

interface ConfigClientProps {
  config: {
    horarioAbertura: string
    horarioFechamento: string
    mensagemWhatsApp: string
    telefoneNotificacao: string
  }
  precoMarmita: number
}

export function ConfigClient({ config: initialConfig, precoMarmita: initialPreco }: ConfigClientProps) {
  const [config, setConfig] = useState(initialConfig)
  const [preco, setPreco] = useState(initialPreco)
  const [loading, setLoading] = useState(false)

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await updateConfig(config)
    if (result.success) {
      alert('Configurações salvas com sucesso!')
    } else {
      alert(result.error || 'Erro ao salvar')
    }
    setLoading(false)
  }

  const handlePrecoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await updateCardapioPreco(preco)
    if (result.success) {
      alert('Preço atualizado com sucesso!')
    } else {
      alert(result.error || 'Erro ao atualizar preço')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ajuste as configurações gerais do sistema
        </p>
      </div>

      {/* Horários */}
      <Card>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          ⏰ Horários de Funcionamento
        </h3>
        <form onSubmit={handleConfigSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Horário de Abertura
              </label>
              <Input
                type="time"
                value={config.horarioAbertura}
                onChange={(e) =>
                  setConfig({ ...config, horarioAbertura: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Horário de Fechamento
              </label>
              <Input
                type="time"
                value={config.horarioFechamento}
                onChange={(e) =>
                  setConfig({ ...config, horarioFechamento: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            💾 Salvar Horários
          </Button>
        </form>
      </Card>

      {/* Preço */}
      <Card>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          💰 Preço da Marmita
        </h3>
        <form onSubmit={handlePrecoSubmit} className="space-y-4">
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Preço Unitário (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={(e) => setPreco(parseFloat(e.target.value))}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            💾 Atualizar Preço
          </Button>
        </form>
      </Card>

      {/* WhatsApp */}
      <Card>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          📱 WhatsApp
        </h3>
        <form onSubmit={handleConfigSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Telefone para Notificações
            </label>
            <Input
              type="tel"
              value={config.telefoneNotificacao}
              onChange={(e) =>
                setConfig({ ...config, telefoneNotificacao: e.target.value })
              }
              placeholder="5561999999999"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Formato: código do país + DDD + número (sem espaços ou caracteres
              especiais)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mensagem de Confirmação
            </label>
            <textarea
              value={config.mensagemWhatsApp}
              onChange={(e) =>
                setConfig({ ...config, mensagemWhatsApp: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-600 transition-colors min-h-32"
              placeholder="Use {nome} para o nome do cliente"
            />
          </div>

          <Button type="submit" disabled={loading}>
            💾 Salvar Configurações
          </Button>
        </form>
      </Card>
    </div>
  )
}
