'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateConfig(data: {
  horarioAbertura: string
  horarioFechamento: string
  mensagemWhatsApp: string
  telefoneNotificacao: string
}) {
  try {
    const config = await prisma.configuracao.findFirst()

    if (config) {
      await prisma.configuracao.update({
        where: { id: config.id },
        data,
      })
    } else {
      await prisma.configuracao.create({
        data: {
          ...data,
          senhaAdmin: '1234', // Default password
        },
      })
    }

    revalidatePath('/admin/config')
    return { success: true }
  } catch (error) {
    console.error('Error updating config:', error)
    return { success: false, error: 'Erro ao atualizar configurações' }
  }
}

export async function updateCardapioPreco(preco: number) {
  try {
    const cardapio = await prisma.cardapio.findFirst({
      where: { ativo: true },
    })

    if (!cardapio) {
      return { success: false, error: 'Nenhum cardápio ativo' }
    }

    await prisma.cardapio.update({
      where: { id: cardapio.id },
      data: { preco },
    })

    revalidatePath('/admin/config')
    return { success: true }
  } catch (error) {
    console.error('Error updating preco:', error)
    return { success: false, error: 'Erro ao atualizar preço' }
  }
}
