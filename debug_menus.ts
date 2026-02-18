import { prisma } from './lib/db'

async function listMenus() {
  const menus = await prisma.cardapio.findMany({
    include: {
      _count: {
        select: { itens: true }
      },
      itens: {
        take: 3, // Just to preview
        select: { nome: true }
      }
    }
  })
  console.log('All Menus:', JSON.stringify(menus, null, 2))
}

listMenus()
