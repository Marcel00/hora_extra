import { prisma } from '@/lib/db'
import { CardapioClient } from './CardapioClient'
import { TamanhoManager } from './TamanhoManager'
import { Card } from '@/components/ui/Card'

export default async function CardapioPage() {
  const cardapio = await prisma.cardapio.findFirst({
    where: { ativo: true },
    include: {
      itens: {
        orderBy: { nome: 'asc' },
      },
      tamanhos: {
        orderBy: { preco: 'asc' },
      },
    },
  })

  if (!cardapio) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
          Gerenciar Cardápio
        </h1>
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Nenhum cardápio ativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Crie um cardápio primeiro nas configurações
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <TamanhoManager cardapioId={cardapio.id} tamanhos={cardapio.tamanhos} />
      <CardapioClient cardapioId={cardapio.id} itens={cardapio.itens} />
    </div>
  )
}
