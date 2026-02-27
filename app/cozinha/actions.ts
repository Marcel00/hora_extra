'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/** Valida a senha da cozinha contra a config no banco (senha que pode ser alterada em /cozinha/config). */
export async function validarSenhaCozinha(senha: string): Promise<{ valid: boolean }> {
  const config = await prisma.configuracao.findFirst()
  const senhaAtual = config?.senhaAdmin ?? '1234'
  return { valid: senha.trim() === senhaAtual }
}

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
