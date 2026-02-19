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
  observacoes: string | null
  valorTotal: number
  status: string
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
  // const [printingOrder, setPrintingOrder] = useState<Pedido | null>(null) // Removido por enquanto se não for usar

  const [printingOrder, setPrintingOrder] = useState<Pedido | null>(null)

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

  // Filtro padrão: Apenas pedidos "ativos" (pendente, preparado)
  const pedidosAtivos = pedidos.filter(p => ['pendente', 'preparado'].includes(p.status))
  
  // Filtragem local baseada na seleção
  const pedidosFiltrados = pedidos.filter(pedido => {
    // if (filtroStatus === 'todos') {
    //   return ['pendente', 'preparado'].includes(pedido.status)
    // }
    // Apenas ativos nesta tela
    const isActive = ['pendente', 'preparado'].includes(pedido.status)
    const matchPonto = filtroPonto === 'todos' || pedido.pontoEntrega.nome === filtroPonto
    return isActive && matchPonto
  })

  const estatisticas = {
    totalAtivos: pedidosAtivos.length,
    pendentes: pedidos.filter(p => p.status === 'pendente').length,
    preparados: pedidos.filter(p => p.status === 'preparado').length,
    entreguesHoje: pedidos.filter(p => p.status === 'entregue').length,
  }

  // ... (auth checks)

  return (
    <>
      {/* ... styles ... */}
      
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 no-print">
        <ThemeToggle />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-500 mb-2">
                👨‍🍳 Painel da Cozinha
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestão de pedidos em tempo real
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => router.push('/cozinha/historico')} variant="secondary">
                📜 Histórico
              </Button>
              <Button onClick={() => router.push('/cozinha/cardapio')} variant="primary">
                📋 Cardápio
              </Button>
              <Button onClick={() => router.push('/cozinha/pontos')} variant="primary">
                📍 Pontos
              </Button>
              <Button onClick={() => router.push('/cozinha/config')} variant="primary">
                ⚙️ Config
              </Button>
              <Button onClick={handleLogout} variant="secondary">
                🚪 Sair
              </Button>
            </div>
          </div>

          {/* Dashboard Status - Benchmarking IH7 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">⏳</div>
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1">Pendentes</p>
              <p className="text-4xl font-black text-yellow-600 dark:text-yellow-500">{estatisticas.pendentes}</p>
            </Card>
            <Card className="text-center bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">🍳</div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider mb-1">Preparando</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-500">{estatisticas.preparados}</p>
            </Card>
            
             <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Ativos</p>
              <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{estatisticas.totalAtivos}</p>
            </Card>

             <Card className="text-center bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 opacity-75">
              <p className="text-sm text-green-800 dark:text-green-500 mb-1">Entregues Hoje</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-500">{estatisticas.entreguesHoje}</p>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                📋 Pedidos em Aberto
                <span className="bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                  {pedidosFiltrados.length}
                </span>
             </h2>

             <div className="flex gap-4">
                <Select
                  value={filtroPonto}
                  onChange={(e) => setFiltroPonto(e.target.value)}
                  className="min-w-[200px]"
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                📋 Pedidos ({pedidosFiltrados.length})
              </h2>
            </div>

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
