'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

import { createPedido, sendWhatsAppComanda } from './actions';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface Tamanho {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
}

interface ItemCardapio {
  id: string;
  nome: string;
  categoria: string;
  disponivel: boolean;
  maxSelecoes: number;
}

interface Cardapio {
  id: string;
  preco: number;
  itens: ItemCardapio[];
  tamanhos: Tamanho[];
}

interface PontoEntrega {
  id: string;
  nome: string;
  horario: string;
}

interface PedidoClientProps {
  cardapio: Cardapio | null;
  pontoEntrega: PontoEntrega;
  pedidosAbertos: boolean;
}

// Cores por ponto (igual ao card da cozinha): Cebraspe = azul, Quiosque Laranjinha = laranja
const pontoTheme: Record<
  string,
  {
    mainBg: string;
    headerBorder: string;
    nome: string;
    accent: string;
    accentHover: string;
    selectedBorder: string;
    selectedBg: string;
    selectedText: string;
    sectionBorder: string;
    inputFocus: string;
    buttonBg: string;
    buttonHover: string;
    spinner: string;
  }
> = {
  Cebraspe: {
    mainBg: 'bg-gray-50 dark:bg-gray-900',
    headerBorder: 'border-blue-500 dark:border-blue-400',
    nome: 'text-blue-700 dark:text-blue-400',
    accent: 'text-blue-600 dark:text-blue-400',
    accentHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    selectedBorder: 'border-blue-500 dark:border-blue-400',
    selectedBg: 'bg-blue-50 dark:bg-blue-900/20',
    selectedText: 'text-blue-700 dark:text-blue-400',
    sectionBorder: 'border-l-blue-500',
    inputFocus: 'focus:border-blue-500 dark:focus:border-blue-500',
    buttonBg:
      'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
    buttonHover: 'hover:border-blue-400 dark:hover:border-blue-500',
    spinner: 'border-blue-500 border-t-transparent',
  },
  'Quiosque Laranjinha': {
    mainBg: 'bg-gray-50 dark:bg-gray-900',
    headerBorder: 'border-orange-500 dark:border-orange-400',
    nome: 'text-orange-700 dark:text-orange-400',
    accent: 'text-orange-600 dark:text-orange-500',
    accentHover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
    selectedBorder: 'border-orange-500 dark:border-orange-400',
    selectedBg: 'bg-orange-50 dark:bg-orange-900/20',
    selectedText: 'text-orange-700 dark:text-orange-400',
    sectionBorder: 'border-l-orange-500',
    inputFocus: 'focus:border-orange-500 dark:focus:border-orange-600',
    buttonBg:
      'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700',
    buttonHover: 'hover:border-orange-300 dark:hover:border-orange-700',
    spinner: 'border-orange-500 border-t-transparent',
  },
};

function getPontoTheme(pontoNome: string) {
  return pontoTheme[pontoNome] ?? pontoTheme['Quiosque Laranjinha'];
}

export function PedidoClient({
  cardapio,
  pontoEntrega,
  pedidosAbertos,
}: PedidoClientProps) {
  const router = useRouter();
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(
    () => {
      if (!cardapio?.tamanhos || cardapio.tamanhos.length === 0) return null;
      // Sempre preferir "Grande" quando existir
      const grande = cardapio.tamanhos.find(
        (t) => t.nome.toLowerCase() === 'grande'
      );
      if (grande) return grande;
      // Se tiver apenas um tamanho, já seleciona ele
      if (cardapio.tamanhos.length === 1) return cardapio.tamanhos[0];
      return null;
    }
  );
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const [acompanhamentosRemovidos, setAcompanhamentosRemovidos] = useState<
    string[]
  >([]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [whatsappEnviado, setWhatsappEnviado] = useState<boolean | null>(null);
  const [whatsappErro, setWhatsappErro] = useState<string | null>(null);
  const [pedidoNumeroCriado, setPedidoNumeroCriado] = useState<number | null>(null);
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const acompanhamentosInicializados = useRef(false);
  const submittingRef = useRef(false);
  const abrirModalQuandoTamanhoPronto = useRef(false);

  const telefoneDigits = telefone.replace(/\D/g, '');
  const nomeOk = nomeCliente.trim().length > 0;
  // WhatsApp (Brasil): DDD (2) + número (9) = 11 dígitos
  const telefoneOk = telefoneDigits.length >= 11;

  const selecionadosPorCategoria = (categoria: string) =>
    itensSelecionados.filter((id) => {
      const item = cardapio?.itens.find((i) => i.id === id);
      return item?.categoria === categoria && item?.disponivel;
    });

  const temAcompanhamento =
    selecionadosPorCategoria('acompanhamento').length > 0;
  const temProteina = selecionadosPorCategoria('proteina').length > 0;

  // Garante que o "Grande" fique selecionado por padrão quando existir.
  // Não sobrescreve a escolha do usuário caso ele já tenha selecionado outro.
  useEffect(() => {
    if (tamanhoSelecionado) return
    const grande = cardapio?.tamanhos?.find(
      (t) => t.nome.toLowerCase() === 'grande'
    )
    if (grande) setTamanhoSelecionado(grande)
  }, [cardapio, tamanhoSelecionado])

  // Acompanhamentos: começar todos marcados; clique desmarca/marca. Estado por id para não vincular itens de mesmo nome em categorias diferentes.
  useEffect(() => {
    if (!cardapio?.itens || acompanhamentosInicializados.current) return;
    acompanhamentosInicializados.current = true;
    const acompanhamentos = cardapio.itens.filter(
      (i) => i.categoria === 'acompanhamento' && i.disponivel
    );
    setItensSelecionados((prev) => {
      if (prev.length > 0) return prev;
      return acompanhamentos.map((i) => i.id);
    });
  }, [cardapio]);

  // No Laranjinha, ao clicar Continuar sem tamanho selecionado, definimos Grande e abrimos o modal após o estado atualizar
  useEffect(() => {
    if (!abrirModalQuandoTamanhoPronto.current || !tamanhoSelecionado) return;
    abrirModalQuandoTamanhoPronto.current = false;
    if (!nomeOk || !quantidade) {
      alert('Por favor, preencha seu nome e a quantidade.');
      return;
    }
    if (!telefoneOk) {
      alert('Por favor, preencha seu telefone para receber a comanda.');
      return;
    }
    if (!temAcompanhamento) {
      alert('Selecione pelo menos 1 acompanhamento.');
      return;
    }
    if (!temProteina) {
      alert('Selecione pelo menos 1 proteína.');
      return;
    }
    setIsModalOpen(true);
  }, [
    tamanhoSelecionado,
    nomeOk,
    telefoneOk,
    temAcompanhamento,
    temProteina,
    quantidade,
  ]);

  const temaPonto = getPontoTheme(pontoEntrega?.nome ?? 'Quiosque Laranjinha');

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
    );
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
    );
  }

  if (sucesso) {
    return (
      <main
        className={`min-h-screen ${temaPonto.mainBg} flex items-center justify-center p-4`}
      >
        <ThemeToggle />
        <Card
          className={`max-w-md text-center border-2 ${temaPonto.selectedBorder}`}
        >
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Olá <strong>{nomeCliente}</strong>!
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Seu pedido foi recebido com sucesso e será entregue em{' '}
            <strong>{pontoEntrega.nome}</strong> às{' '}
            <strong>{pontoEntrega.horario}</strong>.
          </p>
          {whatsappEnviado === null && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Enviando comanda pelo WhatsApp...
            </p>
          )}

          {whatsappEnviado === true && (
            <p className="text-green-600 dark:text-green-400 text-sm mb-4">
              ✓ Comanda enviada por WhatsApp para você.
            </p>
          )}

          {whatsappEnviado === false && (
            <div className="mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">
                Não conseguimos enviar a comanda pelo WhatsApp agora. Se não chegar em alguns minutos, você pode pedir para reenviar.
              </p>
              {whatsappErro && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {whatsappErro}
                </p>
              )}
              <Button
                onClick={handleRetryWhatsApp}
                disabled={enviandoWhatsApp}
                className={`w-full mt-3 ${temaPonto.buttonBg}`}
              >
                {enviandoWhatsApp ? 'Enviando...' : 'Reenviar WhatsApp'}
              </Button>
            </div>
          )}
          <Button
            onClick={() => router.push('/')}
            className={`w-full ${temaPonto.buttonBg}`}
          >
            Fazer Outro Pedido
          </Button>
        </Card>
      </main>
    );
  }

  const toggleItem = (item: ItemCardapio) => {
    const categoria = item.categoria;
    const itemsInCategory = cardapio.itens.filter(
      (i) => i.categoria === categoria && i.disponivel
    );
    const selectedInCategory = itensSelecionados.filter((id) =>
      itemsInCategory.some((i) => i.id === id)
    );

    // Proteínas: permitir apenas uma opção; ao escolher outra, a anterior é desmarcada
    if (categoria === 'proteina') {
      setItensSelecionados((prev) => {
        const semProteinas = prev.filter(
          (id) => !itemsInCategory.some((i) => i.id === id)
        );
        if (prev.includes(item.id)) {
          return semProteinas;
        }
        return [...semProteinas, item.id];
      });
      return;
    }

    // Extras: sem limite de quantidade; cada um soma R$ 10 no cálculo do preço
    if (categoria === 'extra') {
      setItensSelecionados((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
      return;
    }

    // Acompanhamentos: ao desmarcar, registrar em acompanhamentosRemovidos (para a cozinha ver o que não colocar)
    if (categoria === 'acompanhamento') {
      setItensSelecionados((prev) => {
        if (prev.includes(item.id)) {
          setAcompanhamentosRemovidos((r) =>
            r.includes(item.nome) ? r : [...r, item.nome]
          );
          return prev.filter((id) => id !== item.id);
        }
        setAcompanhamentosRemovidos((r) => r.filter((n) => n !== item.nome));
        return [...prev, item.id];
      });
      return;
    }

    const maxSelecoes = item.maxSelecoes ?? 99;
    if (
      !itensSelecionados.includes(item.id) &&
      selectedInCategory.length >= maxSelecoes
    ) {
      alert(
        `Você já atingiu o limite de ${maxSelecoes} seleções para esta categoria`
      );
      return;
    }

    setItensSelecionados((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  // Preço Dinâmico
  const calculoPreco = (() => {
    if (!cardapio)
      return {
        totalGeral: 0,
        detalhes: {
          base: 0,
          proteinasExtras: { qtd: 0, valor: 0 },
          extras: { qtd: 0, valor: 0 },
        },
      };

    // Preço base vem do tamanho selecionado ou do cardápio legado
    const precoBase = tamanhoSelecionado
      ? tamanhoSelecionado.preco
      : cardapio.preco;

    // Identificar itens selecionados com seus dados completos (por id)
    const itensCompletos = itensSelecionados
      .map((id) => cardapio.itens.find((i) => i.id === id))
      .filter((item): item is ItemCardapio => !!item);

    // Regra 1: Mais de 2 proteínas = +5.00 cada extra
    const proteinas = itensCompletos.filter((i) => i.categoria === 'proteina');
    const qtdProteinasExtras = Math.max(0, proteinas.length - 2);
    const valorProteinasExtras = qtdProteinasExtras * 5.0;

    // Regra 2: Itens extras = +10.00 cada
    const extras = itensCompletos.filter((i) => i.categoria === 'extra');
    const valorExtras = extras.length * 10.0;

    // Total Unitário
    const totalUnitario = precoBase + valorProteinasExtras + valorExtras;
    const totalGeral = totalUnitario * quantidade;

    return {
      totalGeral,
      detalhes: {
        base: precoBase,
        proteinasExtras: {
          qtd: qtdProteinasExtras,
          valor: valorProteinasExtras,
        },
        extras: { qtd: extras.length, valor: valorExtras },
      },
    };
  })();

  const valorTotal = calculoPreco.totalGeral;

  const handleOpenModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      cardapio?.tamanhos &&
      cardapio.tamanhos.length > 0 &&
      !tamanhoSelecionado
    ) {
      const grande = cardapio.tamanhos.find(
        (t) => t.nome.toLowerCase() === 'grande'
      );
      if (pontoEntrega.nome === 'Quiosque Laranjinha' && grande) {
        abrirModalQuandoTamanhoPronto.current = true;
        setTamanhoSelecionado(grande);
        return;
      }
      alert('Por favor, selecione o tamanho da marmita.');
      sizesRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!nomeOk || !quantidade) {
      alert('Por favor, preencha seu nome e a quantidade.');
      return;
    }
    if (!telefoneOk) {
      alert('Por favor, preencha seu telefone para receber a comanda.');
      return;
    }
    if (!temAcompanhamento) {
      alert('Selecione pelo menos 1 acompanhamento.');
      return;
    }
    if (!temProteina) {
      alert('Selecione pelo menos 1 proteína.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    // Mantém o modal aberto com loading enquanto envia (pedido + WhatsApp)

    try {
      if (!tamanhoSelecionado) {
        setLoading(false);
        submittingRef.current = false;
        setIsModalOpen(true);
        alert('Por favor, selecione o tamanho da marmita.');
        return;
      }
      if (!nomeOk || !quantidade) {
        setLoading(false);
        submittingRef.current = false;
        setIsModalOpen(true);
        alert('Por favor, preencha seu nome e a quantidade.');
        return;
      }
      if (!telefoneOk) {
        setLoading(false);
        submittingRef.current = false;
        setIsModalOpen(true);
        alert('Por favor, preencha seu telefone para receber a comanda.');
        return;
      }
      if (!temAcompanhamento) {
        setLoading(false);
        submittingRef.current = false;
        setIsModalOpen(true);
        alert('Selecione pelo menos 1 acompanhamento.');
        return;
      }
      if (!temProteina) {
        setLoading(false);
        submittingRef.current = false;
        setIsModalOpen(true);
        alert('Selecione pelo menos 1 proteína.');
        return;
      }

      const itensNomes = itensSelecionados
        .map((id) => cardapio.itens.find((i) => i.id === id)?.nome)
        .filter((n): n is string => !!n);
      if (itensNomes.length === 0) {
        setLoading(false);
        submittingRef.current = false;
        setIsModalOpen(true);
        alert('Nenhum item válido no pedido. Selecione os itens novamente.');
        return;
      }
      const acompanhamentosSelecionados = itensSelecionados
        .filter((id) => {
          const i = cardapio.itens.find((x) => x.id === id);
          return i?.categoria === 'acompanhamento';
        })
        .map((id) => cardapio.itens.find((x) => x.id === id)!.nome);
      const result = await createPedido({
        nomeCliente,
        telefone,
        quantidade,
        tamanhoId: tamanhoSelecionado?.id,
        tamanhoNome: tamanhoSelecionado?.nome,
        itens: itensNomes,
        acompanhamentosSelecionados,
        itensRemovidos: acompanhamentosRemovidos,
        observacoes,
        valorTotal,
        pontoEntregaId: pontoEntrega.id,
      });

      if (result.success && result.pedido) {
        setIsModalOpen(false);
        setSucesso(true);
        setPedidoNumeroCriado(result.pedido.numero);
        setWhatsappErro(null);
        setWhatsappEnviado(null);
        // Dispara o WhatsApp em segundo plano; quando terminar, mostra "enviado com sucesso" se deu certo
        sendWhatsAppComanda(result.pedido.numero)
          .then((r) => {
            setWhatsappEnviado(r.enviadoCliente);
            setWhatsappErro(r.erroCliente ?? r.erroGeral ?? null);
          })
          .catch((e) => {
            setWhatsappEnviado(false);
            const msg = e instanceof Error ? e.message : 'Falha ao enviar no WhatsApp.';
            setWhatsappErro(msg);
          });
      } else if (!result.success) {
        setIsModalOpen(true);
        alert(result.error ?? 'Erro ao criar pedido. Tente novamente.');
      }
    } catch (err) {
      setIsModalOpen(true);
      let msg =
        'Falha ao enviar o pedido. Verifique sua conexão e tente novamente.';
      if (err instanceof Error) msg = err.message;
      else if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      )
        msg = (err as { message: string }).message;
      alert(msg);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  async function handleRetryWhatsApp() {
    if (!pedidoNumeroCriado || enviandoWhatsApp) return
    setEnviandoWhatsApp(true)
    setWhatsappErro(null)
    try {
      const r = await sendWhatsAppComanda(pedidoNumeroCriado)
      setWhatsappEnviado(r.enviadoCliente)
      setWhatsappErro(r.erroCliente ?? r.erroGeral ?? null)
    } catch (e) {
      setWhatsappEnviado(false)
      const msg = e instanceof Error ? e.message : 'Falha ao enviar no WhatsApp.'
      setWhatsappErro(msg)
    } finally {
      setEnviandoWhatsApp(false)
    }
  }

  const categorias = {
    acompanhamento: {
      label: '🍚 Acompanhamentos',
      itens: cardapio.itens.filter(
        (i) => i.categoria === 'acompanhamento' && i.disponivel
      ),
      maxSelecoes:
        cardapio.itens.find((i) => i.categoria === 'acompanhamento')
          ?.maxSelecoes || 99,
    },
    proteina: {
      label: '🍖 Proteínas',
      itens: cardapio.itens.filter(
        (i) => i.categoria === 'proteina' && i.disponivel
      ),
      maxSelecoes:
        cardapio.itens.find((i) => i.categoria === 'proteina')?.maxSelecoes ||
        99,
    },
    extra: {
      label: '➕ Extras',
      itens: cardapio.itens.filter(
        (i) => i.categoria === 'extra' && i.disponivel
      ),
      maxSelecoes:
        cardapio.itens.find((i) => i.categoria === 'extra')?.maxSelecoes || 99,
    },
  };

  // Helper component for Selectable Card (usa cores do ponto)
  const SelectableCard = ({
    label,
    selected,
    onClick,
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-24
        ${
          selected
            ? `${temaPonto.selectedBorder} ${temaPonto.selectedBg} shadow-md scale-105`
            : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${temaPonto.buttonHover}`
        }
      `}
    >
      <span
        className={`font-semibold ${selected ? temaPonto.selectedText : 'text-gray-700 dark:text-gray-300'}`}
      >
        {label}
      </span>
      {selected && (
        <div className={`mt-1 ${temaPonto.accent} text-xs font-bold`}>
          ✓ SELECIONADO
        </div>
      )}
    </div>
  );

  return (
    <main className={`min-h-screen ${temaPonto.mainBg} pb-32`}>
      <ThemeToggle />

      {/* Overlay "Enviando..." assim que o usuário confirma (feedback imediato) */}
      {loading && (
        <div className="fixed inset-0 z-90 flex flex-col items-center justify-center gap-4 bg-gray-900/80 dark:bg-gray-950/90 backdrop-blur-sm">
          <div
            className={`w-12 h-12 border-4 rounded-full animate-spin ${temaPonto.spinner}`}
          />
          <p className="text-white text-lg font-semibold">
            Enviando seu pedido...
          </p>
          <p className="text-gray-400 text-sm">Aguarde um instante</p>
        </div>
      )}

      {/* Sticky Top Header */}
      <div
        className={`sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b-4 ${temaPonto.headerBorder} shadow-xs`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 overflow-hidden rounded-xl shrink-0 bg-white/60 dark:bg-gray-900/60">
              <Image
                src="/logo.png"
                alt="Hora Extra"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                Unidade
              </h2>
              <p
                className={`text-base sm:text-lg font-bold truncate ${temaPonto.nome}`}
              >
                {pontoEntrega.nome}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-green-600 dark:text-green-500 font-bold bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
              • Aberto Agora
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl space-y-6 sm:space-y-8">
        {/* Intro */}
        <div className="mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Monte sua Marmita 🍱
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Escolha os ingredientes fresquinhos de hoje.
          </p>
        </div>

        {/* Escolha do Tamanho */}
        {(() => {
          const isCebraspe = pontoEntrega.nome
            .toLowerCase()
            .includes('cebraspe');
          const isLaranjinha = pontoEntrega.nome
            .toLowerCase()
            .includes('laranjinha');

          const tamanhosDisponiveis =
            cardapio.tamanhos?.filter((t) => {
              if (!t.ativo) return false;
              const nomeLower = t.nome.toLowerCase();
              const isPequena = nomeLower.includes('pequena');
              const isGrande = nomeLower.includes('grande');
              if (isCebraspe) return true;
              if (isLaranjinha) return isGrande;
              return !isPequena && !isGrande;
            }) || [];

          if (tamanhosDisponiveis.length === 0) return null;

          // Auto-select if only one option and none selected
          if (tamanhosDisponiveis.length === 1 && !tamanhoSelecionado) {
            setTamanhoSelecionado(tamanhosDisponiveis[0]);
          }

          return (
            <section className="space-y-4" ref={sizesRef}>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                Escolha o Tamanho
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {tamanhosDisponiveis.map((tamanho) => (
                  <div
                    key={tamanho.id}
                    onClick={() => setTamanhoSelecionado(tamanho)}
                    className={`
                      cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center
                      ${
                        tamanhoSelecionado?.id === tamanho.id
                          ? `${temaPonto.selectedBorder} ${temaPonto.selectedBg} shadow-md scale-105`
                          : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${temaPonto.buttonHover}`
                      }
                    `}
                  >
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {tamanho.nome}
                    </span>
                    <span
                      className={`text-lg font-bold mt-2 ${temaPonto.accent}`}
                    >
                      R$ {tamanho.preco.toFixed(2)}
                    </span>
                    {tamanhoSelecionado?.id === tamanho.id && (
                      <div
                        className={`mt-2 ${temaPonto.accent} text-xs font-bold`}
                      >
                        ✓ SELECIONADO
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Dados Pessoais */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            Seus Dados
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
                Seu WhatsApp (para receber a comanda)
              </label>
              <Input
                type="tel"
                value={telefone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11)

                  if (digits.length <= 2) {
                    setTelefone(digits)
                    return
                  }

                  const ddd = digits.slice(0, 2)
                  const numero = digits.slice(2) // até 9 dígitos

                  // Mascara progressiva: (99) 99999-9999
                  if (numero.length <= 5) {
                    setTelefone(`(${ddd}) ${numero}`)
                    return
                  }

                  const parte1 = numero.slice(0, 5)
                  const parte2 = numero.slice(5)
                  setTelefone(`(${ddd}) ${parte1}-${parte2}`)
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
            Tamanho da Fome
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-400">
                Quantidade de Marmitas
              </span>
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2">
                <button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-xs flex items-center justify-center text-xl font-bold ${temaPonto.accent}`}
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">
                  {quantidade}
                </span>
                <button
                  onClick={() => setQuantidade(Math.min(10, quantidade + 1))}
                  className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-xs flex items-center justify-center text-xl font-bold ${temaPonto.accent}`}
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-right text-sm text-gray-500">
              Valor unitário: R$ {calculoPreco.detalhes.base.toFixed(2)}
            </p>
          </div>
        </section>

        {/* Itens do Cardápio */}
        <div className="space-y-8">
          {Object.entries(categorias).map(([key, { label, itens }]) => {
            if (itens.length === 0) return null;
            return (
              <section key={key} className="space-y-4">
                <h3
                  className={`text-xl font-bold text-gray-800 dark:text-gray-200 border-l-4 pl-3 ${temaPonto.sectionBorder}`}
                >
                  {label}
                </h3>
                {key === 'acompanhamento' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    Se algum acompanhamento não for do seu gosto, clique nele
                    para desmarcar.
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {itens.map((item) => (
                    <SelectableCard
                      key={item.id}
                      label={item.nome}
                      selected={itensSelecionados.includes(item.id)}
                      onClick={() => toggleItem(item)}
                    />
                  ))}
                </div>
              </section>
            );
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
            className={`w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none ${temaPonto.inputFocus} transition-colors min-h-32 text-lg shadow-xs`}
          />
        </section>

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 pb-8 z-50">
        <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total do Pedido
            </p>
            <p className={`text-2xl font-extrabold ${temaPonto.accent}`}>
              R$ {valorTotal.toFixed(2)}
            </p>
            {(calculoPreco.detalhes?.proteinasExtras.valor > 0 ||
              calculoPreco.detalhes?.extras.valor > 0) && (
              <p className={`text-xs ${temaPonto.accent}`}>
                (Inclui +R${' '}
                {(
                  calculoPreco.detalhes.proteinasExtras.valor +
                  calculoPreco.detalhes.extras.valor
                ).toFixed(2)}{' '}
                de adicionais)
              </p>
            )}
          </div>
          <Button
            onClick={() => handleOpenModal()}
            disabled={
              loading ||
              !nomeOk ||
              !telefoneOk ||
              !temAcompanhamento ||
              !temProteina
            }
            className={`flex-1 max-w-xs h-14 text-lg font-bold rounded-full shadow-lg text-white transition-all transform hover:scale-105 active:scale-95 ${temaPonto.buttonBg}`}
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
          itens: itensSelecionados
            .map((id) => cardapio.itens.find((i) => i.id === id)?.nome)
            .filter((n): n is string => !!n),
          observacoes,
          valorTotal,
          pontoEntrega: pontoEntrega.nome,
        }}
      />
    </main>
  );
}
