import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type ComandaPedido = {
  numero: number
  nomeCliente: string
  telefone: string | null
  quantidade: number
  itens: string
  observacoes: string | null
  valorTotal: number
  pontoEntrega: { nome: string; horario: string }
  createdAt: Date
}

/**
 * Monta o texto da comanda para enviar por WhatsApp (mesmo conteúdo para dono e cliente).
 */
export function montarTextoComanda(pedido: ComandaPedido): string {
  const itens = (() => {
    try {
      return JSON.parse(pedido.itens) as string[]
    } catch {
      return []
    }
  })()

  const linhas = [
    '🍱 *HORA EXTRA*',
    'Pedido Confirmado!',
    '—',
    `*PEDIDO #${pedido.numero}*`,
    format(new Date(pedido.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    '',
    `*Cliente:* ${pedido.nomeCliente}`,
    ...(pedido.telefone ? [`*Tel:* ${pedido.telefone}`] : []),
    `*Entrega:* ${pedido.pontoEntrega.nome}`,
    `*Horário:* ${pedido.pontoEntrega.horario}`,
    '',
    `*Itens (${pedido.quantidade}x marmitas):*`,
    ...itens.map((i) => `• ${i}`),
    '',
    ...(pedido.observacoes ? [`*Obs:* ${pedido.observacoes}`, ''] : []),
    `*TOTAL: R$ ${pedido.valorTotal.toFixed(2)}*`,
  ]

  return linhas.join('\n')
}
