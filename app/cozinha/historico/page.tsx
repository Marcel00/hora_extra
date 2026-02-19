import { prisma } from '@/lib/db'
import { HistoricoClient } from './HistoricoClient'

export default async function HistoricoPage() {
  const pedidos = await prisma.pedido.findMany({
    include: {
      pontoEntrega: {
        select: {
          nome: true,
          horario: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const pontosEntrega = await prisma.pontoEntrega.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
    },
  })

  return <HistoricoClient pedidos={pedidos} pontosEntrega={pontosEntrega} />
}
