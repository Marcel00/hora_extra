'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { isPedidoAberto } from '@/lib/utils'
import { sendEvolutionText } from '@/lib/evolution-api'
import { montarTextoComanda } from '@/lib/comanda-whatsapp'

export async function createPedido(data: {
  nomeCliente: string
  telefone: string
  quantidade: number
  tamanhoId?: string
  tamanhoNome?: string
  itens: string[]
  acompanhamentosSelecionados?: string[]
  itensRemovidos?: string[]
  observacoes: string
  valorTotal: number
  pontoEntregaId: string
}) {
  try {
    const ponto = await prisma.pontoEntrega.findUnique({
      where: { id: data.pontoEntregaId },
    })
    if (!ponto || !ponto.ativo) {
      return { success: false, error: 'Ponto de entrega inválido ou inativo.' }
    }

    const config = await prisma.configuracao.findFirst()
    const abertura = config?.horarioAbertura ?? '08:00'
    const fechamento = config?.horarioFechamento ?? '11:00'
    if (!isPedidoAberto(abertura, fechamento)) {
      return { success: false, error: 'Pedidos estão fechados no momento. Tente no horário de atendimento.' }
    }

    const pedido = await prisma.pedido.create({
      data: {
        nomeCliente: data.nomeCliente,
        telefone: data.telefone,
        quantidade: data.quantidade,
        tamanhoId: data.tamanhoId,
        tamanhoNome: data.tamanhoNome,
        itens: JSON.stringify(data.itens),
        acompanhamentosSelecionados: data.acompanhamentosSelecionados?.length ? JSON.stringify(data.acompanhamentosSelecionados) : null,
        itensRemovidos: data.itensRemovidos?.length ? JSON.stringify(data.itensRemovidos) : null,
        observacoes: data.observacoes || null,
        valorTotal: data.valorTotal,
        pontoEntregaId: data.pontoEntregaId,
        status: 'pendente',
        whatsappEnviado: false,
      },
      include: { pontoEntrega: true },
    })

    const textoComanda = montarTextoComanda({
      ...pedido,
      createdAt: pedido.createdAt,
    })

    let enviouAlguma = false
    if (config?.telefoneNotificacao?.trim()) {
      const resOwner = await sendEvolutionText(config.telefoneNotificacao.trim(), textoComanda)
      if (resOwner.ok) enviouAlguma = true
      else console.warn('[createPedido] WhatsApp dono:', resOwner.error)
    }
    if (data.telefone?.trim()) {
      const resCliente = await sendEvolutionText(data.telefone.trim(), textoComanda)
      if (resCliente.ok) enviouAlguma = true
      else console.warn('[createPedido] WhatsApp cliente:', resCliente.error)
    }
    if (enviouAlguma) {
      await prisma.pedido.update({
        where: { numero: pedido.numero },
        data: { whatsappEnviado: true },
      })
    }

    revalidatePath('/cozinha')
    return { success: true, pedido }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    const mensagem = error instanceof Error ? error.message : 'Erro ao criar pedido.'
    return { success: false, error: mensagem }
  }
}
