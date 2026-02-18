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
  pontoEntrega: {
    nome: string
    horario: string
  }
  createdAt: Date
}

export function PrintableReceipt({ pedido }: { pedido: Pedido | null }) {
  if (!pedido) return null

  const itens = JSON.parse(pedido.itens) as string[]

  return (
    <div className="w-[80mm] p-4 font-mono text-black">
      <div className="text-center mb-4 border-b pb-2 border-black">
        <h1 className="text-xl font-bold">HORA EXTRA</h1>
        <p className="text-sm">Quiosque & Lanchonete</p>
      </div>

      <div className="mb-4 text-sm">
        <p className="font-bold text-lg">PEDIDO #{pedido.numero}</p>
        <p>{format(new Date(pedido.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
      </div>

      <div className="mb-4 border-b pb-2 border-black text-sm">
        <p><span className="font-bold">Cliente:</span> {pedido.nomeCliente}</p>
        {pedido.telefone && <p><span className="font-bold">Tel:</span> {pedido.telefone}</p>}
        <p><span className="font-bold">Entrega:</span> {pedido.pontoEntrega.nome}</p>
        <p><span className="font-bold">Horário:</span> {pedido.pontoEntrega.horario}</p>
      </div>

      <div className="mb-4 border-b pb-2 border-black">
        <p className="font-bold mb-1">ITENS ({pedido.quantidade}x Marmitas)</p>
        <ul className="text-sm list-disc pl-4">
          {itens.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {pedido.observacoes && (
        <div className="mb-4 border-b pb-2 border-black">
          <p className="font-bold">OBSERVAÇÕES:</p>
          <p className="text-sm">{pedido.observacoes}</p>
        </div>
      )}

      <div className="text-right text-lg font-bold">
        TOTAL: R$ {pedido.valorTotal.toFixed(2)}
      </div>
      
      <div className="mt-8 text-center text-xs">
        System: Hora Extra
      </div>
    </div>
  )
}
