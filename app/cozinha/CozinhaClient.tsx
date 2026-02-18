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
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroPonto, setFiltroPonto] = useState<string>('todos')
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

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchStatus = filtroStatus === 'todos' || pedido.status === filtroStatus
    const matchPonto = filtroPonto === 'todos' || pedido.pontoEntrega.nome === filtroPonto
    return matchStatus && matchPonto
  })

  const estatisticas = {
    total: pedidos.length,
    pendentes: pedidos.filter(p => p.status === 'pendente').length,
    preparados: pedidos.filter(p => p.status === 'preparado').length,
    entregues: pedidos.filter(p => p.status === 'entregue').length,
    valorTotal: pedidos.reduce((acc, p) => acc + p.valorTotal, 0),
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <style type="text/css" media="print">
        {`
          .no-print { display: none !important; }
          .print-only { 
            display: block !important; 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
          }
          @page { size: auto; margin: 0mm; }
          body { background: white; margin: 0; padding: 0; }
        `}
      </style>
      <div className="print-only" style={{ display: 'none' }}>
        <PrintableReceipt pedido={printingOrder} />
      </div>

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
                Gerencie todos os pedidos
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
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

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{estatisticas.total}</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{estatisticas.pendentes}</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preparados</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{estatisticas.preparados}</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entregues</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">{estatisticas.entregues}</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                R$ {estatisticas.valorTotal.toFixed(2)}
              </p>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              🔍 Filtros
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="preparado">Preparados</option>
                  <option value="entregue">Entregues</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ponto de Entrega
                </label>
                <Select
                  value={filtroPonto}
                  onChange={(e) => setFiltroPonto(e.target.value)}
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
    </>
  )
}
