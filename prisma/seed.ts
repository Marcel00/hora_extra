import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Criar pontos de entrega
  const quiosque = await prisma.pontoEntrega.upsert({
    where: { id: 'quiosque-laranjinha' },
    update: {},
    create: {
      id: 'quiosque-laranjinha',
      nome: 'Quiosque Laranjinha',
      ativo: true,
      horario: '11h30'
    }
  })

  const cebraspe = await prisma.pontoEntrega.upsert({
    where: { id: 'cebraspe' },
    update: {},
    create: {
      id: 'cebraspe',
      nome: 'Cebraspe',
      ativo: true,
      horario: '12h00'
    }
  })

  console.log('✅ Pontos de entrega criados:', quiosque.nome, cebraspe.nome)

  // Criar cardápio do dia (apenas se não existir nenhum)
  const cardapioExistente = await prisma.cardapio.findFirst()
  if (!cardapioExistente) {
    const cardapio = await prisma.cardapio.create({
      data: {
        ativo: true,
        preco: 20.00,
        itens: {
          create: [
            // Acompanhamentos
            { nome: 'Arroz', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Feijão Tropeiro', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Feijão Caldo', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Macarrão', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Farofa', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Mandioca', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Batata Palha', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Purê', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Vinagrete', categoria: 'acompanhamento', disponivel: true },
            { nome: 'Alface com Tomate', categoria: 'acompanhamento', disponivel: true },
            
            // Proteínas
            { nome: 'Alcatra', categoria: 'proteina', disponivel: true },
            { nome: 'Contra Filé', categoria: 'proteina', disponivel: true },
            { nome: 'Frango Grelhado', categoria: 'proteina', disponivel: true },
            { nome: 'Asinha de Frango', categoria: 'proteina', disponivel: true },
            { nome: 'Linguiça', categoria: 'proteina', disponivel: true },
            { nome: 'Peixe', categoria: 'proteina', disponivel: true },
            
            // Extras
            { nome: 'Espetinho de Carne', categoria: 'extra', disponivel: true },
            { nome: 'Espetinho de Frango', categoria: 'extra', disponivel: true },
            { nome: 'Refrigerante', categoria: 'extra', disponivel: true },
          ]
        }
      }
    })
    console.log('✅ Cardápio criado com', cardapio.preco, 'reais')
  } else {
    console.log('ℹ️ O cardápio já existe, pulando criação.')
  }

  // Criar configuração inicial (apenas se não existir nenhuma)
  const configExistente = await prisma.configuracao.findFirst()
  if (!configExistente) {
    await prisma.configuracao.create({
      data: {
        horarioAbertura: '08:00',
        horarioFechamento: '11:00',
        mensagemWhatsApp: '🍱 *Pedido Confirmado!*\n\nOlá {nome}!\n\nSeu pedido foi recebido com sucesso.',
        telefoneNotificacao: '',
        senhaAdmin: '1234'
      }
    })
    console.log('✅ Configuração criada')
  } else {
    console.log('ℹ️ A configuração já existe, pulando criação.')
  }
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
