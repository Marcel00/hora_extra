'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPonto(data: {
  nome: string
  horario: string
  ativo: boolean
}) {
  try {
    await prisma.pontoEntrega.create({ data })

    revalidatePath('/admin/pontos')
    return { success: true }
  } catch (error) {
    console.error('Error creating ponto:', error)
    return { success: false, error: 'Erro ao criar ponto de entrega' }
  }
}

export async function updatePonto(
  id: string,
  data: {
    nome: string
    horario: string
    ativo: boolean
  }
) {
  try {
    await prisma.pontoEntrega.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/pontos')
    return { success: true }
  } catch (error) {
    console.error('Error updating ponto:', error)
    return { success: false, error: 'Erro ao atualizar ponto de entrega' }
  }
}

export async function deletePonto(id: string) {
  try {
    await prisma.pontoEntrega.delete({
      where: { id },
    })

    revalidatePath('/admin/pontos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting ponto:', error)
    return { success: false, error: 'Erro ao deletar ponto de entrega' }
  }
}

export async function togglePontoAtivo(id: string) {
  try {
    const ponto = await prisma.pontoEntrega.findUnique({ where: { id } })
    if (!ponto) {
      return { success: false, error: 'Ponto não encontrado' }
    }

    await prisma.pontoEntrega.update({
      where: { id },
      data: { ativo: !ponto.ativo },
    })

    revalidatePath('/admin/pontos')
    return { success: true }
  } catch (error) {
    console.error('Error toggling ativo:', error)
    return { success: false, error: 'Erro ao atualizar status' }
  }
}
