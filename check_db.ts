import { prisma } from './lib/db'

async function checkData() {
  const cardapio = await prisma.cardapio.findFirst({
    where: { ativo: true },
    include: { itens: true }
  })
  console.log('Active Cardapio:', JSON.stringify(cardapio, null, 2))
}

checkData()
