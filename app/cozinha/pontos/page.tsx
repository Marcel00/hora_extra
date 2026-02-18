import { prisma } from '@/lib/db'
import { PontosClient } from './PontosClient'

export default async function PontosPage() {
  const pontos = await prisma.pontoEntrega.findMany({
    include: {
      _count: {
        select: { pedidos: true },
      },
    },
    orderBy: {
      nome: 'asc',
    },
  })

  return <PontosClient pontos={pontos} />
}
