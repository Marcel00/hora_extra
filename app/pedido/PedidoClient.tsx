'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

import { createPedido } from './actions'
import { ConfirmationModal } from '@/components/ConfirmationModal'

interface ItemCardapio {
  id: string
  nome: string
  categoria: string
  disponivel: boolean
  maxSelecoes: number
}

interface Cardapio {
  id: string
  preco: number
  itens: ItemCardapio[]
}

interface PontoEntrega {
  id: string
  nome: string
  horario: string
}

interface PedidoClientProps {
  cardapio: Cardapio | null
  pontoEntrega: PontoEntrega
  pedidosAbertos: boolean
}

export function PedidoClient({ cardapio, pontoEntrega, pedidosAbertos }: PedidoClientProps) {
  const router = useRouter()
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Auto-scroll ref
  const bottomRef = useRef<HTMLDivElement>(null)

  if (!pedidosAbertos) {
    return (
      <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="max-w-md text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
            Pedidos Fechados
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Pedidos abrem das 08h às 11h
          </p>
          <Button onClick={() => router.push('/')} variant="primary">
            ← Voltar para Início
          </Button>
        </Card>
      </main>
    )
  }

  if (!cardapio) {
    return (
      <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="max-w-md text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
            Cardápio Indisponível
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Não há cardápio ativo no momento
          </p>
          <Button onClick={() => router.push('/')} variant="primary">
            ← Voltar para Início
          </Button>
        </Card>
      </main>
    )
  }

  if (sucesso) {
    return (
      <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Olá <strong>{nomeCliente}</strong>!
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Seu pedido foi recebido com sucesso e será entregue em <strong>{pontoEntrega.nome}</strong> às <strong>{pontoEntrega.horario}</strong>.
          </p>
          <Button onClick={() => router.push('/')} variant="primary" className="w-full">
            Fazer Outro Pedido
          </Button>
        </Card>
      </main>
    )
  }

  const toggleItem = (itemNome: string, categoria: string) => {
    // Get all items in the same category that are selected
    const itemsInCategory = cardapio.itens.filter(
      (i) => i.categoria === categoria && i.disponivel
    )
    const selectedInCategory = itensSelecionados.filter((nome) =>
      itemsInCategory.some((i) => i.nome === nome)
    )

    // Find the maxSelecoes for this category (use first item's maxSelecoes)
    const maxSelecoes =
      itemsInCategory.find((i) => i.nome === itemNome)?.maxSelecoes || 99

    // If trying to select and already at max
    if (
      !itensSelecionados.includes(itemNome) &&
      selectedInCategory.length >= maxSelecoes
    ) {
      alert(`Você já atingiu o limite de ${maxSelecoes} seleções para esta categoria`)
      return
    }

    setItensSelecionados((prev) =>
      prev.includes(itemNome)
        ? prev.filter((i) => i !== itemNome)
        : [...prev, itemNome]
    )
  }

  const valorTotal = cardapio.preco * quantidade

  const handleOpenModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!nomeCliente || !quantidade) {
      alert('Por favor, preencha seu nome e a quantidade.')
      return
    }

    if (itensSelecionados.length === 0) {
      alert('Selecione pelo menos um item do cardápio')
      return
    }
    
    setIsModalOpen(true)
  }

  const handleConfirmOrder = async () => {
    setLoading(true)
    const result = await createPedido({
      nomeCliente,
      telefone,
      quantidade,
      itens: itensSelecionados,
      observacoes,
      valorTotal,
      pontoEntregaId: pontoEntrega.id,
    })

    setLoading(false)
    setIsModalOpen(false)

    if (result.success) {
      setSucesso(true)
    } else {
      alert('Erro ao criar pedido. Tente novamente.')
    }
  }

  const categorias = {
    acompanhamento: { 
      label: '🍚 Acompanhamentos', 
      itens: cardapio.itens.filter(i => i.categoria === 'acompanhamento' && i.disponivel),
      maxSelecoes: cardapio.itens.find(i => i.categoria === 'acompanhamento')?.maxSelecoes || 99
    },
    proteina: { 
      label: '🍖 Proteínas', 
      itens: cardapio.itens.filter(i => i.categoria === 'proteina' && i.disponivel),
      maxSelecoes: cardapio.itens.find(i => i.categoria === 'proteina')?.maxSelecoes || 99
    },
    extra: { 
      label: '➕ Extras', 
      itens: cardapio.itens.filter(i => i.categoria === 'extra' && i.disponivel),
      maxSelecoes: cardapio.itens.find(i => i.categoria === 'extra')?.maxSelecoes || 99
    },
  }

  // Helper component for Selectable Card
  const SelectableCard = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-24
        ${selected 
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md scale-105' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700'
        }
      `}
    >
      <span className={`font-semibold ${selected ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
      {selected && (
        <div className="mt-1 text-orange-500 text-xs font-bold">
          ✓ SELECIONADO
        </div>
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <ThemeToggle />
      
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Unidade</h2>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{pontoEntrega.nome}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600 dark:text-green-500 font-bold bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
              • Aberto Agora
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-8">
        
        {/* Intro */}
        <div className="mt-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Monte sua Marmita 🍱
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Escolha os ingredientes fresquinhos de hoje.
          </p>
        </div>

        {/* Dados Pessoais */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
             1. Seus Dados
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Qual seu nome?
              </label>
              <Input
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Ex: João Silva"
                className="h-12 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp (Opcional)
              </label>
              <Input
                type="tel"
                value={telefone}
                onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 11) value = value.slice(0, 11)
                    
                    if (value.length > 2) {
                      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
                    }
                    if (value.length > 9) {
                      value = `${value.slice(0, 9)}-${value.slice(9)}`
                    }
                    setTelefone(value)
                }}
                placeholder="(61) 99999-9999"
                className="h-12 text-lg"
                maxLength={15}
              />
            </div>
          </div>
        </section>

        {/* Quantidade */}
        <section className="space-y-4">
           <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
             2. Tamanho da Fome
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-400">Quantidade de Marmitas</span>
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2">
                <button 
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-xs flex items-center justify-center text-xl font-bold text-orange-600"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{quantidade}</span>
                <button 
                  onClick={() => setQuantidade(Math.min(10, quantidade + 1))}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-xs flex items-center justify-center text-xl font-bold text-orange-600"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-right text-sm text-gray-500">
              Valor unitário: R$ {cardapio.preco.toFixed(2)}
            </p>
          </div>
        </section>

        {/* Itens do Cardápio */}
        <div className="space-y-8">
           {Object.entries(categorias).map(([key, { label, itens }]) => {
             if (itens.length === 0) return null
             return (
              <section key={key} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-l-4 border-orange-500 pl-3">
                  {label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {itens.map((item) => (
                    <SelectableCard
                      key={item.id}
                      label={item.nome}
                      selected={itensSelecionados.includes(item.nome)}
                      onClick={() => toggleItem(item.nome, item.categoria)}
                    />
                  ))}
                </div>
              </section>
             )
           })}
        </div>

        {/* Observações */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Alguma observação?
          </h3>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Sem cebola, capricha na farofa..."
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-600 transition-colors min-h-32 text-lg shadow-xs"
          />
        </section>

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 pb-8 z-50">
        <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total do Pedido</p>
            <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-500">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            disabled={loading || itensSelecionados.length === 0}
            className="flex-1 max-w-xs h-14 text-lg font-bold rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 text-white transition-all transform hover:scale-105 active:scale-95"
          >
            {loading ? 'Enviando...' : `Continuar ➔`}
          </Button>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmOrder}
        loading={loading}
        data={{
          nome: nomeCliente,
          quantidade,
          itens: itensSelecionados,
          observacoes,
          valorTotal,
          pontoEntrega: pontoEntrega.nome
        }}
      />

    </main>
  )
}
