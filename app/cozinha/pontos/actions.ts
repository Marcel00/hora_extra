'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPontoEntrega(data: { nome: string; horario: string }) {
  try {
    const ponto = await prisma.pontoEntrega.create({
      data: {
        nome: data.nome,
        horario: data.horario,
        ativo: true,
      },
    })
    
    revalidatePath('/cozinha/pontos')
    return { success: true, ponto }
  } catch (error) {
    console.error('Erro ao criar ponto:', error)
    return { success: false, error: 'Erro ao criar ponto de entrega' }
  }
}

export async function updatePontoEntrega(id: string, data: { nome?: string; horario?: string; ativo?: boolean }) {
  try {
    const ponto = await prisma.pontoEntrega.update({
      where: { id },
      data,
    })
    
    revalidatePath('/cozinha/pontos')
    revalidatePath('/')
    return { success: true, ponto }
  } catch (error) {
    console.error('Erro ao atualizar ponto:', error)
    return { success: false, error: 'Erro ao atualizar ponto de entrega' }
  }
}

export async function deletePontoEntrega(id: string) {
  try {
    // Verificar se há pedidos associados
    const pedidosCount = await prisma.pedido.count({
      where: { pontoEntregaId: id },
    })

    if (pedidosCount > 0) {
      return { success: false, error: `Não é possível deletar. Existem ${pedidosCount} pedidos associados a este ponto.` }
    }

    await prisma.pontoEntrega.delete({
      where: { id },
    })
    
    revalidatePath('/cozinha/pontos')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar ponto:', error)
    return { success: false, error: 'Erro ao deletar ponto de entrega' }
  }
}
