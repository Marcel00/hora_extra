export interface PontoEntrega {
  id: string
  nome: string
  ativo: boolean
  horario: string
  createdAt: Date
  updatedAt: Date
}

export interface ItemCardapio {
  id: string
  nome: string
  categoria: 'acompanhamento' | 'proteina' | 'extra'
  disponivel: boolean
  cardapioId: string
  createdAt: Date
  updatedAt: Date
}

export interface Cardapio {
  id: string
  data: Date
  ativo: boolean
  preco: number
  itens: ItemCardapio[]
  createdAt: Date
  updatedAt: Date
}

export interface Pedido {
  numero: number
  nomeCliente: string
  telefone: string
  quantidade: number
  itens: string
  observacoes?: string | null
  valorTotal: number
  status: 'pendente' | 'preparado' | 'entregue'
  pontoEntregaId: string
  pontoEntrega?: PontoEntrega
  whatsappEnviado: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Configuracao {
  id: string
  horarioAbertura: string
  horarioFechamento: string
  mensagemWhatsApp: string
  telefoneNotificacao: string
  senhaAdmin: string
  createdAt: Date
  updatedAt: Date
}

export interface PedidoFormData {
  nomeCliente: string
  telefone: string
  quantidade: number
  itens: string[]
  observacoes?: string
  pontoEntregaId: string
}
