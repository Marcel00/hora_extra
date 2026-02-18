'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updatePedidoStatus(numero: number, novoStatus: string) {
  try {
    await prisma.pedido.update({
      where: { numero },
      data: { status: novoStatus },
    })
    
    revalidatePath('/cozinha')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return { success: false, error: 'Erro ao atualizar status do pedido' }
  }
}
