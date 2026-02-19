import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Pedido {
  numero: number
  nomeCliente: string
  telefone: string | null
  quantidade: number
  itens: string
  observacoes: string | null
  valorTotal: number
  status: string
  tamanhoNome?: string | null
  pontoEntrega: {
    nome: string
    horario: string
  }
  createdAt: Date
}

interface PedidoCardProps {
  pedido: Pedido
  onUpdateStatus?: (numero: number, novoStatus: string) => void
  onPrint?: (pedido: Pedido) => void
}

export function PedidoCard({ pedido, onUpdateStatus, onPrint }: PedidoCardProps) {
  const itens = JSON.parse(pedido.itens) as string[]
  
  const statusColors = {
    pendente: { border: 'border-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-500', label: '⏳ Pendente', variant: 'warning' as const },
    preparado: { border: 'border-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-500', label: '🍳 Preparado', variant: 'info' as const },
    entregue: { border: 'border-green-400', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-500', label: '✅ Entregue', variant: 'success' as const },
    cancelado: { border: 'border-red-400', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-500', label: '❌ Cancelado', variant: 'destructive' as const },
  }

  const currentStatus = statusColors[pedido.status as keyof typeof statusColors] || statusColors.pendente

  // Alerta de Observação
  const temObservacao = pedido.observacoes && pedido.observacoes.length > 0
  const obsClass = temObservacao ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : ''

  return (
    <Card className={`hover:shadow-xl transition-shadow relative border-l-4 ${currentStatus.border} ${obsClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            #{pedido.numero} - {pedido.nomeCliente}
            {pedido.quantidade > 1 && (
               <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full border border-orange-200">
                 {pedido.quantidade}x
               </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
             {pedido.pontoEntrega.nome}
          </p>
          {pedido.tamanhoNome && (
            <span className="inline-block mt-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600">
              📏 {pedido.tamanhoNome}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
           {onPrint && (
            <Button 
              variant="ghost" 
              onClick={() => onPrint(pedido)}
              className="p-2 h-auto text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
              title="Imprimir Comanda"
            >
              🖨️
            </Button>
          )}
          <Badge variant={currentStatus.variant}>
            {currentStatus.label}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {itens.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
             <span className="text-green-500 font-bold">✓</span>
             <span>{item}</span>
          </div>
        ))}
        {pedido.observacoes && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-200 text-sm font-semibold flex items-start gap-2">
            <span>⚠️</span>
            <span>Obs: {pedido.observacoes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
         <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
          R$ {pedido.valorTotal.toFixed(2)}
        </p>

        {onUpdateStatus && (
          <div className="flex gap-2">
            {pedido.status === 'pendente' && (
              <Button size="sm" onClick={() => onUpdateStatus(pedido.numero, 'preparado')}>
                Iniciar Preparo
              </Button>
            )}
            {pedido.status === 'preparado' && (
              <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(pedido.numero, 'entregue')}>
                Marcar Entregue
              </Button>
            )}
            {/* Reabrir se necessário */}
            {pedido.status === 'entregue' && (
              <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(pedido.numero, 'pendente')}>
                Reabrir
              </Button>
            )}
            {pedido.status === 'cancelado' && (
              <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(pedido.numero, 'pendente')}>
                Reabrir
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
