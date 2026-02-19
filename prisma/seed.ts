import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
        preco: 20.00, // Preço base legado
        tamanhos: {
          create: [
            { nome: 'Pequena', preco: 15.00, ativo: true },
            { nome: 'Grande', preco: 20.00, ativo: true }
          ]
        },
        itens: {
          create: [
            // Acompanhamentos
            { nome: 'Arroz', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Feijão Caldo', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Feijão Tropeiro', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Macarrão', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Farofa', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Mandioca', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Batata Palha', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Purê', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Vinagrete', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            { nome: 'Alface com Tomate', categoria: 'acompanhamento', disponivel: true, maxSelecoes: 1 },
            
            // Proteínas
            { nome: 'Asinha de Frango', categoria: 'proteina', disponivel: true, maxSelecoes: 2 },
            { nome: 'Alcatra', categoria: 'proteina', disponivel: true, maxSelecoes: 2 },
            { nome: 'Peixe', categoria: 'proteina', disponivel: true, maxSelecoes: 2 },
            { nome: 'Linguiça', categoria: 'proteina', disponivel: true, maxSelecoes: 2 },
            { nome: 'Contra Filé', categoria: 'proteina', disponivel: true, maxSelecoes: 2 },
            { nome: 'Frango Grelhado', categoria: 'proteina', disponivel: true, maxSelecoes: 2 },

            // Extras
            { nome: 'Espetinho de Carne', categoria: 'extra', disponivel: true, maxSelecoes: 99 },
            { nome: 'Espetinho de Frango', categoria: 'extra', disponivel: true, maxSelecoes: 99 },
            { nome: 'Refrigerante', categoria: 'extra', disponivel: true, maxSelecoes: 99 },
          ]
        }
      }
    })
    console.log('✅ Cardápio criado com tamanhos:', cardapio.id)
  } else {
    // Se já existe cardápio antigo sem tamanhos, criar tamanhos para manter compatibilidade
    const tamanhosExistentes = await prisma.tamanho.count({ where: { cardapioId: cardapioExistente.id } })
    if (tamanhosExistentes === 0) {
       await prisma.tamanho.createMany({
        data: [
          { nome: 'Pequena', preco: 15.00, ativo: true, cardapioId: cardapioExistente.id },
          { nome: 'Grande', preco: 20.00, ativo: true, cardapioId: cardapioExistente.id }
        ]
       })
       console.log('✅ Tamanhos adicionados ao cardápio existente')
    }
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

  // Criar usuário admin
  const adminExistente = await prisma.usuario.findUnique({ where: { email: 'admin@admin.com' } })
  if (!adminExistente) {
    const hashedPassword = await bcrypt.hash('1234', 10)
    await prisma.usuario.create({
      data: {
        nome: 'Admin',
        email: 'admin@admin.com',
        senha: hashedPassword,
        role: 'admin',
        ativo: true
      }
    })
    console.log('✅ Usuário admin criado: admin@admin.com / 1234')
  } else {
    console.log('ℹ️ Usuário admin já existe.')
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
