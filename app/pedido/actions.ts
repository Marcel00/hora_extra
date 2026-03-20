'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { isPedidoAberto } from '@/lib/utils'
import { sendEvolutionText } from '@/lib/evolution-api'
import { montarTextoComanda } from '@/lib/comanda-whatsapp'

/** Envia a comanda por WhatsApp (somente cliente). Se passar `dados`, evita refetch no banco (mais rápido). */
export async function sendWhatsAppComanda(
  pedidoNumero: number,
  dados?: {
    pedido: {
      numero: number
      telefone: string | null
      whatsappEnviado: boolean
      createdAt: Date
      pontoEntrega: { nome: string; horario: string }
      nomeCliente: string
      quantidade: number
      itens: string
      observacoes: string | null
      valorTotal: number
    }
  }
): Promise<{
  enviadoCliente: boolean
  erroGeral?: string
  erroCliente?: string
}> {
  try {
    let pedido:
      | {
          numero: number
          telefone: string | null
          whatsappEnviado: boolean
          createdAt: Date
          pontoEntrega: { nome: string; horario: string }
          nomeCliente: string
          quantidade: number
          itens: string
          observacoes: string | null
          valorTotal: number
        }
      | null

    if (dados) {
      pedido = dados.pedido
    } else {
      const pedidoRes = await prisma.pedido.findUnique({
        where: { numero: pedidoNumero },
        include: { pontoEntrega: true },
      })
      pedido = pedidoRes
    }

    if (!pedido || pedido.whatsappEnviado) {
      return {
        enviadoCliente: !!pedido?.whatsappEnviado,
      }
    }

    const textoComanda = montarTextoComanda({
      ...pedido,
      createdAt: pedido.createdAt,
    })

    const telefoneCliente = pedido.telefone?.trim() || null

    const resCliente = telefoneCliente
      ? await sendEvolutionText(telefoneCliente, textoComanda)
      : { ok: false, error: 'Telefone do cliente ausente.' }

    const enviadoCliente = !!resCliente.ok

    if (!enviadoCliente && !telefoneCliente) {
      console.warn('[sendWhatsAppComanda] Telefone do cliente ausente.')
    } else if (!enviadoCliente) {
      console.warn('[sendWhatsAppComanda] Falha ao enviar para cliente:', resCliente.error)
    }

    // Marca "enviado" apenas quando o cliente recebeu. Isso evita frustração do cliente.
    if (enviadoCliente) {
      await prisma.pedido.update({
        where: { numero: pedido.numero },
        data: { whatsappEnviado: true },
      })
    }

    revalidatePath('/cozinha')

    return {
      enviadoCliente,
      erroCliente: !enviadoCliente ? (resCliente.error ?? 'Falha ao enviar para o cliente.') : undefined,
      erroGeral: !enviadoCliente ? 'Falha ao enviar a comanda no WhatsApp.' : undefined,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('[sendWhatsAppComanda]', e)
    return {
      enviadoCliente: false,
      erroGeral: msg,
    }
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

    revalidatePath('/cozinha')
    // Retorna na hora; o cliente dispara o WhatsApp em segundo plano (não trava a tela)
    return { success: true, pedido }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    const mensagem = error instanceof Error ? error.message : 'Erro ao criar pedido.'
    return { success: false, error: mensagem }
  }
}
