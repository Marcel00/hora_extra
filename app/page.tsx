import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { isPedidoAberto } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [pontosEntrega, configuracao] = await Promise.all([
    prisma.pontoEntrega.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    }),
    prisma.configuracao.findFirst()
  ])

  // Default values if config doesn't exist yet
  const horarioAbertura = configuracao?.horarioAbertura || "08:00"
  const horarioFechamento = configuracao?.horarioFechamento || "23:00"

  const pedidosAbertos = isPedidoAberto(horarioAbertura, horarioFechamento)

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header com logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Hora Extra Lanchonete"
              width={320}
              height={160}
              className="mx-auto h-auto w-full max-w-[280px] sm:max-w-[320px] object-contain"
              priority
            />
          </Link>
        </div>

        {/* Status de Pedidos */}
        <div className="max-w-2xl mx-auto mb-8">
          {pedidosAbertos ? (
            <div className="bg-green-100 dark:bg-green-900 border-2 border-green-500 dark:border-green-600 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-3xl">✅</span>
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Pedidos Abertos!
                </h2>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Faça seu pedido até às {horarioFechamento}h para receber hoje
              </p>
            </div>
          ) : (
            <div className="bg-red-100 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-3xl">⏰</span>
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">
                  Pedidos Fechados
                </h2>
              </div>
              <p className="text-red-700 dark:text-red-300">
                Pedidos abrem das {horarioAbertura}h às {horarioFechamento}h
              </p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                Volte amanhã entre {horarioAbertura}h e {horarioFechamento}h para fazer seu pedido!
              </p>
            </div>
          )}
        </div>

        {/* Pontos de Entrega */}
        {pedidosAbertos && pontosEntrega.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
              Escolha seu ponto de entrega:
            </h2>
            <div className="grid gap-4">
              {pontosEntrega.map((ponto) => (
                <Link
                  key={ponto.id}
                  href={`/pedido?ponto=${ponto.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-200 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-500"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                          📍 {ponto.nome}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          🕐 Entrega às {ponto.horario}
                        </p>
                      </div>
                      <div className="text-4xl">→</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem se não houver pontos */}
        {pedidosAbertos && pontosEntrega.length === 0 && (
          <div className="max-w-2xl mx-auto bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 dark:border-yellow-600 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              Nenhum ponto de entrega disponível no momento.
            </p>
          </div>
        )}

        {/* Link para Admin */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <Link
            href="/cozinha/login"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline"
          >
            Acesso Cozinha
          </Link>
        </div>
      </div>
    </main>
  )
}
