'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { isPedidoAberto } from '@/lib/utils'
import { sendEvolutionText } from '@/lib/evolution-api'
import { montarTextoComanda } from '@/lib/comanda-whatsapp'

/** Envia a comanda por WhatsApp (dono + cliente). Retorna se enviou e eventual erro para feedback. */
export async function sendWhatsAppComanda(pedidoNumero: number): Promise<{ enviouAlguma: boolean; erro?: string }> {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { numero: pedidoNumero },
      include: { pontoEntrega: true },
    })
    if (!pedido || pedido.whatsappEnviado) {
      return { enviouAlguma: !!pedido?.whatsappEnviado }
    }

    const config = await prisma.configuracao.findFirst()
    const textoComanda = montarTextoComanda({
      ...pedido,
      createdAt: pedido.createdAt,
    })

    let enviouAlguma = false
    const erros: string[] = []

    if (config?.telefoneNotificacao?.trim()) {
      const resOwner = await sendEvolutionText(config.telefoneNotificacao.trim(), textoComanda)
      if (resOwner.ok) enviouAlguma = true
      else {
        console.warn('[sendWhatsAppComanda] dono:', resOwner.error)
        erros.push(`dono: ${resOwner.error ?? 'erro'}`)
      }
    }
    if (pedido.telefone?.trim()) {
      const resCliente = await sendEvolutionText(pedido.telefone.trim(), textoComanda)
      if (resCliente.ok) enviouAlguma = true
      else {
        console.warn('[sendWhatsAppComanda] cliente:', resCliente.error)
        erros.push(`cliente: ${resCliente.error ?? 'erro'}`)
      }
    }

    if (enviouAlguma) {
      await prisma.pedido.update({
        where: { numero: pedido.numero },
        data: { whatsappEnviado: true },
      })
    }
    revalidatePath('/cozinha')
    return { enviouAlguma, erro: erros.length ? erros.join('; ') : undefined }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('[sendWhatsAppComanda]', e)
    return { enviouAlguma: false, erro: msg }
  }
}

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

    // Envia WhatsApp na mesma requisição (mais confiável que chamada em segundo plano)
    const { enviouAlguma, erro: whatsappErro } = await sendWhatsAppComanda(pedido.numero)

    revalidatePath('/cozinha')
    return {
      success: true,
      pedido,
      whatsappEnviado: enviouAlguma,
      whatsappErro: whatsappErro ?? undefined,
    }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    const mensagem = error instanceof Error ? error.message : 'Erro ao criar pedido.'
    return { success: false, error: mensagem }
  }
}
