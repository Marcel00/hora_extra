import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  numero: number;
  nomeCliente: string;
  telefone: string | null;
  quantidade: number;
  itens: string;
  acompanhamentosSelecionados?: string | null;
  itensRemovidos?: string | null;
  observacoes: string | null;
  valorTotal: number;
  status: string;
  whatsappEnviado?: boolean;
  tamanhoNome?: string | null;
  pontoEntrega: {
    nome: string;
    horario: string;
  };
  createdAt: Date;
}

interface PedidoCardProps {
  pedido: Pedido;
  onUpdateStatus?: (numero: number, novoStatus: string) => void;
  onPrint?: (pedido: Pedido) => void;
}

// Tons por ponto de entrega: borda e fundo do card seguem o ponto
const pontoTheme: Record<
  string,
  { border: string; bg: string; nome: string; tamanho: string }
> = {
  Cebraspe: {
    border: 'border-2 border-blue-500 dark:border-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    nome: 'text-blue-700 dark:text-blue-400 font-semibold',
    tamanho:
      'bg-blue-200/70 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-500',
  },
  'Quiosque Laranjinha': {
    border: 'border-2 border-orange-500 dark:border-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    nome: 'text-orange-700 dark:text-orange-400 font-semibold',
    tamanho:
      'bg-orange-200/70 dark:bg-orange-800/50 text-orange-900 dark:text-orange-100 border-orange-400 dark:border-orange-500',
  },
};

function getPontoTheme(pontoNome: string) {
  return (
    pontoTheme[pontoNome] ?? {
      border: 'border-2 border-gray-300 dark:border-gray-600',
      bg: 'bg-gray-50 dark:bg-gray-800',
      nome: 'text-gray-600 dark:text-gray-400',
      tamanho:
        'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500',
    }
  );
}

export function PedidoCard({
  pedido,
  onUpdateStatus,
  onPrint,
}: PedidoCardProps) {
  const itens = JSON.parse(pedido.itens) as string[];
  const acompanhamentosSelecionados: string[] =
    pedido.acompanhamentosSelecionados
      ? (JSON.parse(pedido.acompanhamentosSelecionados) as string[])
      : itens;
  const itensRemovidos: string[] = pedido.itensRemovidos
    ? (JSON.parse(pedido.itensRemovidos) as string[])
    : [];
  const temaPonto = getPontoTheme(pedido.pontoEntrega.nome);

  const statusColors = {
    pendente: { label: '⏳ Pendente', variant: 'warning' as const },
    preparado: { label: '🍳 Preparado', variant: 'info' as const },
    entregue: { label: '✅ Entregue', variant: 'success' as const },
    cancelado: { label: '❌ Cancelado', variant: 'destructive' as const },
  };

  const currentStatus =
    statusColors[pedido.status as keyof typeof statusColors] ||
    statusColors.pendente;

  // Alerta de Observação
  const temObservacao = pedido.observacoes && pedido.observacoes.length > 0;
  const obsClass = temObservacao
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    : '';

  const horaPedido = pedido.createdAt
    ? format(new Date(pedido.createdAt), 'HH:mm', { locale: ptBR })
    : pedido.pontoEntrega.horario;

  return (
    <div
      className={`rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${temaPonto.border} ${temaPonto.bg} ${obsClass}`}
    >
      {/* Topo: esquerda = nome + (hora • ponto), direita = #número + WhatsApp */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 break-words">
            {pedido.nomeCliente}
            {pedido.quantidade > 1 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {pedido.quantidade}x
              </span>
            )}
          </h3>
          <p className={`text-sm mt-0.5 ${temaPonto.nome}`}>
            {horaPedido} • {pedido.pontoEntrega.nome}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            #{pedido.numero}
          </span>
          {pedido.whatsappEnviado ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-0.5" title="Comanda enviada por WhatsApp">
              ✓ WhatsApp
            </span>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium" title="WhatsApp ainda não enviado">
              — WhatsApp
            </span>
          )}
        </div>
      </div>

      {/* Corpo: TAMANHO (tabela) + Acompanhamentos */}
      <div className="bg-gray-100/80 dark:bg-gray-800/50 rounded-lg p-3 mb-4 space-y-2">
        {pedido.tamanhoNome && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              TAMANHO
            </span>
            <span
              className={`font-bold px-2 py-1 text-[20px] rounded border ${temaPonto.tamanho}`}
            >
              {pedido.tamanhoNome}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Acompanhamentos
      </p>
      <div className="space-y-1.5 mb-4">
        {acompanhamentosSelecionados.map((item, index) => (
          <div
            key={`s-${index}`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
          >
            <span className="text-green-500 font-bold">✓</span>
            <span>{item}</span>
          </div>
        ))}
        {itensRemovidos.map((item, index) => (
          <div
            key={`r-${index}`}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <span className="font-bold" aria-hidden>
              ✗
            </span>
            <span>{item}</span>
            <span className="text-xs text-red-500 dark:text-red-400/80">
              (removido)
            </span>
          </div>
        ))}
      </div>

      {itens.filter((i) => !acompanhamentosSelecionados.includes(i)).length >
        0 && (
        <>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Demais itens
          </p>
          <div className="space-y-1.5 mb-4">
            {itens
              .filter((i) => !acompanhamentosSelecionados.includes(i))
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
                >
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
          </div>
        </>
      )}

      {pedido.observacoes && (
        <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200 text-sm font-semibold flex items-start gap-2">
          <span>⚠️</span>
          <span>Obs: {pedido.observacoes}</span>
        </div>
      )}

      {/* Rodapé (exemplo): esquerda = imprimir, direita = valor + status + botão */}
      <div className="flex flex-col gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            {onPrint && (
              <Button
                variant="ghost"
                onClick={() => onPrint(pedido)}
                className="p-2 min-h-[44px] min-w-[44px] h-auto text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                title="Imprimir Comanda"
              >
                🖨️
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="font-bold text-gray-800 dark:text-gray-100">
              R$ {pedido.valorTotal.toFixed(2)}
            </span>
            <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
            {onUpdateStatus && (
              <>
                {pedido.status === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(pedido.numero, 'preparado')}
                    className="min-h-[44px]"
                  >
                    Iniciar Preparo
                  </Button>
                )}
                {pedido.status === 'preparado' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onUpdateStatus(pedido.numero, 'entregue')}
                    className="min-h-[44px]"
                  >
                    Marcar Entregue
                  </Button>
                )}
                {pedido.status === 'entregue' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUpdateStatus(pedido.numero, 'pendente')}
                    className="min-h-[44px]"
                  >
                    Reabrir
                  </Button>
                )}
                {pedido.status === 'cancelado' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUpdateStatus(pedido.numero, 'pendente')}
                    className="min-h-[44px]"
                  >
                    Reabrir
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
