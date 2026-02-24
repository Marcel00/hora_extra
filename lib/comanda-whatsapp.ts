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

/** Formata data/hora no fuso de Brasília para a comanda. */
function formatarDataHoraBrasilia(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(',', ' ')
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

  const dataHora = formatarDataHoraBrasilia(new Date(pedido.createdAt))

  const linhas = [
    '🍱 *HORA EXTRA*',
    'Pedido Confirmado!',
    '—',
    `*PEDIDO #${pedido.numero}*`,
    dataHora,
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
