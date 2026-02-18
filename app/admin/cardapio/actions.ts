'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createItem(cardapioId: string, data: {
  nome: string
  categoria: string
  disponivel: boolean
  maxSelecoes: number
}) {
  try {
    await prisma.itemCardapio.create({
      data: {
        ...data,
        cardapioId,
      },
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error creating item:', error)
    return { success: false, error: 'Erro ao criar item' }
  }
}

export async function updateItem(id: string, data: {
  nome: string
  categoria: string
  disponivel: boolean
  maxSelecoes: number
}) {
  try {
    await prisma.itemCardapio.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error updating item:', error)
    return { success: false, error: 'Erro ao atualizar item' }
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.itemCardapio.delete({
      where: { id },
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error deleting item:', error)
    return { success: false, error: 'Erro ao deletar item' }
  }
}

export async function toggleItemDisponibilidade(id: string) {
  try {
    const item = await prisma.itemCardapio.findUnique({ where: { id } })
    if (!item) {
      return { success: false, error: 'Item não encontrado' }
    }

    await prisma.itemCardapio.update({
      where: { id },
      data: { disponivel: !item.disponivel },
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error toggling disponibilidade:', error)
    return { success: false, error: 'Erro ao atualizar disponibilidade' }
  }
}
