'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { updateConfiguracao } from './actions'

interface Configuracao {
  id: string
  horarioAbertura: string
  horarioFechamento: string
  mensagemWhatsApp: string
  telefoneNotificacao: string
  senhaAdmin: string
}

interface ConfigClientProps {
  config: Configuracao | null
}

export function ConfigClient({ config: configInicial }: ConfigClientProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const [horarioAbertura, setHorarioAbertura] = useState(configInicial?.horarioAbertura || '08:00')
  const [horarioFechamento, setHorarioFechamento] = useState(configInicial?.horarioFechamento || '11:00')
  const [mensagemWhatsApp, setMensagemWhatsApp] = useState(configInicial?.mensagemWhatsApp || '')
  const [telefoneNotificacao, setTelefoneNotificacao] = useState(configInicial?.telefoneNotificacao || '')
  const [senhaAdmin, setSenhaAdmin] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/cozinha/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data: any = {
      horarioAbertura,
      horarioFechamento,
      mensagemWhatsApp,
      telefoneNotificacao,
    }

    // Só atualizar senha se foi preenchida
    if (senhaAdmin) {
      data.senhaAdmin = senhaAdmin
    }

    const result = await updateConfiguracao(data)
    setLoading(false)

    if (result.success) {
      alert('Configurações salvas com sucesso!')
      setSenhaAdmin('')
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-500 mb-2">
              ⚙️ Configurações
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure o sistema
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Horários */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              🕐 Horários de Funcionamento
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horário de Abertura
                </label>
                <Input
                  type="time"
                  value={horarioAbertura}
                  onChange={(e) => setHorarioAbertura(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horário de Fechamento
                </label>
                <Input
                  type="time"
                  value={horarioFechamento}
                  onChange={(e) => setHorarioFechamento(e.target.value)}
                  required
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Pedidos serão aceitos apenas entre esses horários
            </p>
          </Card>

          {/* WhatsApp */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              💬 Notificações WhatsApp
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Telefone para Notificações
                </label>
                <Input
                  type="tel"
                  value={telefoneNotificacao}
                  onChange={(e) => setTelefoneNotificacao(e.target.value)}
                  placeholder="(61) 99999-9999"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Número que receberá notificações de novos pedidos
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem de Confirmação
                </label>
                <textarea
                  value={mensagemWhatsApp}
                  onChange={(e) => setMensagemWhatsApp(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-600 transition-colors duration-200 min-h-32"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Use {'{nome}'} para inserir o nome do cliente
                </p>
              </div>
            </div>
          </Card>

          {/* Segurança */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              🔐 Segurança
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nova Senha de Acesso
              </label>
              <Input
                type="password"
                value={senhaAdmin}
                onChange={(e) => setSenhaAdmin(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Senha atual: {configInicial?.senhaAdmin || '1234'}
              </p>
            </div>
          </Card>

          {/* Botão Salvar */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Salvando...' : '💾 Salvar Configurações'}
          </Button>
        </form>
      </div>
    </main>
  )
}
