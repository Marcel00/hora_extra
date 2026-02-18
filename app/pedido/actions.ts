'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPedido(data: {
  nomeCliente: string
  telefone: string
  quantidade: number
  itens: string[]
  observacoes: string
  valorTotal: number
  pontoEntregaId: string
}) {
  try {
    const pedido = await prisma.pedido.create({
      data: {
        nomeCliente: data.nomeCliente,
        telefone: data.telefone,
        quantidade: data.quantidade,
        itens: JSON.stringify(data.itens),
        observacoes: data.observacoes || null,
        valorTotal: data.valorTotal,
        pontoEntregaId: data.pontoEntregaId,
        status: 'pendente',
        whatsappEnviado: false,
      },
    })
    
    revalidatePath('/cozinha')
    return { success: true, pedido }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return { success: false, error: 'Erro ao criar pedido' }
  }
}
