import { prisma } from '@/lib/db'
import { CozinhaClient } from './CozinhaClient'

export default async function CozinhaPage() {
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

  return <CozinhaClient pedidos={pedidos} pontosEntrega={pontosEntrega} />
}
