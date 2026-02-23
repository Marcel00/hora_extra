'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { PedidoCard } from '@/components/PedidoCard'
import { updatePedidoStatus } from '../actions'

interface Pedido {
  numero: number
  nomeCliente: string
  telefone: string | null
  quantidade: number
  itens: string
  acompanhamentosSelecionados?: string | null
  itensRemovidos?: string | null
  observacoes: string | null
  valorTotal: number
  status: string
  tamanhoNome?: string | null
  pontoEntrega: {
    nome: string
    horario: string
  }
  createdAt: Date
}

interface HistoricoClientProps {
  pedidos: Pedido[]
  pontosEntrega: { id: string; nome: string }[]
}

export function HistoricoClient({ pedidos: pedidosIniciais, pontosEntrega }: HistoricoClientProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroPonto, setFiltroPonto] = useState<string>('todos')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/cozinha/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleUpdateStatus = async (numero: number, novoStatus: string) => {
    if (confirm('Tem certeza que deseja alterar o status deste pedido antigo?')) {
        const result = await updatePedidoStatus(numero, novoStatus)
        if (result.success) {
        setPedidos(pedidos.map(p => 
            p.numero === numero ? { ...p, status: novoStatus } : p
        ))
        router.refresh()
        }
    }
  }

  // Filtragem
  const pedidosFiltrados = pedidos.filter(pedido => {
    const isHistoric = ['entregue', 'cancelado'].includes(pedido.status)
    // Se o filtro for 'todos', mostra apenas os status históricos (entregue/cancelado)
    // Se selecionado um status, respeita o filtro (desde que seja um status histórico ou se quiser ver tudo, aí teria que ajustar)
    // Vamos simplificar: Lista tudo que é passado.
    
    // Na verdade, a página recebe TODOS os pedidos do banco.
    // Vamos filtrar para mostrar PRIMEIRAMENTE os entregues/cancelados.
    
    let matchStatus = true
    if (filtroStatus === 'todos') {
         matchStatus = ['entregue', 'cancelado'].includes(pedido.status)
    } else {
        matchStatus = pedido.status === filtroStatus
    }

    const matchPonto = filtroPonto === 'todos' || pedido.pontoEntrega.nome === filtroPonto
    return matchStatus && matchPonto
  })

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2">
              📜 Histórico de Pedidos
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Visualize pedidos entregues e cancelados
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={() => router.push('/cozinha')} variant="primary" className="min-h-[44px] flex-1 sm:flex-none">
              ⬅️ Voltar para Cozinha
            </Button>
            <Button onClick={handleLogout} variant="secondary" className="min-h-[44px] flex-1 sm:flex-none">
              🚪 Sair
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
             <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="min-h-[44px] w-full"
              >
                <option value="todos">Entregues e Cancelados</option>
                <option value="entregue">Apenas Entregues</option>
                <option value="cancelado">Apenas Cancelados</option>
                <option value="pendente">Ver Pendentes (Atuais)</option>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ponto de Entrega
              </label>
              <Select
                value={filtroPonto}
                onChange={(e) => setFiltroPonto(e.target.value)}
                className="min-h-[44px] w-full"
              >
                <option value="todos">Todos</option>
                {pontosEntrega.map((ponto) => (
                  <option key={ponto.id} value={ponto.nome}>
                    {ponto.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Lista */}
        <div className="grid gap-4">
            {pedidosFiltrados.length === 0 ? (
                 <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado no histórico.</p>
            ) : (
                pedidosFiltrados.map((pedido) => (
                    <PedidoCard
                        key={pedido.numero}
                        pedido={pedido}
                        onUpdateStatus={handleUpdateStatus}
                        // Sem botão de imprimir no histórico por padrão, mas poderia ter
                    />
                ))
            )}
        </div>
      </div>
    </main>
  )
}
