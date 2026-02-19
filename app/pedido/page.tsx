import { prisma } from '@/lib/db'
import { isPedidoAberto } from '@/lib/utils'
import { PedidoClient } from './PedidoClient'
import { redirect } from 'next/navigation'

export default async function PedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ ponto?: string }>
}) {
  const { ponto: pontoId } = await searchParams

  if (!pontoId) {
    redirect('/')
  }

  const pontoEntrega = await prisma.pontoEntrega.findUnique({
    where: { id: pontoId, ativo: true },
  })

  if (!pontoEntrega) {
    redirect('/')
  }

  const cardapio = await prisma.cardapio.findFirst({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
    include: {
      itens: {
        where: { disponivel: true },
        orderBy: { categoria: 'asc' },
      },
      tamanhos: {
        where: { ativo: true },
        orderBy: { preco: 'asc' },
      },
    },
  })

  const configuracao = await prisma.configuracao.findFirst()
  const horarioAbertura = configuracao?.horarioAbertura || "08:00"
  const horarioFechamento = configuracao?.horarioFechamento || "23:00"

  const pedidosAbertos = isPedidoAberto(horarioAbertura, horarioFechamento)

  return (
    <PedidoClient
      cardapio={cardapio}
      pontoEntrega={pontoEntrega}
      pedidosAbertos={pedidosAbertos}
    />
  )
}
