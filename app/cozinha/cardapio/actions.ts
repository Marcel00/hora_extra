'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createCardapio(data: { data: Date; preco: number }) {
  try {
    const cardapio = await prisma.cardapio.create({
      data: {
        data: data.data,
        preco: data.preco,
        ativo: true,
      },
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true, cardapio }
  } catch (error) {
    console.error('Erro ao criar cardápio:', error)
    return { success: false, error: 'Erro ao criar cardápio' }
  }
}

export async function updateCardapio(id: string, data: { preco?: number; ativo?: boolean }) {
  try {
    const cardapio = await prisma.cardapio.update({
      where: { id },
      data,
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true, cardapio }
  } catch (error) {
    console.error('Erro ao atualizar cardápio:', error)
    return { success: false, error: 'Erro ao atualizar cardápio' }
  }
}

export async function deleteCardapio(id: string) {
  try {
    await prisma.cardapio.delete({
      where: { id },
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar cardápio:', error)
    return { success: false, error: 'Erro ao deletar cardápio' }
  }
}

export async function createItemCardapio(data: {
  cardapioId: string
  nome: string
  categoria: string
}) {
  try {
    const item = await prisma.itemCardapio.create({
      data: {
        ...data,
        disponivel: true,
      },
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true, item }
  } catch (error) {
    console.error('Erro ao criar item:', error)
    return { success: false, error: 'Erro ao criar item do cardápio' }
  }
}

export async function updateItemCardapio(id: string, data: { nome?: string; disponivel?: boolean }) {
  try {
    const item = await prisma.itemCardapio.update({
      where: { id },
      data,
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true, item }
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    return { success: false, error: 'Erro ao atualizar item do cardápio' }
  }
}

export async function deleteItemCardapio(id: string) {
  try {
    await prisma.itemCardapio.delete({
      where: { id },
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar item:', error)
    return { success: false, error: 'Erro ao deletar item do cardápio' }
  }
}

// Ações para Tamanhos
export async function createTamanho(data: {
  cardapioId: string
  nome: string
  preco: number
  ativo: boolean
}) {
  try {
    const tamanho = await prisma.tamanho.create({
      data,
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true, tamanho }
  } catch (error) {
    console.error('Error creating tamanho:', error)
    return { success: false, error: 'Erro ao criar tamanho' }
  }
}

export async function updateTamanho(id: string, data: {
  nome?: string
  preco?: number
  ativo?: boolean
}) {
  try {
    const tamanho = await prisma.tamanho.update({
      where: { id },
      data,
    })
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true, tamanho }
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
    
    revalidatePath('/cozinha/cardapio')
    revalidatePath('/pedido')
    return { success: true }
  } catch (error) {
    console.error('Error deleting tamanho:', error)
    return { success: false, error: 'Erro ao deletar tamanho' }
  }
}
