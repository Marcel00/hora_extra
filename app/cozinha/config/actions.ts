'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateConfiguracao(data: {
  horarioAbertura?: string
  horarioFechamento?: string
  mensagemWhatsApp?: string
  telefoneNotificacao?: string
  senhaAdmin?: string
}) {
  try {
    // Buscar configuração existente
    const config = await prisma.configuracao.findFirst()

    if (!config) {
      // Criar se não existir
      const newConfig = await prisma.configuracao.create({
        data: {
          horarioAbertura: data.horarioAbertura || '08:00',
          horarioFechamento: data.horarioFechamento || '11:00',
          mensagemWhatsApp: data.mensagemWhatsApp || '🍱 *Pedido Confirmado!*\n\nOlá {nome}!\n\nSeu pedido foi recebido com sucesso.',
          telefoneNotificacao: data.telefoneNotificacao || '',
          senhaAdmin: data.senhaAdmin || '1234',
        },
      })
      
      revalidatePath('/cozinha/config')
      return { success: true, config: newConfig }
    }

    // Atualizar existente
    const updatedConfig = await prisma.configuracao.update({
      where: { id: config.id },
      data,
    })
    
    revalidatePath('/cozinha/config')
    revalidatePath('/')
    return { success: true, config: updatedConfig }
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    return { success: false, error: 'Erro ao atualizar configurações' }
  }
}
