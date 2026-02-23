import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  data: {
    nome: string
    quantidade: number
    itens: string[]
    observacoes: string
    valorTotal: number
    pontoEntrega: string
  }
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, loading, data }: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-orange-50 dark:bg-orange-900/30 p-6 border-b border-orange-100 dark:border-orange-800/50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Confirme seu Pedido 📝
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Verifique se está tudo certinho antes de enviar.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Cliente</span>
            <span className="font-bold text-gray-900 dark:text-white text-lg">{data.nome}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Quantidade</span>
            <span className="font-bold text-gray-900 dark:text-white text-lg">{data.quantidade}x Marmitas</span>
          </div>

          <div className="py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="block text-gray-500 dark:text-gray-400 mb-2">Itens Selecionados</span>
            <div className="flex flex-wrap gap-2">
              {data.itens.map(item => (
                <span key={item} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {data.observacoes && (
            <div className="py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="block text-gray-500 dark:text-gray-400 mb-1">Observações</span>
              <p className="text-gray-800 dark:text-gray-200 italic bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                "{data.observacoes}"
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-500 dark:text-gray-400">Entrega</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">{data.pontoEntrega}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Total Final</span>
            <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
              R$ {data.valorTotal.toFixed(2)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <Button 
              onClick={onClose}
              variant="secondary"
              className="h-12 font-bold text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Voltar
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={loading}
              className="h-12 text-lg font-bold bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-lg shadow-green-600/20 dark:shadow-green-600/30"
            >
              {loading ? 'Enviando...' : 'Confirmar ✅'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
