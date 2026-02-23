import { prisma } from '@/lib/db'
import { CardapioClient } from './CardapioClient'

export const dynamic = 'force-dynamic'

export default async function CardapioPage() {
  const cardapios = await prisma.cardapio.findMany({
    include: {
      itens: {
        orderBy: {
          categoria: 'asc',
        },
      },
      tamanhos: {
        orderBy: {
          preco: 'asc',
        },
      },
    },
    orderBy: {
      data: 'desc',
    },
  })

  return <CardapioClient cardapios={cardapios} />
}
