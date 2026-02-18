import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [pedidos, pontosEntrega, cardapioAtivo] = await Promise.all([
    prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        pontoEntrega: {
          select: { nome: true },
        },
      },
    }),
    prisma.pontoEntrega.count({ where: { ativo: true } }),
    prisma.cardapio.findFirst({ where: { ativo: true } }),
  ])

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const pedidosHoje = pedidos.filter(
    (p) => p.createdAt >= hoje
  )

  const faturamentoHoje = pedidosHoje.reduce(
    (acc, p) => acc + p.valorTotal,
    0
  )

  const stats = {
    pedidosHoje: pedidosHoje.length,
    pedidosPendentes: pedidos.filter((p) => p.status === 'pendente').length,
    faturamentoHoje,
    pontosAtivos: pontosEntrega,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral do sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Pedidos Hoje
          </p>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-500">
            {stats.pedidosHoje}
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Pendentes
          </p>
          <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-500">
            {stats.pedidosPendentes}
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Faturamento Hoje
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-500">
            R$ {stats.faturamentoHoje.toFixed(2)}
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Pontos Ativos
          </p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-500">
            {stats.pontosAtivos}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/cardapio"
            className="p-6 rounded-lg bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-500 transition-colors text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Gerenciar Cardápio
            </h3>
          </Link>

          <Link
            href="/admin/pontos"
            className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-4xl mb-2">📍</div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Pontos de Entrega
            </h3>
          </Link>

          <Link
            href="/admin/config"
            className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors text-center"
          >
            <div className="text-4xl mb-2">⚙️</div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Configurações
            </h3>
          </Link>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Pedidos Recentes
          </h2>
          <Link
            href="/cozinha"
            className="text-sm text-orange-600 dark:text-orange-500 hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhum pedido ainda
          </p>
        ) : (
          <div className="space-y-3">
            {pedidos.slice(0, 5).map((pedido) => (
              <div
                key={pedido.numero}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    #{pedido.numero} - {pedido.nomeCliente}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pedido.pontoEntrega.nome}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600 dark:text-orange-500">
                    R$ {pedido.valorTotal.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      pedido.status === 'pendente'
                        ? 'text-yellow-600'
                        : pedido.status === 'preparado'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {pedido.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
