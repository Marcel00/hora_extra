import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pedido {
  numero: number
  nomeCliente: string
  telefone: string | null
  quantidade: number
  itens: string
  observacoes: string | null
  valorTotal: number
  status: string
  pontoEntrega: {
    nome: string
    horario: string
  }
  createdAt: Date
}

interface PedidoCardProps {
  pedido: Pedido
  onUpdateStatus: (numero: number, novoStatus: string) => void
  onPrint?: (pedido: Pedido) => void
}

export function PedidoCard({ pedido, onUpdateStatus, onPrint }: PedidoCardProps) {
  const itens = JSON.parse(pedido.itens) as string[]
  
  const statusMap = {
    pendente: { label: 'Pendente', variant: 'pendente' as const },
    preparado: { label: 'Preparado', variant: 'preparado' as const },
    entregue: { label: 'Entregue', variant: 'entregue' as const },
  }

  const currentStatus = statusMap[pedido.status as keyof typeof statusMap] || statusMap.pendente

  return (
    <Card className="hover:shadow-xl transition-shadow relative">
       {onPrint && (
        <Button 
          variant="ghost" 
          onClick={() => onPrint(pedido)}
          className="absolute top-4 right-14 p-2 h-auto text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          title="Imprimir Comanda"
        >
          🖨️
        </Button>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Pedido #{pedido.numero}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(pedido.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <Badge variant={currentStatus.variant}>
          {currentStatus.label}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Cliente</p>
          <p className="text-lg text-gray-800 dark:text-gray-200">{pedido.nomeCliente}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Telefone</p>
          <p className="text-lg text-gray-800 dark:text-gray-200">{pedido.telefone || '-'}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Ponto de Entrega</p>
          <p className="text-lg text-gray-800 dark:text-gray-200">
            📍 {pedido.pontoEntrega.nome} - {pedido.pontoEntrega.horario}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Quantidade</p>
          <p className="text-lg text-gray-800 dark:text-gray-200">{pedido.quantidade}x marmitas</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Itens</p>
          <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
            {itens.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {pedido.observacoes && (
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Observações</p>
            <p className="text-gray-800 dark:text-gray-200 italic">{pedido.observacoes}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Valor Total</p>
          <p className="text-xl font-bold text-orange-600 dark:text-orange-500">
            R$ {pedido.valorTotal.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {pedido.status === 'pendente' && (
          <Button
            onClick={() => onUpdateStatus(pedido.numero, 'preparado')}
            variant="primary"
            className="flex-1"
          >
            ✅ Marcar como Preparado
          </Button>
        )}
        {pedido.status === 'preparado' && (
          <Button
            onClick={() => onUpdateStatus(pedido.numero, 'entregue')}
            variant="primary"
            className="flex-1"
          >
            🚚 Marcar como Entregue
          </Button>
        )}
        {pedido.status === 'entregue' && (
          <Button
            onClick={() => onUpdateStatus(pedido.numero, 'pendente')}
            variant="secondary"
            className="flex-1"
          >
            🔄 Reabrir Pedido
          </Button>
        )}
      </div>
    </Card>
  )
}
