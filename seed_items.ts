import { prisma } from './lib/db'

async function seedItems() {
  const cardapioId = 'cmkn6ekul000c12j4macw74u0'
  
  const itens = [
    { nome: 'Arroz Branco', categoria: 'acompanhamento', cardapioId },
    { nome: 'Feijão Carioca', categoria: 'acompanhamento', cardapioId },
    { nome: 'Macarrão ao Sugo', categoria: 'acompanhamento', cardapioId },
    { nome: 'Farofa de Bacon', categoria: 'acompanhamento', cardapioId },
    { nome: 'Legumes Sauté', categoria: 'acompanhamento', cardapioId },
    
    { nome: 'Frango Grelhado', categoria: 'proteina', cardapioId },
    { nome: 'Bife Acebolado', categoria: 'proteina', cardapioId },
    { nome: 'Linguiça Toscana', categoria: 'proteina', cardapioId },
    
    { nome: 'Ovo Frito', categoria: 'extra', cardapioId },
    { nome: 'Salada Vinagrete', categoria: 'extra', cardapioId },
  ]

  for (const item of itens) {
    await prisma.itemCardapio.create({ data: item })
  }
  
  console.log('Itens seeded successfully!')
}

seedItems()
