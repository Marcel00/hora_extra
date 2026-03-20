'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PedidoCard } from '@/components/PedidoCard'
import { updatePedidoStatus } from './actions'
import { PrintableReceipt } from '@/components/PrintableReceipt'

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

interface CozinhaClientProps {
  pedidos: Pedido[]
  pontosEntrega: { id: string; nome: string }[]
}

export function CozinhaClient({ pedidos: pedidosIniciais, pontosEntrega }: CozinhaClientProps) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [filtroPonto, setFiltroPonto] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<'ativos' | 'pendente' | 'preparado' | 'entregue'>('ativos')
  const [printingOrder, setPrintingOrder] = useState<Pedido | null>(null)

  // Intervalo para "hoje e ontem" (hora local do navegador).
  const rangeHojeOntem = (() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)

    const fimHoje = new Date(hoje)
    fimHoje.setHours(23, 59, 59, 999)

    return { inicioOntem: ontem, inicioHoje: hoje, fimHoje }
  })()

  const pedidoEntregueHojeOuOntem = (pedido: Pedido) => {
    if (pedido.status !== 'entregue') return false
    const dataPedido = new Date(pedido.createdAt)
    return dataPedido >= rangeHojeOntem.inicioOntem && dataPedido <= rangeHojeOntem.fimHoje
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/cozinha/login')
    }
  }, [isAuthenticated, router])

  // Quando o Next refresh/recarrega os dados do server,
  // sincroniza o estado para garantir novos pedidos e manter a ordenação.
  useEffect(() => {
    setPedidos(pedidosIniciais)
  }, [pedidosIniciais])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleUpdateStatus = async (numero: number, novoStatus: string) => {
    const result = await updatePedidoStatus(numero, novoStatus)
    if (result.success) {
      setPedidos(pedidos.map(p => 
        p.numero === numero ? { ...p, status: novoStatus } : p
      ))
      router.refresh()
    }
  }

  const handlePrint = (pedido: Pedido) => {
    setPrintingOrder(pedido)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const pedidosAtivos = pedidos.filter(p => ['pendente', 'preparado'].includes(p.status))

  const matchStatus = (pedido: Pedido) => {
    if (filtroStatus === 'ativos') return ['pendente', 'preparado'].includes(pedido.status)
    if (filtroStatus === 'entregue') return pedidoEntregueHojeOuOntem(pedido)
    return pedido.status === filtroStatus
  }

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchPonto = filtroPonto === 'todos' || pedido.pontoEntrega.nome === filtroPonto
    return matchStatus(pedido) && matchPonto
  }).sort((a, b) => {
    const tA = new Date(a.createdAt).getTime()
    const tB = new Date(b.createdAt).getTime()
    return tB - tA
  })

  const estatisticas = {
    totalAtivos: pedidosAtivos.length,
    pendentes: pedidos.filter(p => p.status === 'pendente').length,
    preparados: pedidos.filter(p => p.status === 'preparado').length,
    entreguesHoje: pedidos.filter(p => pedidoEntregueHojeOuOntem(p)).length,
  }

  // ... (auth checks)

  return (
    <>
      {/* ... styles ... */}
      
      <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 no-print">
        <ThemeToggle />
        
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-500 mb-1 sm:mb-2 truncate">
                👨‍🍳 Painel da Cozinha
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Gestão de pedidos em tempo real
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 sm:flex-nowrap" aria-label="Navegação">
              <Button onClick={() => router.push('/cozinha/historico')} variant="secondary" className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none">
                📜 Histórico
              </Button>
              <Button onClick={() => router.push('/cozinha/cardapio')} variant="primary" className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none">
                📋 Cardápio
              </Button>
              <Button onClick={() => router.push('/cozinha/pontos')} variant="primary" className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none">
                📍 Pontos
              </Button>
              <Button onClick={() => router.push('/cozinha/config')} variant="primary" className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none">
                ⚙️ Config
              </Button>
              <Button onClick={handleLogout} variant="secondary" className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-none">
                🚪 Sair
              </Button>
            </nav>
          </div>

          {/* Dashboard Status - clicável como filtro */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => setFiltroStatus('pendente')}
              className={`text-left rounded-xl border-2 transition-all duration-200 relative overflow-hidden p-3 sm:p-4 min-h-[80px] sm:min-h-0 ${
                filtroStatus === 'pendente'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-500 ring-2 ring-yellow-400/50'
                  : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600'
              }`}
            >
              <div className="absolute top-0 right-0 p-1 sm:p-2 opacity-10 text-4xl sm:text-6xl">⏳</div>
              <p className="text-xs sm:text-sm font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-0.5 sm:mb-1">Pendentes</p>
              <p className="text-2xl sm:text-4xl font-black text-yellow-600 dark:text-yellow-500">{estatisticas.pendentes}</p>
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('preparado')}
              className={`text-left rounded-xl border-2 transition-all duration-200 relative overflow-hidden p-3 sm:p-4 min-h-[80px] sm:min-h-0 ${
                filtroStatus === 'preparado'
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-400/50'
                  : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600'
              }`}
            >
              <div className="absolute top-0 right-0 p-1 sm:p-2 opacity-10 text-4xl sm:text-6xl">🍳</div>
              <p className="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider mb-0.5 sm:mb-1">Preparando</p>
              <p className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-500">{estatisticas.preparados}</p>
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('ativos')}
              className={`text-left rounded-xl border-2 transition-all duration-200 p-3 sm:p-4 min-h-[80px] sm:min-h-0 ${
                filtroStatus === 'ativos'
                  ? 'bg-gray-100 dark:bg-gray-700 border-gray-500 dark:border-gray-400 ring-2 ring-gray-400/50'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Total Ativos</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">{estatisticas.totalAtivos}</p>
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('entregue')}
              className={`text-left rounded-xl border-2 transition-all duration-200 p-3 sm:p-4 min-h-[80px] sm:min-h-0 ${
                filtroStatus === 'entregue'
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500 ring-2 ring-green-400/50 opacity-100'
                  : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 opacity-75 hover:opacity-100'
              }`}
            >
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-500 mb-0.5 sm:mb-1">Entregues Hoje e Ontem</p>
              <p className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-500">{estatisticas.entreguesHoje}</p>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 shrink-0">
                {filtroStatus === 'entregue' ? '✅ Entregues Hoje e Ontem' : filtroStatus === 'pendente' ? '⏳ Pendentes' : filtroStatus === 'preparado' ? '🍳 Em Preparo' : '📋 Pedidos em Aberto'}
                <span className="bg-gray-200 dark:bg-gray-700 text-xs sm:text-sm px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                  {pedidosFiltrados.length}
                </span>
             </h2>
             <div className="w-full sm:w-auto sm:min-w-[200px]">
                <Select
                  value={filtroPonto}
                  onChange={(e) => setFiltroPonto(e.target.value)}
                  className="w-full min-h-[44px]"
                >
                  <option value="todos">Todos os Pontos</option>
                  {pontosEntrega.map((ponto) => (
                    <option key={ponto.id} value={ponto.nome}>
                      {ponto.nome}
                    </option>
                  ))}
                </Select>
             </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="mb-6 sm:mb-8">
            {pedidosFiltrados.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Nenhum pedido encontrado com os filtros selecionados
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pedidosFiltrados.map((pedido) => (
                  <PedidoCard
                    key={pedido.numero}
                    pedido={pedido}
                    onUpdateStatus={handleUpdateStatus}
                    onPrint={handlePrint}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <div className="hidden print:block">
        <PrintableReceipt pedido={printingOrder} />
      </div>
    </>
  )
}
