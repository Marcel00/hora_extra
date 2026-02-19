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

// Ações para Tamanhos
export async function createTamanho(cardapioId: string, data: {
  nome: string
  preco: number
  ativo: boolean
}) {
  try {
    await prisma.tamanho.create({
      data: {
        ...data,
        cardapioId,
      },
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error creating tamanho:', error)
    return { success: false, error: 'Erro ao criar tamanho' }
  }
}

export async function updateTamanho(id: string, data: {
  nome: string
  preco: number
  ativo: boolean
}) {
  try {
    await prisma.tamanho.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error updating tamanho:', error)
    return { success: false, error: 'Erro ao atualizar tamanho' }
  }
}

export async function deleteTamanho(id: string) {
  try {
    await prisma.tamanho.delete({
      where: { id },
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error deleting tamanho:', error)
    return { success: false, error: 'Erro ao deletar tamanho' }
  }
}

export async function toggleTamanhoAtivo(id: string) {
  try {
    const tamanho = await prisma.tamanho.findUnique({ where: { id } })
    if (!tamanho) {
      return { success: false, error: 'Tamanho não encontrado' }
    }

    await prisma.tamanho.update({
      where: { id },
      data: { ativo: !tamanho.ativo },
    })

    revalidatePath('/admin/cardapio')
    return { success: true }
  } catch (error) {
    console.error('Error toggling tamanho:', error)
    return { success: false, error: 'Erro ao atualizar status do tamanho' }
  }
}
